// Server-only helpers for native TikTok OAuth v2 and Content Posting API.
// Never import from a route/component/*.functions.ts at module scope — the
// .server.ts suffix keeps it out of client bundles.

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_REVOKE_URL = "https://open.tiktokapis.com/v2/oauth/revoke/";
const TIKTOK_USER_INFO_URL =
  "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username";
const TIKTOK_VIDEO_INIT_URL =
  "https://open.tiktokapis.com/v2/post/publish/video/init/";
const TIKTOK_PUBLISH_STATUS_URL =
  "https://open.tiktokapis.com/v2/post/publish/status/fetch/";
const TIKTOK_CREATOR_INFO_URL =
  "https://open.tiktokapis.com/v2/post/publish/creator_info/query/";

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
}): Promise<{ publishId: string; shareUrl?: string }> {
  const accessToken = await getValidTikTokAccessToken(opts.connectedAccountId);

  const size =
    opts.video instanceof Blob
      ? opts.video.size
      : (opts.video as ArrayBuffer).byteLength;

  // Step 1: init upload
  const initBody = {
    post_info: {
      title: (opts.title ?? "").slice(0, 2200),
      privacy_level: opts.privacyLevel ?? "SELF_ONLY",
      disable_duet: false,
      disable_comment: false,
      disable_stitch: false,
      video_cover_timestamp_ms: 1000,
    },
    source_info: {
      source: "FILE_UPLOAD",
      video_size: size,
      chunk_size: size,
      total_chunk_count: 1,
    },
  };
  const initRes = await fetch(TIKTOK_VIDEO_INIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(initBody),
  });
  const initJson = await initRes.json();
  if (!initRes.ok || initJson?.error?.code !== "ok") {
    throw new Error(
      `TikTok publish init failed (${initRes.status}): ${
        initJson?.error?.message ?? JSON.stringify(initJson)
      }`,
    );
  }
  const publishId: string | undefined = initJson?.data?.publish_id;
  const uploadUrl: string | undefined = initJson?.data?.upload_url;
  if (!publishId || !uploadUrl) {
    throw new Error("TikTok publish init missing publish_id or upload_url");
  }

  // Step 2: upload bytes in a single chunk
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "content-type": opts.contentType ?? "video/mp4",
      "content-length": String(size),
      "content-range": `bytes 0-${size - 1}/${size}`,
    },
    body: opts.video instanceof Blob ? opts.video : new Uint8Array(opts.video),
  });
  if (!putRes.ok && putRes.status !== 201 && putRes.status !== 200) {
    throw new Error(
      `TikTok video upload failed (${putRes.status}): ${await putRes.text()}`,
    );
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

  return { publishId, shareUrl };
}