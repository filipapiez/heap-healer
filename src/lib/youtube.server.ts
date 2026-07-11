// Server-only helpers for native YouTube OAuth (authorization-code flow) and
// video publishing. Never import this file from a route file, component, or
// *.functions.ts module at the top level — the *.server.ts suffix keeps it
// out of client bundles.

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
const YOUTUBE_CHANNELS_URL = "https://www.googleapis.com/youtube/v3/channels";
const YOUTUBE_UPLOAD_URL =
  "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";

export const YOUTUBE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
].join(" ");

export function requireGoogleEnv() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET are not configured.",
    );
  }
  return { clientId, clientSecret };
}

export function buildAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const params = new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: YOUTUBE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state: opts.state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

export async function exchangeCodeForTokens(opts: {
  code: string;
  redirectUri: string;
}): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = requireGoogleEnv();
  const body = new URLSearchParams({
    code: opts.code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: opts.redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      `Google token exchange failed (${res.status}): ${json?.error_description ?? json?.error ?? "unknown"}`,
    );
  }
  return json as GoogleTokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = requireGoogleEnv();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      `Google token refresh failed (${res.status}): ${json?.error_description ?? json?.error ?? "unknown"}`,
    );
  }
  return json as GoogleTokenResponse;
}

export async function revokeToken(token: string): Promise<void> {
  await fetch(`${GOOGLE_REVOKE_URL}?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
  }).catch(() => {}); // best-effort; ignore network failures on revoke
}

/**
 * Get a currently-valid access token for a connected YouTube account,
 * refreshing via the stored refresh_token when the current one is
 * expired or within 60s of expiry. Uses supabaseAdmin.
 */
export async function getValidAccessToken(connectedAccountId: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("youtube_oauth_tokens" as never)
    .select("access_token, refresh_token, expires_at")
    .eq("connected_account_id", connectedAccountId)
    .maybeSingle();
  if (error || !data) {
    throw new Error("No YouTube tokens found for this account. Reconnect required.");
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
    throw new Error("Access token expired and no refresh token available. Reconnect required.");
  }
  const refreshed = await refreshAccessToken(row.refresh_token);
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
  await supabaseAdmin
    .from("youtube_oauth_tokens" as never)
    .update({
      access_token: refreshed.access_token,
      // Google may or may not return a new refresh_token; keep old if not.
      refresh_token: refreshed.refresh_token ?? row.refresh_token,
      scope: refreshed.scope,
      token_type: refreshed.token_type ?? "Bearer",
      expires_at: newExpiresAt,
    } as never)
    .eq("connected_account_id", connectedAccountId);
  return refreshed.access_token;
}

/**
 * Full disconnect: revoke tokens with Google (best-effort) and delete the
 * connected_accounts row (cascade removes youtube_oauth_tokens).
 */
export async function disconnectYoutubeAccount(connectedAccountId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("youtube_oauth_tokens" as never)
    .select("refresh_token, access_token")
    .eq("connected_account_id", connectedAccountId)
    .maybeSingle();
  const tokens = data as unknown as
    | { refresh_token: string | null; access_token: string | null }
    | null;
  if (tokens?.refresh_token) await revokeToken(tokens.refresh_token);
  else if (tokens?.access_token) await revokeToken(tokens.access_token);

  await supabaseAdmin
    .from("connected_accounts")
    .delete()
    .eq("id", connectedAccountId);
}

/**
 * High-level publish helper: given a connected YouTube account id, a title,
 * a description, and a video Blob/ArrayBuffer, uploads to YouTube using an
 * auto-refreshed access token.
 */
export async function publishYoutubeVideo(opts: {
  connectedAccountId: string;
  title: string;
  description?: string;
  privacyStatus?: "public" | "unlisted" | "private";
  tags?: string[];
  contentType: string;
  video: Blob | ArrayBuffer;
}): Promise<{ videoId: string; url: string }> {
  const accessToken = await getValidAccessToken(opts.connectedAccountId);
  const { videoId } = await uploadVideo({
    accessToken,
    title: opts.title,
    description: opts.description,
    privacyStatus: opts.privacyStatus,
    tags: opts.tags,
    contentType: opts.contentType,
    video: opts.video,
  });
  return { videoId, url: `https://www.youtube.com/watch?v=${videoId}` };
}

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  handle?: string;
  thumbnailUrl?: string;
}

export async function fetchOwnChannel(accessToken: string): Promise<YouTubeChannelInfo | null> {
  const url = `${YOUTUBE_CHANNELS_URL}?part=snippet&mine=true`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`YouTube channels.list failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as {
    items?: Array<{
      id: string;
      snippet?: {
        title?: string;
        customUrl?: string;
        thumbnails?: { default?: { url?: string }; medium?: { url?: string } };
      };
    }>;
  };
  const item = json.items?.[0];
  if (!item) return null;
  return {
    id: item.id,
    title: item.snippet?.title ?? "YouTube channel",
    handle: item.snippet?.customUrl ?? undefined,
    thumbnailUrl:
      item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url ?? undefined,
  };
}

/**
 * Resumable upload of a video. `videoBlob` may be any Blob or ArrayBuffer.
 * Returns the created YouTube video id.
 */
export async function uploadVideo(opts: {
  accessToken: string;
  title: string;
  description?: string;
  privacyStatus?: "public" | "unlisted" | "private";
  tags?: string[];
  contentType: string; // e.g. "video/mp4"
  video: Blob | ArrayBuffer;
}): Promise<{ videoId: string }> {
  const metadata = {
    snippet: {
      title: opts.title,
      description: opts.description ?? "",
      tags: opts.tags,
    },
    status: {
      privacyStatus: opts.privacyStatus ?? "public",
      selfDeclaredMadeForKids: false,
    },
  };

  const size =
    opts.video instanceof Blob ? opts.video.size : (opts.video as ArrayBuffer).byteLength;

  // Step 1: start resumable session
  const init = await fetch(YOUTUBE_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "content-type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": String(size),
      "X-Upload-Content-Type": opts.contentType,
    },
    body: JSON.stringify(metadata),
  });
  if (!init.ok) {
    throw new Error(`YouTube resumable init failed (${init.status}): ${await init.text()}`);
  }
  const uploadUrl = init.headers.get("location");
  if (!uploadUrl) {
    throw new Error("YouTube resumable init returned no upload URL");
  }

  // Step 2: upload bytes in one PUT (fine for typical sizes; workers stream)
  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "content-type": opts.contentType,
      "content-length": String(size),
    },
    body: opts.video instanceof Blob ? opts.video : new Uint8Array(opts.video),
  });
  if (!putRes.ok) {
    throw new Error(`YouTube upload failed (${putRes.status}): ${await putRes.text()}`);
  }
  const created = (await putRes.json()) as { id?: string };
  if (!created.id) throw new Error("YouTube upload succeeded but returned no video id");
  return { videoId: created.id };
}