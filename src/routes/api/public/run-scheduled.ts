import { createFileRoute } from "@tanstack/react-router";

/**
 * Cron endpoint: publishes posts whose scheduled_at has passed.
 * Called every minute by pg_cron (see setup SQL).
 *
 * Public route (bypasses auth). Idempotent: only picks up rows with
 * status='scheduled' and atomically flips them to 'publishing' before work.
 */
export const Route = createFileRoute("/api/public/run-scheduled")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { publishTargetNative } = await import("@/lib/publish.server");

        const now = new Date().toISOString();
        const { data: due, error } = await supabaseAdmin
          .from("posts")
          .select("id, workspace_id, caption, media_asset_ids, per_platform_overrides")
          .eq("status", "scheduled")
          .lte("scheduled_at", now)
          .limit(20);
        if (error) {
          console.error("[run-scheduled] load error", error);
          return new Response("error", { status: 500 });
        }

        let processed = 0;
        for (const post of due ?? []) {
          // Claim the post
          const { data: claimed } = await supabaseAdmin
            .from("posts").update({ status: "publishing" })
            .eq("id", post.id).eq("status", "scheduled")
            .select("id").maybeSingle();
          if (!claimed) continue;
          processed++;

          const { data: targets } = await supabaseAdmin
            .from("post_targets")
            .select("id, platform, connected_account:connected_accounts(id, status)")
            .eq("post_id", post.id)
            .eq("status", "pending");

          const mediaAssetIds = (post.media_asset_ids as string[] | null) ?? [];

          const overrides = (post.per_platform_overrides ?? {}) as Record<string, { caption?: string }>;
          let published = 0; let failed = 0;

          for (const t of targets ?? []) {
            const account = t.connected_account as unknown as { id: string; status: string } | null;
            if (!account || account.status !== "connected") {
              await supabaseAdmin.from("post_targets").update({
                status: "failed", error_message: "Account no longer connected",
              }).eq("id", t.id);
              failed++; continue;
            }
            const caption = overrides[t.platform]?.caption ?? post.caption ?? "";
            try {
              const res = await publishTargetNative(supabaseAdmin, {
                platform: t.platform,
                connectedAccountId: account.id,
                caption,
                mediaAssetIds,
              });
              await supabaseAdmin.from("post_targets").update({
                status: "published",
                external_post_id: res.external_post_id ?? null,
                external_url: res.external_url ?? null,
                published_at: new Date().toISOString(),
              }).eq("id", t.id);
              await supabaseAdmin.from("publish_attempts").insert({
                post_target_id: t.id, status: "published", response_payload: res as never,
              });
              published++;
            } catch (e) {
              const message = e instanceof Error ? e.message : String(e);
              await supabaseAdmin.from("post_targets").update({
                status: "failed", error_message: message,
              }).eq("id", t.id);
              await supabaseAdmin.from("publish_attempts").insert({
                post_target_id: t.id, status: "failed", error_message: message,
              });
              failed++;
            }
          }

          const finalStatus =
            failed === 0 && published > 0 ? "published" :
            published === 0 ? "failed" : "partial";
          await supabaseAdmin.from("posts").update({
            status: finalStatus,
            published_at: finalStatus !== "failed" ? new Date().toISOString() : null,
            error_message: finalStatus === "failed" ? "All targets failed" : null,
          }).eq("id", post.id);
        }

        return Response.json({ ok: true, processed });
      },
    },
  },
});