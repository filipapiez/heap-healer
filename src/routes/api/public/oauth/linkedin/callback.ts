import { createFileRoute } from "@tanstack/react-router";

// Native LinkedIn OAuth callback.
// Register this exact URL in LinkedIn Developers → your app → Auth →
// OAuth 2.0 settings → Authorized redirect URLs:
//   https://mentionmyapp.com/api/public/oauth/linkedin/callback

export const Route = createFileRoute("/api/public/oauth/linkedin/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");
        const errorDesc = url.searchParams.get("error_description");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const {
          exchangeLinkedInCode,
          fetchLinkedInUserinfo,
        } = await import("@/lib/linkedin.server");

        function finish(status: "ok" | "error", message: string) {
          const target = new URL("/accounts", url.origin);
          target.searchParams.set("linkedin", status);
          target.searchParams.set("msg", message);
          return new Response(null, { status: 302, headers: { location: target.toString() } });
        }

        if (errorParam) return finish("error", errorDesc || errorParam);
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

        if (row.provider !== "linkedin") return finish("error", "provider_mismatch");
        if (new Date(row.expires_at) < new Date()) return finish("error", "state_expired");

        const redirectUri = `${row.redirect_origin}/api/public/oauth/linkedin/callback`;

        try {
          const token = await exchangeLinkedInCode({ code, redirectUri });
          const profile = await fetchLinkedInUserinfo(token.access_token);

          const { data: acct, error: acctErr } = await supabaseAdmin
            .from("connected_accounts")
            .upsert(
              {
                workspace_id: row.workspace_id,
                platform: "linkedin",
                external_id: profile.sub,
                handle: profile.email ?? null,
                display_name: profile.name ?? profile.email ?? "LinkedIn",
                avatar_url: profile.picture ?? null,
                status: "connected",
                error_message: null,
                connected_by: row.user_id,
                last_synced_at: new Date().toISOString(),
                metadata: { native: true, linkedin_member_id: profile.sub },
              },
              { onConflict: "workspace_id,platform,external_id" },
            )
            .select("id")
            .single();
          if (acctErr || !acct) {
            console.error("[linkedin-oauth] upsert failed", acctErr);
            return finish("error", "account_save_failed");
          }

          const expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
          const { error: tokErr } = await supabaseAdmin
            .from("linkedin_oauth_tokens" as never)
            .upsert(
              {
                connected_account_id: acct.id,
                linkedin_member_id: profile.sub,
                access_token: token.access_token,
                refresh_token: token.refresh_token ?? null,
                scope: token.scope ?? null,
                token_type: token.token_type ?? "Bearer",
                expires_at: expiresAt,
              } as never,
              { onConflict: "connected_account_id" },
            );
          if (tokErr) {
            console.error("[linkedin-oauth] token save failed", tokErr);
            return finish("error", "token_save_failed");
          }

          return finish("ok", "connected");
        } catch (err) {
          console.error("[linkedin-oauth] callback failed", err);
          return finish("error", err instanceof Error ? err.message : "unknown_error");
        }
      },
    },
  },
});