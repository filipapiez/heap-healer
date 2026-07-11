import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const OverridesSchema = z.record(z.string(), z.object({
  caption: z.string().max(4000).optional(),
})).default({});

const CreatePostSchema = z.object({
  caption: z.string().max(4000).default(""),
  mediaAssetIds: z.array(z.string().uuid()).max(10).default([]),
  overrides: OverridesSchema,
  accountIds: z.array(z.string().uuid()).min(1),
  scheduledAt: z.string().datetime().nullable().optional(),
});

async function activeWorkspaceId(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
) {
  const { data } = await supabase.from("profiles").select("current_workspace_id").eq("id", userId).maybeSingle();
  const id = data?.current_workspace_id as string | null | undefined;
  if (!id) throw new Error("No active workspace");
  return id;
}

export const listPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    scope: z.enum(["all", "scheduled", "history"]).default("all"),
  }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await activeWorkspaceId(supabase, userId);
    let q = supabase.from("posts")
      .select("id, caption, status, scheduled_at, published_at, media_asset_ids, error_message, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data.scope === "scheduled") q = q.eq("status", "scheduled");
    if (data.scope === "history") q = q.in("status", ["published", "partial", "failed", "cancelled"]);
    const { data: rows, error } = await q;
    if (error) throw error;
    return { items: rows ?? [] };
  });

export const getPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: post, error } = await supabase.from("posts")
      .select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    if (!post) throw new Error("Not found");
    const { data: targets } = await supabase.from("post_targets")
      .select("id, platform, status, external_url, external_post_id, error_message, published_at, connected_account:connected_accounts(id, handle, display_name, avatar_url)")
      .eq("post_id", post.id);
    return { post, targets: targets ?? [] };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("posts").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/**
 * Create a post (draft or scheduled) and optionally publish it now.
 * If scheduledAt is set, the post is stored as `scheduled` and not published.
 * Otherwise, it's published immediately via Zernio (per-target fan-out).
 */
export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => CreatePostSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await activeWorkspaceId(supabase, userId);

    // Validate accounts belong to this workspace + are connected
    const { data: accounts, error: accErr } = await supabase.from("connected_accounts")
      .select("id, platform, status, zernio_account_id")
      .in("id", data.accountIds)
      .eq("workspace_id", workspaceId);
    if (accErr) throw accErr;
    if (!accounts || accounts.length !== data.accountIds.length) {
      throw new Error("One or more selected accounts are invalid");
    }
    const bad = accounts.find((a) => a.status !== "connected");
    if (bad) throw new Error(`Account ${bad.platform} is not connected`);

    const scheduledAt = data.scheduledAt ?? null;
    const status = scheduledAt ? "scheduled" : "publishing";

    const { data: post, error: postErr } = await supabase.from("posts").insert({
      workspace_id: workspaceId,
      created_by: userId,
      caption: data.caption,
      media_asset_ids: data.mediaAssetIds,
      per_platform_overrides: data.overrides,
      status,
      scheduled_at: scheduledAt,
    }).select("*").single();
    if (postErr) throw postErr;

    const targetRows = accounts.map((a) => ({
      post_id: post.id,
      connected_account_id: a.id,
      platform: a.platform,
      status: (scheduledAt ? "pending" : "publishing") as "pending" | "publishing",
    }));
    const { data: targets, error: tgtErr } = await supabase.from("post_targets")
      .insert(targetRows).select("id, connected_account_id, platform");
    if (tgtErr) throw tgtErr;

    // Immediate publish path — fire per-target through Zernio.
    if (!scheduledAt) {
      const { publishToZernio } = await import("./zernio.server");
      const { publishYoutubeVideo } = await import("./youtube.server");
      // Signed URLs for media (private bucket) so Zernio can fetch
      const mediaUrls: string[] = [];
      let firstMediaPath: string | null = null;
      let firstMediaMime: string | null = null;
      if (data.mediaAssetIds.length) {
        const { data: media } = await supabase.from("media_assets")
          .select("storage_path, mime_type").in("id", data.mediaAssetIds);
        for (const m of media ?? []) {
          const { data: url } = await supabase.storage.from("media")
            .createSignedUrl(m.storage_path, 60 * 60 * 6);
          if (url?.signedUrl) mediaUrls.push(url.signedUrl);
        }
        if (media && media[0]) {
          firstMediaPath = (media[0] as { storage_path: string }).storage_path;
          firstMediaMime = (media[0] as { mime_type?: string }).mime_type ?? "video/mp4";
        }
      }

      let published = 0; let failed = 0;
      for (const t of targets ?? []) {
        const account = accounts.find((a) => a.id === t.connected_account_id)!;
        const caption = (data.overrides?.[t.platform] as { caption?: string } | undefined)?.caption ?? data.caption;
        try {
          let res: { external_post_id?: string | null; external_url?: string | null };
          if (t.platform === "youtube") {
            // Native YouTube publish path — expects a video media asset.
            if (!firstMediaPath) throw new Error("YouTube publish requires a video attachment");
            const { data: dl, error: dlErr } = await supabase.storage.from("media")
              .download(firstMediaPath);
            if (dlErr || !dl) throw new Error(`Failed to read video: ${dlErr?.message ?? "unknown"}`);
            const [title, ...descLines] = caption.split("\n");
            const yt = await publishYoutubeVideo({
              connectedAccountId: account.id,
              title: (title || "Untitled").slice(0, 100),
              description: descLines.join("\n"),
              privacyStatus: "public",
              contentType: firstMediaMime ?? "video/mp4",
              video: dl,
            });
            res = { external_post_id: yt.videoId, external_url: yt.url };
          } else {
            res = await publishToZernio({
              zernioAccountId: account.zernio_account_id!,
              platform: t.platform,
              caption,
              mediaUrls,
            });
          }
          await supabase.from("post_targets").update({
            status: "published",
            external_post_id: res.external_post_id ?? null,
            external_url: res.external_url ?? null,
            published_at: new Date().toISOString(),
          }).eq("id", t.id);
          await supabase.from("publish_attempts").insert({
            post_target_id: t.id, status: "published", response_payload: res as never,
          });
          published++;
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          await supabase.from("post_targets").update({
            status: "failed", error_message: message,
          }).eq("id", t.id);
          await supabase.from("publish_attempts").insert({
            post_target_id: t.id, status: "failed", error_message: message,
          });
          failed++;
        }
      }

      const finalStatus =
        failed === 0 ? "published" :
        published === 0 ? "failed" : "partial";
      await supabase.from("posts").update({
        status: finalStatus,
        published_at: finalStatus !== "failed" ? new Date().toISOString() : null,
        error_message: failed > 0 && published === 0 ? "All targets failed" : null,
      }).eq("id", post.id);
    }

    return { id: post.id };
  });

export const cancelScheduled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("posts")
      .update({ status: "cancelled" })
      .eq("id", data.id).eq("status", "scheduled");
    if (error) throw error;
    await supabase.from("post_targets").update({ status: "cancelled" })
      .eq("post_id", data.id).eq("status", "pending");
    return { ok: true };
  });