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
            case "post.published":
            case "post.partial":
            case "post.failed":
            case "post.cancelled": {
              // Zernio sends: { post_id (external), zernio_account_id, external_url, status, message }
              const zid = String(data.zernio_account_id ?? "");
              const externalId = String(data.post_id ?? data.external_post_id ?? "");
              if (!zid) return new Response("missing zernio_account_id", { status: 400 });

              const { data: account } = await supabaseAdmin
                .from("connected_accounts").select("id").eq("zernio_account_id", zid).maybeSingle();
              if (!account) break;

              const targetStatus =
                event === "post.published" ? "published" :
                event === "post.cancelled" ? "cancelled" : "failed";

              const patch = {
                status: targetStatus as "published" | "failed" | "cancelled",
                external_post_id: externalId || null,
                external_url: data.external_url ? String(data.external_url) : null,
                published_at: event === "post.published" ? new Date().toISOString() : null,
                error_message: data.message ? String(data.message) : null,
              };

              // Prefer matching an existing pending/publishing target for this account
              const { data: targets } = await supabaseAdmin.from("post_targets")
                .select("id, post_id")
                .eq("connected_account_id", account.id)
                .in("status", ["pending", "publishing"])
                .order("created_at", { ascending: false })
                .limit(1);
              const target = targets?.[0];
              if (target) {
                await supabaseAdmin.from("post_targets").update(patch).eq("id", target.id);
                await supabaseAdmin.from("publish_attempts").insert({
                  post_target_id: target.id,
                  status: targetStatus,
                  response_payload: data as never,
                  error_message: data.message ? String(data.message) : null,
                });
                // Roll up post status
                const { data: siblings } = await supabaseAdmin.from("post_targets")
                  .select("status").eq("post_id", target.post_id);
                const statuses = (siblings ?? []).map((s) => s.status);
                const anyPending = statuses.some((s) => s === "pending" || s === "publishing");
                if (!anyPending) {
                  const published = statuses.filter((s) => s === "published").length;
                  const failed = statuses.filter((s) => s === "failed").length;
                  const finalStatus =
                    failed === 0 && published > 0 ? "published" :
                    published === 0 ? "failed" : "partial";
                  await supabaseAdmin.from("posts").update({
                    status: finalStatus,
                    published_at: finalStatus !== "failed" ? new Date().toISOString() : null,
                  }).eq("id", target.post_id);
                }
              }
              break;
            }
            default:
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