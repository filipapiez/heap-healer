import { createFileRoute } from "@tanstack/react-router";

/**
 * Zernio -> SocialFlow webhook.
 * Events (all use HMAC-SHA256 hex of the raw body in x-zernio-signature):
 *   account.connected     { workspace_id, user_id, platform, external_id,
 *                           zernio_account_id, handle, display_name, avatar_url }
 *   account.disconnected  { zernio_account_id }
 *   account.error         { zernio_account_id, message }
 *   post.published        (slice 3)
 *   post.partial          (slice 3)
 *   post.failed           (slice 3)
 *   post.cancelled        (slice 3)
 */
export const Route = createFileRoute("/api/public/zernio")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-zernio-signature");

        const { verifyWebhookSignature } = await import("@/lib/zernio.server");
        if (!(await verifyWebhookSignature(rawBody, signature))) {
          return new Response("invalid signature", { status: 401 });
        }

        let payload: { event?: string; data?: Record<string, unknown> };
        try { payload = JSON.parse(rawBody); }
        catch { return new Response("invalid json", { status: 400 }); }

        const event = payload.event;
        const data = (payload.data ?? {}) as Record<string, unknown>;
        if (!event) return new Response("missing event", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        try {
          switch (event) {
            case "account.connected": {
              const workspace_id = String(data.workspace_id ?? "");
              const platform = String(data.platform ?? "");
              const external_id = String(data.external_id ?? "");
              const zernio_account_id = String(data.zernio_account_id ?? "");
              if (!workspace_id || !platform || !external_id || !zernio_account_id) {
                return new Response("missing fields", { status: 400 });
              }
              const { error } = await supabaseAdmin
                .from("connected_accounts")
                .upsert({
                  workspace_id,
                  platform: platform as never,
                  external_id,
                  zernio_account_id,
                  handle: (data.handle as string) ?? null,
                  display_name: (data.display_name as string) ?? null,
                  avatar_url: (data.avatar_url as string) ?? null,
                  status: "connected",
                  error_message: null,
                  connected_by: (data.user_id as string) ?? null,
                  last_synced_at: new Date().toISOString(),
                }, { onConflict: "workspace_id,platform,external_id" });
              if (error) throw error;
              break;
            }
            case "account.disconnected": {
              const zid = String(data.zernio_account_id ?? "");
              if (!zid) return new Response("missing zernio_account_id", { status: 400 });
              const { error } = await supabaseAdmin
                .from("connected_accounts")
                .update({ status: "disconnected" })
                .eq("zernio_account_id", zid);
              if (error) throw error;
              break;
            }
            case "account.error": {
              const zid = String(data.zernio_account_id ?? "");
              if (!zid) return new Response("missing zernio_account_id", { status: 400 });
              const { error } = await supabaseAdmin
                .from("connected_accounts")
                .update({ status: "error", error_message: String(data.message ?? "Unknown error") })
                .eq("zernio_account_id", zid);
              if (error) throw error;
              break;
            }
            default:
              // Slice 3 events (post.*) get their handlers when publishing lands.
              console.log("[zernio webhook] ignored event", event);
          }
          return Response.json({ ok: true });
        } catch (e) {
          console.error("[zernio webhook] handler error", e);
          return new Response("internal error", { status: 500 });
        }
      },
    },
  },
});