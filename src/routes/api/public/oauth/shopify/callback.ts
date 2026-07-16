import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/oauth/shopify/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const state = url.searchParams.get("state");
        const code = url.searchParams.get("code");
        const shop = url.searchParams.get("shop");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const finish = (origin: string, status: string, msg: string) => {
          const target = new URL("/accounts", origin);
          target.searchParams.set("shopify", status);
          target.searchParams.set("msg", msg);
          return Response.redirect(target, 302);
        };
        if (!state || !code || !shop)
          return finish(url.origin, "error", "missing_oauth_parameters");
        const { data } = await supabaseAdmin
          .from("oauth_states" as never)
          .select("provider,workspace_id,redirect_origin,expires_at,metadata")
          .eq("state", state)
          .maybeSingle();
        const row = data as unknown as {
          provider: string;
          workspace_id: string;
          redirect_origin: string;
          expires_at: string;
          metadata: { shop?: string };
        } | null;
        if (!row) return finish(url.origin, "error", "invalid_state");
        await supabaseAdmin
          .from("oauth_states" as never)
          .delete()
          .eq("state", state);
        if (
          row.provider !== "shopify" ||
          row.metadata.shop !== shop ||
          new Date(row.expires_at) < new Date()
        )
          return finish(row.redirect_origin, "error", "invalid_or_expired_state");
        try {
          const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              client_id: process.env.SHOPIFY_API_KEY,
              client_secret: process.env.SHOPIFY_API_SECRET,
              code,
            }),
          });
          if (!response.ok) throw new Error(`Shopify token exchange failed (${response.status})`);
          const token = (await response.json()) as { access_token: string; scope: string };
          const blogsResponse = await fetch(`https://${shop}/admin/api/2025-07/blogs.json`, {
            headers: { "x-shopify-access-token": token.access_token },
          });
          const blogs = blogsResponse.ok
            ? (((await blogsResponse.json()) as { blogs?: { id: number; title: string }[] })
                .blogs ?? [])
            : [];
          const { encryptCredentials } = await import("@/lib/credentials.server");
          const encrypted = await encryptCredentials({ accessToken: token.access_token });
          const { error } = await supabaseAdmin.from("website_connections" as never).upsert(
            {
              workspace_id: row.workspace_id,
              platform: "shopify",
              external_id: shop,
              display_name: shop,
              encrypted_credentials: encrypted,
              metadata: { scope: token.scope, blog_id: blogs[0]?.id ?? null, blogs },
              status: "connected",
              last_tested_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as never,
            { onConflict: "workspace_id,platform,external_id" },
          );
          if (error) throw error;
          return finish(row.redirect_origin, "ok", "Shopify connected");
        } catch (error) {
          return finish(
            row.redirect_origin,
            "error",
            error instanceof Error ? error.message : "connection_failed",
          );
        }
      },
    },
  },
});
