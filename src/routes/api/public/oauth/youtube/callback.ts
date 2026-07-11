import { createFileRoute } from "@tanstack/react-router";

// Native YouTube OAuth callback. Registered in Google Cloud Console as:
//   https://mentionmyapp.com/api/public/oauth/youtube/callback
//   https://www.mentionmyapp.com/api/public/oauth/youtube/callback
//   https://heap-healer.lovable.app/api/public/oauth/youtube/callback
// (Preview and any custom origins must each be registered separately —
// Google requires exact-match redirect URIs.)

export const Route = createFileRoute("/api/public/oauth/youtube/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");

        // Load server-only modules inside the handler.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const {
          exchangeCodeForTokens,
          fetchOwnChannel,
        } = await import("@/lib/youtube.server");

        function finish(status: "ok" | "error", message: string) {
          const target = new URL("/accounts", url.origin);
          target.searchParams.set("youtube", status);
          target.searchParams.set("msg", message);
          return new Response(null, {
            status: 302,
            headers: { location: target.toString() },
          });
        }

        if (errorParam) return finish("error", errorParam);
        if (!code || !state) return finish("error", "missing_code_or_state");

        // Validate + consume the one-time state row.
        const { data: stateRow, error: stateErr } = await supabaseAdmin
          .from("oauth_states" as never)
          .select("state, provider, workspace_id, user_id, redirect_origin, expires_at")
          .eq("state", state)
          .maybeSingle();
        if (stateErr || !stateRow) return finish("error", "invalid_state");

        const row = stateRow as unknown as {
          state: string;
          provider: string;
          workspace_id: string;
          user_id: string;
          redirect_origin: string;
          expires_at: string;
        };

        // Best-effort delete so state can't be replayed.
        await supabaseAdmin.from("oauth_states" as never).delete().eq("state", state);

        if (row.provider !== "youtube") return finish("error", "provider_mismatch");
        if (new Date(row.expires_at) < new Date()) return finish("error", "state_expired");

        const redirectUri = `${row.redirect_origin}/api/public/oauth/youtube/callback`;

        try {
          const tokens = await exchangeCodeForTokens({ code, redirectUri });
          const channel = await fetchOwnChannel(tokens.access_token);

          // Upsert connected_accounts row (keyed on workspace + platform + external_id).
          const { data: accountRow, error: acctErr } = await supabaseAdmin
            .from("connected_accounts")
            .upsert(
              {
                workspace_id: row.workspace_id,
                platform: "youtube",
                external_id: channel?.id ?? null,
                handle: channel?.handle ?? null,
                display_name: channel?.title ?? "YouTube channel",
                avatar_url: channel?.thumbnailUrl ?? null,
                status: "connected",
                error_message: null,
                connected_by: row.user_id,
                last_synced_at: new Date().toISOString(),
                metadata: { native: true, channel_id: channel?.id ?? null },
              },
              { onConflict: "workspace_id,platform,external_id" },
            )
            .select("id")
            .single();
          if (acctErr || !accountRow) {
            console.error("[youtube-oauth] upsert account failed", acctErr);
            return finish("error", "account_save_failed");
          }

          const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
          const { error: tokErr } = await supabaseAdmin
            .from("youtube_oauth_tokens" as never)
            .upsert(
              {
                connected_account_id: accountRow.id,
                google_user_id: null,
                channel_id: channel?.id ?? null,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token ?? null,
                scope: tokens.scope,
                token_type: tokens.token_type ?? "Bearer",
                expires_at: expiresAt,
              } as never,
              { onConflict: "connected_account_id" },
            );
          if (tokErr) {
            console.error("[youtube-oauth] token save failed", tokErr);
            return finish("error", "token_save_failed");
          }

          return finish("ok", "connected");
        } catch (err) {
          console.error("[youtube-oauth] callback failed", err);
          return finish("error", err instanceof Error ? err.message : "unknown_error");
        }
      },
    },
  },
});