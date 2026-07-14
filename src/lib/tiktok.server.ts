// Server-only helpers for native TikTok OAuth v2 and Content Posting API.
// Never import from a route/component/*.functions.ts at module scope — the
// .server.ts suffix keeps it out of client bundles.

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_REVOKE_URL = "https://open.tiktokapis.com/v2/oauth/revoke/";
const TIKTOK_USER_INFO_URL =
  "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username";
const TIKTOK_DIRECT_VIDEO_INIT_URL =
  "https://open.tiktokapis.com/v2/post/publish/video/init/";
const TIKTOK_CREATOR_INFO_URL =
  "https://open.tiktokapis.com/v2/post/publish/creator_info/query/";
const TIKTOK_PUBLISH_STATUS_URL =
  "https://open.tiktokapis.com/v2/post/publish/status/fetch/";

export const TIKTOK_SCOPES = [
  "user.info.basic",
  "video.publish",
  "video.upload",
].join(",");

export function requireTikTokEnv() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) {
    throw new Error(
      "TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET are not configured.",
    );
  }
  return { clientKey, clientSecret };
}

export function buildTikTokAuthorizeUrl(opts: {
  clientKey: string;
  redirectUri: string;
  state: string;
}) {
  const params = new URLSearchParams({
    client_key: opts.clientKey,
    response_type: "code",
    scope: TIKTOK_SCOPES,
    redirect_uri: opts.redirectUri,
    state: opts.state,
  });
  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}

export interface TikTokTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  scope: string;
  token_type: string;
  open_id: string;
}

export async function exchangeTikTokCode(opts: {
  code: string;
  redirectUri: string;
}): Promise<TikTokTokenResponse> {
  const { clientKey, clientSecret } = requireTikTokEnv();
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code: opts.code,
    grant_type: "authorization_code",
    redirect_uri: opts.redirectUri,
  });
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "cache-control": "no-cache",
    },
    body,
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(
      `TikTok token exchange failed (${res.status}): ${
        json?.error_description ?? json?.error ?? JSON.stringify(json)
      }`,
    );
  }
  return json as TikTokTokenResponse;
}

export async function refreshTikTokToken(
  refreshToken: string,
): Promise<TikTokTokenResponse> {
  const { clientKey, clientSecret } = requireTikTokEnv();
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "cache-control": "no-cache",
    },
    body,
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(
      `TikTok token refresh failed (${res.status}): ${
        json?.error_description ?? json?.error ?? JSON.stringify(json)
      }`,
    );
  }
  return json as TikTokTokenResponse;
}

export async function revokeTikTokToken(token: string): Promise<void> {
  const { clientKey, clientSecret } = requireTikTokEnv();
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    token,
  });
  await fetch(TIKTOK_REVOKE_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  }).catch(() => {});
}

export interface TikTokUserInfo {
  open_id: string;
  union_id?: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
}

export async function fetchTikTokUser(accessToken: string): Promise<TikTokUserInfo> {
  const res = await fetch(TIKTOK_USER_INFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!res.ok || json?.error?.code && json.error.code !== "ok") {
    throw new Error(
      `TikTok user info failed (${res.status}): ${
        json?.error?.message ?? JSON.stringify(json)
      }`,
    );
  }
  const user = json?.data?.user;
  if (!user?.open_id) throw new Error("TikTok user info returned no open_id");
  return user as TikTokUserInfo;
}

/**
 * Returns a valid access token, refreshing via refresh_token when the current
 * one is expired or within 60s of expiry.
 */
export async function getValidTikTokAccessToken(
  connectedAccountId: string,
): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("tiktok_oauth_tokens" as never)
    .select("access_token, refresh_token, expires_at")
    .eq("connected_account_id", connectedAccountId)
    .maybeSingle();
  if (error || !data) {
    throw new Error("No TikTok tokens found for this account. Reconnect required.");
  }
  const row = data as unknown as {
    access_token: string;
    refresh_token: string | null;
    expires_at: string;
  };
  const expiryMs = new Date(row.expires_at).getTime();
  const skewMs = 60_000;
  if (Date.now() < expiryMs - skewMs) return row.access_token;

  if (!row.refresh_token) {
    throw new Error("TikTok access token expired and no refresh token. Reconnect required.");
  }
  const refreshed = await refreshTikTokToken(row.refresh_token);
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  const newRefreshExpiresAt = refreshed.refresh_expires_in
    ? new Date(Date.now() + refreshed.refresh_expires_in * 1000).toISOString()
    : null;
  await supabaseAdmin
    .from("tiktok_oauth_tokens" as never)
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token ?? row.refresh_token,
      scope: refreshed.scope,
      token_type: refreshed.token_type ?? "Bearer",
      expires_at: newExpiresAt,
      refresh_expires_at: newRefreshExpiresAt,
    } as never)
    .eq("connected_account_id", connectedAccountId);
  return refreshed.access_token;
}

export async function disconnectTikTokAccount(connectedAccountId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("tiktok_oauth_tokens" as never)
    .select("access_token, refresh_token")
    .eq("connected_account_id", connectedAccountId)
    .maybeSingle();
  const tokens = data as unknown as
    | { access_token: string | null; refresh_token: string | null }
    | null;
  if (tokens?.access_token) await revokeTikTokToken(tokens.access_token);
  await supabaseAdmin
    .from("connected_accounts")
    .delete()
    .eq("id", connectedAccountId);
}

/**
 * Publish a video to TikTok via FILE_UPLOAD source_type (single-chunk PUT).
 * Defaults privacy to SELF_ONLY, which is required for un-audited/sandbox apps.
 * Returns publish_id (and share_url once processing completes).
 */
export async function publishTikTokVideo(opts: {
  connectedAccountId: string;
  title?: string;
  video: Blob | ArrayBuffer;
  contentType?: string;
  privacyLevel?:
    | "PUBLIC_TO_EVERYONE"
    | "MUTUAL_FOLLOW_FRIENDS"
    | "FOLLOWER_OF_CREATOR"
    | "SELF_ONLY";
}): Promise<{ publishId: string; shareUrl?: string; actionRequired?: boolean; message?: string }> {
  const accessToken = await getValidTikTokAccessToken(opts.connectedAccountId);

  const size =
    opts.video instanceof Blob
      ? opts.video.size
      : (opts.video as ArrayBuffer).byteLength;
  const videoBlob: Blob =
    opts.video instanceof Blob
      ? opts.video
      : new Blob([opts.video], { type: opts.contentType ?? "video/mp4" });

  // TikTok chunk rules (FILE_UPLOAD):
  //   - min chunk size: 5 MB (5,242,880)
  //   - max chunk size: 64 MB (67,108,864)
  //   - all chunks except the LAST must be exactly chunk_size
  //   - if video_size < 5 MB, must be uploaded as a single chunk
  const MIN_CHUNK = 5 * 1024 * 1024;
  const MAX_CHUNK = 64 * 1024 * 1024;
  let chunkSize: number;
  let totalChunkCount: number;
  if (size <= MAX_CHUNK) {
    chunkSize = size;
    totalChunkCount = 1;
  } else {
    chunkSize = MAX_CHUNK;
    totalChunkCount = Math.floor(size / chunkSize); // last chunk absorbs the remainder
    if (totalChunkCount < 1) totalChunkCount = 1;
  }
  if (totalChunkCount > 1 && chunkSize < MIN_CHUNK) {
    throw new Error("TikTok upload chunk size below 5MB minimum");
  }

  // Step 1: query creator_info to discover the privacy levels this account
  // is allowed to use for Direct Post. Required by TikTok before init.
  const creatorRes = await fetch(TIKTOK_CREATOR_INFO_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json; charset=UTF-8",
    },
  });
  const creatorJson = await creatorRes.json().catch(() => ({}));
  if (!creatorRes.ok || creatorJson?.error?.code !== "ok") {
    throw new Error(
      `TikTok creator_info failed (${creatorRes.status}): ${
        creatorJson?.error?.message ?? JSON.stringify(creatorJson)
      }`,
    );
  }
  const allowedPrivacy: string[] =
    creatorJson?.data?.privacy_level_options ?? [];
  const preferred = opts.privacyLevel ?? "SELF_ONLY";
  const privacyLevel = allowedPrivacy.includes(preferred)
    ? preferred
    : allowedPrivacy[0] ?? "SELF_ONLY";

  // Step 2: init a Direct Post upload.
  const sourceInfo = {
    source: "FILE_UPLOAD",
    video_size: size,
    chunk_size: chunkSize,
    total_chunk_count: totalChunkCount,
  };
  const postInfo = {
    title: (opts.title ?? "").slice(0, 2200),
    privacy_level: privacyLevel,
    disable_duet: false,
    disable_comment: false,
    disable_stitch: false,
  };
  const initRes = await fetch(TIKTOK_DIRECT_VIDEO_INIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ post_info: postInfo, source_info: sourceInfo }),
  });
  const initJson = await initRes.json();
  if (!initRes.ok || initJson?.error?.code !== "ok") {
    const initErrorMessage =
      initJson?.error?.message ?? initJson?.error_description ?? JSON.stringify(initJson);
    if (
      initRes.status === 403 &&
      /integration guidelines|content-sharing-guidelines|unaudited_client/i.test(initErrorMessage)
    ) {
      throw new Error(
        "TikTok Direct Post is blocked because this TikTok app has not been approved for direct publishing yet. Keep Direct Post enabled, but request TikTok Content Posting API review/approval before retrying.",
      );
    }
    throw new Error(
      `TikTok direct post init failed (${initRes.status}): ${
        initErrorMessage
      }`,
    );
  }
  const publishId: string | undefined = initJson?.data?.publish_id;
  const uploadUrl: string | undefined = initJson?.data?.upload_url;
  if (!publishId || !uploadUrl) {
    throw new Error("TikTok publish init missing publish_id or upload_url");
  }

  // Step 2: upload bytes. Single PUT when total_chunk_count === 1,
  // otherwise one PUT per chunk with the correct Content-Range header.
  const contentType = opts.contentType ?? "video/mp4";
  for (let i = 0; i < totalChunkCount; i++) {
    const start = i * chunkSize;
    const end = i === totalChunkCount - 1 ? size - 1 : start + chunkSize - 1;
    const partBlob = videoBlob.slice(start, end + 1, contentType);
    const partSize = end - start + 1;
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "content-type": contentType,
        "content-length": String(partSize),
        "content-range": `bytes ${start}-${end}/${size}`,
      },
      body: partBlob,
    });
    if (!putRes.ok && putRes.status !== 201 && putRes.status !== 200 && putRes.status !== 206) {
      throw new Error(
        `TikTok video upload failed on chunk ${i + 1}/${totalChunkCount} (${putRes.status}): ${await putRes.text()}`,
      );
    }
  }

  // Step 3: brief poll for publish status (best-effort)
  let shareUrl: string | undefined;
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(TIKTOK_PUBLISH_STATUS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ publish_id: publishId }),
    });
    const statusJson = await statusRes.json().catch(() => ({}));
    const status: string | undefined = statusJson?.data?.status;
    const publiclyUrl: string | undefined = statusJson?.data?.publicaly_available_post_id?.[0]
      ? `https://www.tiktok.com/@_/video/${statusJson.data.publicaly_available_post_id[0]}`
      : undefined;
    if (publiclyUrl) shareUrl = publiclyUrl;
    if (status === "PUBLISH_COMPLETE" || status === "SEND_TO_USER_INBOX") break;
    if (status === "FAILED") {
      throw new Error(
        `TikTok publish failed: ${statusJson?.data?.fail_reason ?? "unknown"}`,
      );
    }
  }

  return {
    publishId,
    shareUrl,
    actionRequired: false,
  };
}