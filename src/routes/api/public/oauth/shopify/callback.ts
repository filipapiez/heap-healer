import { createFileRoute } from "@tanstack/react-router";

async function hasValidShopifyHmac(url: URL, secret: string) {
  const providedHmac = url.searchParams.get("hmac");
  if (!providedHmac || !/^[a-f0-9]{64}$/i.test(providedHmac)) return false;

  const message = [...url.searchParams.entries()]
    .filter(([key]) => key !== "hmac")
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("&");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
  const expected = [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const provided = providedHmac.toLowerCase();
  let difference = 0;
  for (let index = 0; index < expected.length; index++) {
    difference |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  }
  return difference === 0;
}

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
        const apiSecret = process.env.SHOPIFY_API_SECRET;
        if (!state || !code || !shop || !apiSecret)
          return finish(url.origin, "error", "missing_oauth_parameters");
        if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop))
          return finish(url.origin, "error", "invalid_shop");
        if (!(await hasValidShopifyHmac(url, apiSecret)))
          return finish(url.origin, "error", "invalid_signature");
        const { data, error: stateError } = await supabaseAdmin
          .from("oauth_states" as never)
          .select("provider,workspace_id,redirect_origin,expires_at,metadata")
          .eq("state", state)
          .maybeSingle();
        if (stateError) return finish(url.origin, "error", "state_lookup_failed");
        const row = data as unknown as {
          provider: string;
          workspace_id: string;
          redirect_origin: string;
          expires_at: string;
          metadata: { shop?: string };
        } | null;
        if (!row) return finish(url.origin, "error", "invalid_state");
        const { error: consumeError } = await supabaseAdmin
          .from("oauth_states" as never)
          .delete()
          .eq("state", state);
        if (consumeError) return finish(row.redirect_origin, "error", "state_consume_failed");
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
              client_secret: apiSecret,
              code,
            }),
          });
          if (!response.ok) throw new Error(`Shopify token exchange failed (${response.status})`);
          const token = (await response.json()) as { access_token: string; scope: string };
          const blogsResponse = await fetch(`https://${shop}/admin/api/2026-07/blogs.json`, {
            headers: { "x-shopify-access-token": token.access_token },
          });
          const blogs = blogsResponse.ok
            ? ((
                (await blogsResponse.json()) as {
                  blogs?: { id: number; title: string; handle: string }[];
                }
              ).blogs ?? [])
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
              metadata: {
                scope: token.scope,
                blog_id: blogs[0]?.id ?? null,
                blog_handle: blogs[0]?.handle ?? null,
                blogs,
              },
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
