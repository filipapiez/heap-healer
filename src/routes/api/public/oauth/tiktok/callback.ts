import { createFileRoute } from "@tanstack/react-router";

// Native TikTok OAuth v2 callback.
// Register this exact URL in TikTok Developer Portal → Login Kit → Redirect URI:
//   https://mentionmyapp.com/api/public/oauth/tiktok/callback

export const Route = createFileRoute("/api/public/oauth/tiktok/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { exchangeTikTokCode, fetchTikTokUser } = await import("@/lib/tiktok.server");

        function finish(status: "ok" | "error", message: string) {
          const target = new URL("/accounts", url.origin);
          target.searchParams.set("tiktok", status);
          target.searchParams.set("msg", message);
          return new Response(null, {
            status: 302,
            headers: { location: target.toString() },
          });
        }

        if (errorParam) return finish("error", errorParam);
        if (!code || !state) return finish("error", "missing_code_or_state");

        const { data: stateRow, error: stateErr } = await supabaseAdmin
          .from("oauth_states" as never)
          .select("state, provider, workspace_id, user_id, redirect_origin, expires_at")
          .eq("state", state)
          .maybeSingle();
        if (stateErr || !stateRow) return finish("error", "invalid_state");
        const row = stateRow as unknown as {
          provider: string;
          workspace_id: string;
          user_id: string;
          redirect_origin: string;
          expires_at: string;
        };
        await supabaseAdmin.from("oauth_states" as never).delete().eq("state", state);

        if (row.provider !== "tiktok") return finish("error", "provider_mismatch");
        if (new Date(row.expires_at) < new Date()) return finish("error", "state_expired");

        const redirectUri = `${row.redirect_origin}/api/public/oauth/tiktok/callback`;

        try {
          const tokens = await exchangeTikTokCode({ code, redirectUri });
          const user = await fetchTikTokUser(tokens.access_token);

          const { data: acct, error: acctErr } = await supabaseAdmin
            .from("connected_accounts")
            .upsert(
              {
                workspace_id: row.workspace_id,
                platform: "tiktok",
                external_id: tokens.open_id,
                handle: user.username ?? null,
                display_name: user.display_name ?? user.username ?? "TikTok",
                avatar_url: user.avatar_url ?? null,
                status: "connected",
                error_message: null,
                connected_by: row.user_id,
                last_synced_at: new Date().toISOString(),
                metadata: { native: true, tiktok_open_id: tokens.open_id },
              },
              { onConflict: "workspace_id,platform,external_id" },
            )
            .select("id")
            .single();
          if (acctErr || !acct) {
            console.error("[tiktok-oauth] upsert failed", acctErr);
            return finish("error", "account_save_failed");
          }

          const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
          const refreshExpiresAt = tokens.refresh_expires_in
            ? new Date(Date.now() + tokens.refresh_expires_in * 1000).toISOString()
            : null;
          const { error: tokErr } = await supabaseAdmin
            .from("tiktok_oauth_tokens" as never)
            .upsert(
              {
                connected_account_id: acct.id,
                open_id: tokens.open_id,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                scope: tokens.scope,
                token_type: tokens.token_type ?? "Bearer",
                expires_at: expiresAt,
                refresh_expires_at: refreshExpiresAt,
              } as never,
              { onConflict: "connected_account_id" },
            );
          if (tokErr) {
            console.error("[tiktok-oauth] token save failed", tokErr);
            return finish("error", "token_save_failed");
          }

          return finish("ok", "connected");
        } catch (err) {
          console.error("[tiktok-oauth] callback failed", err);
          return finish("error", err instanceof Error ? err.message : "unknown_error");
        }
      },
    },
  },
});