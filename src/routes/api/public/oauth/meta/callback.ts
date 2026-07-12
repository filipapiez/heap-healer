import { createFileRoute } from "@tanstack/react-router";

// Native Facebook + Instagram OAuth callback.
// Register this exact URL in the Meta app under "Facebook Login for
// Business" → Settings → Valid OAuth Redirect URIs:
//   https://mentionmyapp.com/api/public/oauth/meta/callback
//   https://www.mentionmyapp.com/api/public/oauth/meta/callback
//   https://heap-healer.lovable.app/api/public/oauth/meta/callback

export const Route = createFileRoute("/api/public/oauth/meta/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const {
          exchangeFacebookCode,
          exchangeForLongLivedUserToken,
          fetchFacebookPages,
          fetchInstagramProfile,
        } = await import("@/lib/meta.server");

        function finish(status: "ok" | "error", message: string) {
          const target = new URL("/accounts", url.origin);
          target.searchParams.set("meta", status);
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

        if (row.provider !== "meta") return finish("error", "provider_mismatch");
        if (new Date(row.expires_at) < new Date()) return finish("error", "state_expired");

        const redirectUri = `${row.redirect_origin}/api/public/oauth/meta/callback`;

        try {
          const short = await exchangeFacebookCode({ code, redirectUri });
          const long = await exchangeForLongLivedUserToken(short.access_token);
          const pages = await fetchFacebookPages(long.access_token);

          if (pages.length === 0) {
            return finish("error", "no_pages_selected");
          }

          let facebookCount = 0;
          let instagramCount = 0;
          const messages: string[] = [];

          for (const page of pages) {
            // Upsert Facebook Page account.
            const { data: fbAcct, error: fbErr } = await supabaseAdmin
              .from("connected_accounts")
              .upsert(
                {
                  workspace_id: row.workspace_id,
                  platform: "facebook",
                  external_id: page.id,
                  handle: page.name,
                  display_name: page.name,
                  avatar_url: page.picture?.data?.url ?? null,
                  status: "connected",
                  error_message: null,
                  connected_by: row.user_id,
                  last_synced_at: new Date().toISOString(),
                  metadata: { native: true, page_id: page.id, category: page.category ?? null },
                },
                { onConflict: "workspace_id,platform,external_id" },
              )
              .select("id")
              .single();
            if (fbErr || !fbAcct) {
              console.error("[meta-oauth] FB upsert failed", fbErr);
              continue;
            }
            const { error: fbTokErr } = await supabaseAdmin
              .from("meta_oauth_tokens" as never)
              .upsert(
                {
                  connected_account_id: fbAcct.id,
                  kind: "facebook_page",
                  meta_user_id: null,
                  page_id: page.id,
                  ig_business_id: page.instagram_business_account?.id ?? null,
                  access_token: page.access_token,
                  refresh_token: null,
                  scope: null,
                  token_type: "Bearer",
                  expires_at: null,
                } as never,
                { onConflict: "connected_account_id" },
              );
            if (fbTokErr) console.error("[meta-oauth] FB token save failed", fbTokErr);
            else facebookCount++;

            // If linked IG Business account exists, connect Instagram too.
            if (page.instagram_business_account?.id) {
              const ig = await fetchInstagramProfile(
                page.instagram_business_account.id,
                page.access_token,
              );
              const igDisplay = ig?.username ?? ig?.name ?? "Instagram";
              const { data: igAcct, error: igErr } = await supabaseAdmin
                .from("connected_accounts")
                .upsert(
                  {
                    workspace_id: row.workspace_id,
                    platform: "instagram",
                    external_id: page.instagram_business_account.id,
                    handle: ig?.username ?? null,
                    display_name: igDisplay,
                    avatar_url: ig?.profile_picture_url ?? null,
                    status: "connected",
                    error_message: null,
                    connected_by: row.user_id,
                    last_synced_at: new Date().toISOString(),
                    metadata: {
                      native: true,
                      page_id: page.id,
                      ig_business_id: page.instagram_business_account.id,
                    },
                  },
                  { onConflict: "workspace_id,platform,external_id" },
                )
                .select("id")
                .single();
              if (igErr || !igAcct) {
                console.error("[meta-oauth] IG upsert failed", igErr);
              } else {
                await supabaseAdmin
                  .from("meta_oauth_tokens" as never)
                  .upsert(
                    {
                      connected_account_id: igAcct.id,
                      kind: "instagram",
                      meta_user_id: null,
                      page_id: page.id,
                      ig_business_id: page.instagram_business_account.id,
                      access_token: page.access_token, // page token is used for IG publish
                      refresh_token: null,
                      scope: null,
                      token_type: "Bearer",
                      expires_at: null,
                    } as never,
                    { onConflict: "connected_account_id" },
                  );
                instagramCount++;
              }
            }
          }

          if (facebookCount === 0) return finish("error", "no_pages_linked");
          messages.push(`facebook_pages:${facebookCount}`);
          messages.push(`instagram_accounts:${instagramCount}`);
          if (instagramCount === 0) messages.push("no_ig_business_linked");
          return finish("ok", messages.join(","));
        } catch (err) {
          console.error("[meta-oauth] callback failed", err);
          return finish("error", err instanceof Error ? err.message : "unknown_error");
        }
      },
    },
  },
});