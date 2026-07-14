import type { SupabaseClient } from "@supabase/supabase-js";

export type PublishInput = {
  platform: string;
  connectedAccountId: string;
  caption: string;
  mediaAssetIds: string[];
};

export type PublishResult = {
  external_post_id?: string | null;
  external_url?: string | null;
  action_required?: boolean;
  message?: string | null;
};

/**
 * Publishes a single post target via that platform's native API.
 * `supabase` may be either the user-scoped client or the service-role
 * admin client — both can read media_assets and sign storage URLs.
 */
export async function publishTargetNative(
  supabase: SupabaseClient,
  input: PublishInput,
): Promise<PublishResult> {
  const { platform, connectedAccountId, caption, mediaAssetIds } = input;

  // Resolve media once
  const mediaUrls: string[] = [];
  let firstMediaPath: string | null = null;
  let firstMediaMime: string | null = null;
  if (mediaAssetIds.length) {
    const { data: media } = await supabase.from("media_assets")
      .select("storage_path, mime_type").in("id", mediaAssetIds);
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

  async function downloadFirstVideo(): Promise<Blob> {
    if (!firstMediaPath) throw new Error(`${platform} publish requires a video attachment`);
    const { data: dl, error: dlErr } = await supabase.storage.from("media").download(firstMediaPath);
    if (dlErr || !dl) throw new Error(`Failed to read video: ${dlErr?.message ?? "unknown"}`);
    return dl;
  }

  if (platform === "youtube") {
    const { publishYoutubeVideo } = await import("./youtube.server");
    const video = await downloadFirstVideo();
    const [title, ...descLines] = caption.split("\n");
    const yt = await publishYoutubeVideo({
      connectedAccountId,
      title: (title || "Untitled").slice(0, 100),
      description: descLines.join("\n"),
      privacyStatus: "public",
      contentType: firstMediaMime ?? "video/mp4",
      video,
    });
    return { external_post_id: yt.videoId, external_url: yt.url };
  }

  if (platform === "tiktok") {
    const { publishTikTokVideo } = await import("./tiktok.server");
    const video = await downloadFirstVideo();
    const tt = await publishTikTokVideo({
      connectedAccountId,
      title: caption.slice(0, 2200),
      contentType: firstMediaMime ?? "video/mp4",
      video,
      // SELF_ONLY is required for un-audited / sandbox apps.
      privacyLevel: "SELF_ONLY",
    });
    return { external_post_id: tt.publishId, external_url: tt.shareUrl ?? null };
    return {
      external_post_id: tt.publishId,
      external_url: tt.shareUrl ?? null,
      action_required: tt.actionRequired ?? false,
      message: tt.message ?? null,
    };
  }

  if (platform === "linkedin") {
    const { publishLinkedInPost } = await import("./linkedin.server");
    const li = await publishLinkedInPost({ connectedAccountId, text: caption });
    return { external_post_id: li.external_post_id, external_url: li.external_url };
  }

  if (platform === "facebook") {
    const { publishFacebookPagePost, getValidMetaAccessToken } = await import("./meta.server");
    const meta = await getValidMetaAccessToken(connectedAccountId);
    if (!meta.pageId) throw new Error("Facebook page ID missing on account");
    const fb = await publishFacebookPagePost({
      pageId: meta.pageId,
      pageAccessToken: meta.accessToken,
      message: caption,
    });
    return { external_post_id: fb.id, external_url: `https://www.facebook.com/${fb.id}` };
  }

  if (platform === "instagram") {
    const { publishInstagramImage, getValidMetaAccessToken } = await import("./meta.server");
    const meta = await getValidMetaAccessToken(connectedAccountId);
    if (!meta.igBusinessId) throw new Error("Instagram business ID missing on account");
    if (!mediaUrls[0]) throw new Error("Instagram publish requires an image attachment");
    const ig = await publishInstagramImage({
      igBusinessId: meta.igBusinessId,
      pageAccessToken: meta.accessToken,
      imageUrl: mediaUrls[0],
      caption,
    });
    return { external_post_id: ig.id, external_url: null };
  }

  if (platform === "threads") {
    const { publishThreadsPost, getValidMetaAccessToken } = await import("./meta.server");
    const meta = await getValidMetaAccessToken(connectedAccountId);
    if (!meta.metaUserId) throw new Error("Threads user ID missing on account");
    const th = await publishThreadsPost({
      threadsUserId: meta.metaUserId,
      accessToken: meta.accessToken,
      text: caption,
      imageUrl: mediaUrls[0],
    });
    return { external_post_id: th.id, external_url: null };
  }

  throw new Error(`Publishing to ${platform} is not yet implemented`);
}