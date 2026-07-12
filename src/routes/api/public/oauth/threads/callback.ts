import { createFileRoute } from "@tanstack/react-router";

// Native Threads OAuth callback.
// Register this exact URL in the Meta app under "Use cases" → Threads API →
// Settings → Redirect Callback URLs:
//   https://mentionmyapp.com/api/public/oauth/threads/callback
//   https://www.mentionmyapp.com/api/public/oauth/threads/callback
//   https://heap-healer.lovable.app/api/public/oauth/threads/callback

export const Route = createFileRoute("/api/public/oauth/threads/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const {
          exchangeThreadsCode,
          exchangeThreadsLongLived,
          fetchThreadsProfile,
        } = await import("@/lib/meta.server");

        function finish(status: "ok" | "error", message: string) {
          const target = new URL("/accounts", url.origin);
          target.searchParams.set("threads", status);
          target.searchParams.set("msg", message);
          return new Response(null, { status: 302, headers: { location: target.toString() } });
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

        if (row.provider !== "threads") return finish("error", "provider_mismatch");
        if (new Date(row.expires_at) < new Date()) return finish("error", "state_expired");

        const redirectUri = `${row.redirect_origin}/api/public/oauth/threads/callback`;

        try {
          const short = await exchangeThreadsCode({ code, redirectUri });
          const long = await exchangeThreadsLongLived(short.access_token);
          const profile = await fetchThreadsProfile(long.access_token);

          const { data: acct, error: acctErr } = await supabaseAdmin
            .from("connected_accounts")
            .upsert(
              {
                workspace_id: row.workspace_id,
                platform: "threads",
                external_id: profile.id,
                handle: profile.username ?? null,
                display_name: profile.name ?? profile.username ?? "Threads",
                avatar_url: profile.threads_profile_picture_url ?? null,
                status: "connected",
                error_message: null,
                connected_by: row.user_id,
                last_synced_at: new Date().toISOString(),
                metadata: { native: true, threads_user_id: profile.id },
              },
              { onConflict: "workspace_id,platform,external_id" },
            )
            .select("id")
            .single();
          if (acctErr || !acct) {
            console.error("[threads-oauth] upsert failed", acctErr);
            return finish("error", "account_save_failed");
          }

          const expiresAt = new Date(Date.now() + long.expires_in * 1000).toISOString();
          const { error: tokErr } = await supabaseAdmin
            .from("meta_oauth_tokens" as never)
            .upsert(
              {
                connected_account_id: acct.id,
                kind: "threads",
                meta_user_id: profile.id,
                page_id: null,
                ig_business_id: null,
                access_token: long.access_token,
                refresh_token: null,
                scope: null,
                token_type: long.token_type ?? "Bearer",
                expires_at: expiresAt,
              } as never,
              { onConflict: "connected_account_id" },
            );
          if (tokErr) {
            console.error("[threads-oauth] token save failed", tokErr);
            return finish("error", "token_save_failed");
          }

          return finish("ok", "connected");
        } catch (err) {
          console.error("[threads-oauth] callback failed", err);
          return finish("error", err instanceof Error ? err.message : "unknown_error");
        }
      },
    },
  },
});