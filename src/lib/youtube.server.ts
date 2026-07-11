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