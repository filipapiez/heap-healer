// Server-only helpers for native Meta OAuth: Facebook Login for Business
// (Facebook Pages + Instagram Business) and Threads (separate flow, same
// META_APP_ID / META_APP_SECRET). Never import this file from a route file,
// component, or *.functions.ts module at the top level — the *.server.ts
// suffix keeps it out of client bundles.

const FB_GRAPH = "https://graph.facebook.com/v21.0";
const FB_OAUTH = "https://www.facebook.com/v21.0/dialog/oauth";
const THREADS_OAUTH = "https://threads.net/oauth/authorize";
const THREADS_GRAPH = "https://graph.threads.net";
const THREADS_TEXT_LIMIT = 500;

// Scopes for the combined Facebook + Instagram flow.
export const META_FB_IG_SCOPES = [
  "public_profile",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "business_management",
  "instagram_basic",
  "instagram_content_publish",
].join(",");

// Scopes for the Threads flow (separate OAuth server + scope namespace).
export const META_THREADS_SCOPES = [
  "threads_basic",
  "threads_content_publish",
].join(",");

export function requireMetaEnv() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("META_APP_ID / META_APP_SECRET are not configured.");
  }
  return { appId, appSecret };
}

/** Threads uses its own app credentials when provided; otherwise falls back to Meta. */
export function requireThreadsEnv() {
  const appId = process.env.THREADS_APP_ID || process.env.META_APP_ID;
  const appSecret = process.env.THREADS_APP_SECRET || process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("THREADS_APP_ID / THREADS_APP_SECRET (or META_APP_ID/SECRET) are not configured.");
  }
  return { appId, appSecret };
}

// ── Facebook + Instagram OAuth ─────────────────────────────────────────────

export function buildFacebookAuthorizeUrl(opts: {
  appId: string;
  redirectUri: string;
  state: string;
}) {
  const params = new URLSearchParams({
    client_id: opts.appId,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: META_FB_IG_SCOPES,
    state: opts.state,
  });
  return `${FB_OAUTH}?${params.toString()}`;
}

export async function exchangeFacebookCode(opts: {
  code: string;
  redirectUri: string;
}): Promise<{ access_token: string; expires_in?: number }> {
  const { appId, appSecret } = requireMetaEnv();
  const url = new URL(`${FB_GRAPH}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("code", opts.code);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`FB token exchange failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

/** Swap a short-lived FB user token for a ~60-day long-lived user token. */
export async function exchangeForLongLivedUserToken(shortToken: string): Promise<{ access_token: string; expires_in?: number }> {
  const { appId, appSecret } = requireMetaEnv();
  const url = new URL(`${FB_GRAPH}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("fb_exchange_token", shortToken);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`FB long-lived exchange failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

export interface FbPageInfo {
  id: string;
  name: string;
  access_token: string; // never-expiring Page token (when user token is long-lived)
  category?: string;
  instagram_business_account?: { id: string } | null;
  picture?: { data?: { url?: string } };
}

export async function fetchFacebookPages(userAccessToken: string): Promise<FbPageInfo[]> {
  const url = new URL(`${FB_GRAPH}/me/accounts`);
  url.searchParams.set(
    "fields",
    "id,name,access_token,category,instagram_business_account,picture{url}",
  );
  url.searchParams.set("access_token", userAccessToken);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`FB /me/accounts failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return (json.data ?? []) as FbPageInfo[];
}

/** Look up the IG Business Account username + avatar. Returns null if not linked. */
export async function fetchInstagramProfile(
  igBusinessId: string,
  pageAccessToken: string,
): Promise<{ id: string; username?: string; name?: string; profile_picture_url?: string } | null> {
  const url = new URL(`${FB_GRAPH}/${igBusinessId}`);
  url.searchParams.set("fields", "id,username,name,profile_picture_url");
  url.searchParams.set("access_token", pageAccessToken);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) return null;
  return json;
}

// ── Threads OAuth (separate authorize server, same app credentials) ────────

export function buildThreadsAuthorizeUrl(opts: {
  appId: string;
  redirectUri: string;
  state: string;
}) {
  const params = new URLSearchParams({
    client_id: opts.appId,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: META_THREADS_SCOPES,
    state: opts.state,
  });
  return `${THREADS_OAUTH}?${params.toString()}`;
}

export async function exchangeThreadsCode(opts: {
  code: string;
  redirectUri: string;
}): Promise<{ access_token: string; user_id: string }> {
  const { appId, appSecret } = requireThreadsEnv();
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: opts.redirectUri,
    code: opts.code,
  });
  const res = await fetch(`${THREADS_GRAPH}/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Threads token exchange failed (${res.status}): ${JSON.stringify(json)}`);
  return json;
}

/** Trade short-lived Threads token for ~60-day long-lived token. */
export async function exchangeThreadsLongLived(shortToken: string): Promise<{ access_token: string; expires_in: number; token_type: string }> {
  const { appSecret } = requireThreadsEnv();
  const url = new URL(`${THREADS_GRAPH}/access_token`);
  url.searchParams.set("grant_type", "th_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", shortToken);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(`Threads long-lived exchange failed (${res.status}): ${JSON.stringify(json)}`);
  return json;
}

/** Refresh a long-lived Threads token (only valid within its 60-day window). */
export async function refreshThreadsToken(longLivedToken: string): Promise<{ access_token: string; expires_in: number; token_type: string }> {
  const url = new URL(`${THREADS_GRAPH}/refresh_access_token`);
  url.searchParams.set("grant_type", "th_refresh_token");
  url.searchParams.set("access_token", longLivedToken);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(`Threads refresh failed (${res.status}): ${JSON.stringify(json)}`);
  return json;
}

export async function fetchThreadsProfile(accessToken: string): Promise<{ id: string; username?: string; name?: string; threads_profile_picture_url?: string }> {
  const url = new URL(`${THREADS_GRAPH}/me`);
  url.searchParams.set("fields", "id,username,name,threads_profile_picture_url");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(`Threads /me failed (${res.status}): ${JSON.stringify(json)}`);
  return json;
}

// ── Publishing helpers ─────────────────────────────────────────────────────

/** Publish a plain text (with optional link) post to a Facebook Page. */
export async function publishFacebookPagePost(opts: {
  pageId: string;
  pageAccessToken: string;
  message: string;
  link?: string;
}): Promise<{ id: string }> {
  const body = new URLSearchParams({
    message: opts.message,
    access_token: opts.pageAccessToken,
  });
  if (opts.link) body.set("link", opts.link);
  const res = await fetch(`${FB_GRAPH}/${opts.pageId}/feed`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`FB page post failed (${res.status}): ${JSON.stringify(json)}`);
  return json;
}

/**
 * Publish an image to an Instagram Business Account. Two-step: create media
 * container from a publicly reachable image URL, then publish it.
 */
export async function publishInstagramImage(opts: {
  igBusinessId: string;
  pageAccessToken: string;
  imageUrl: string;
  caption?: string;
}): Promise<{ id: string }> {
  const create = new URLSearchParams({
    image_url: opts.imageUrl,
    access_token: opts.pageAccessToken,
  });
  if (opts.caption) create.set("caption", opts.caption);
  const cRes = await fetch(`${FB_GRAPH}/${opts.igBusinessId}/media`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: create,
  });
  const cJson = await cRes.json();
  if (!cRes.ok) throw new Error(`IG media create failed (${cRes.status}): ${JSON.stringify(cJson)}`);

  const pub = new URLSearchParams({
    creation_id: cJson.id,
    access_token: opts.pageAccessToken,
  });
  const pRes = await fetch(`${FB_GRAPH}/${opts.igBusinessId}/media_publish`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: pub,
  });
  const pJson = await pRes.json();
  if (!pRes.ok) throw new Error(`IG publish failed (${pRes.status}): ${JSON.stringify(pJson)}`);
  return pJson;
}

/** Publish a text (optionally single image) Threads post. */
export async function publishThreadsPost(opts: {
  threadsUserId: string;
  accessToken: string;
  text: string;
  imageUrl?: string;
}): Promise<{ id: string }> {
  const text = Array.from(opts.text).slice(0, THREADS_TEXT_LIMIT).join("");
  const create = new URLSearchParams({
    media_type: opts.imageUrl ? "IMAGE" : "TEXT",
    text,
    access_token: opts.accessToken,
  });
  if (opts.imageUrl) create.set("image_url", opts.imageUrl);
  const cRes = await fetch(`${THREADS_GRAPH}/${opts.threadsUserId}/threads`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: create,
  });
  const cJson = await cRes.json();
  if (!cRes.ok) throw new Error(`Threads media create failed (${cRes.status}): ${JSON.stringify(cJson)}`);

  const pub = new URLSearchParams({
    creation_id: cJson.id,
    access_token: opts.accessToken,
  });
  const pRes = await fetch(`${THREADS_GRAPH}/${opts.threadsUserId}/threads_publish`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: pub,
  });
  const pJson = await pRes.json();
  if (!pRes.ok) throw new Error(`Threads publish failed (${pRes.status}): ${JSON.stringify(pJson)}`);
  return pJson;
}

/** Get a valid Meta access token for a connected account, refreshing Threads if needed. */
export async function getValidMetaAccessToken(connectedAccountId: string): Promise<{
  kind: "facebook_page" | "instagram" | "threads";
  accessToken: string;
  pageId: string | null;
  igBusinessId: string | null;
  metaUserId: string | null;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("meta_oauth_tokens" as never)
    .select("kind, access_token, refresh_token, expires_at, page_id, ig_business_id, meta_user_id")
    .eq("connected_account_id", connectedAccountId)
    .maybeSingle();
  if (error || !data) throw new Error("No Meta tokens found. Reconnect required.");
  const row = data as unknown as {
    kind: "facebook_page" | "instagram" | "threads";
    access_token: string;
    refresh_token: string | null;
    expires_at: string | null;
    page_id: string | null;
    ig_business_id: string | null;
    meta_user_id: string | null;
  };

  // Threads tokens rotate; refresh within 24h of expiry if we still have a valid one.
  if (row.kind === "threads" && row.expires_at) {
    const expiryMs = new Date(row.expires_at).getTime();
    const skewMs = 24 * 60 * 60 * 1000;
    if (Date.now() > expiryMs - skewMs && Date.now() < expiryMs) {
      const refreshed = await refreshThreadsToken(row.access_token);
      const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
      await supabaseAdmin
        .from("meta_oauth_tokens" as never)
        .update({ access_token: refreshed.access_token, expires_at: newExpiresAt } as never)
        .eq("connected_account_id", connectedAccountId);
      return {
        kind: row.kind,
        accessToken: refreshed.access_token,
        pageId: row.page_id,
        igBusinessId: row.ig_business_id,
        metaUserId: row.meta_user_id,
      };
    }
  }

  return {
    kind: row.kind,
    accessToken: row.access_token,
    pageId: row.page_id,
    igBusinessId: row.ig_business_id,
    metaUserId: row.meta_user_id,
  };
}

/** Best-effort disconnect: revoke permissions on the FB side, then delete the account row. */
export async function disconnectMetaAccount(connectedAccountId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("meta_oauth_tokens" as never)
    .select("kind, access_token, meta_user_id")
    .eq("connected_account_id", connectedAccountId)
    .maybeSingle();
  const tok = data as unknown as { kind: string; access_token: string; meta_user_id: string | null } | null;
  if (tok && tok.meta_user_id && tok.kind !== "threads") {
    // Revoke on Facebook Graph. Ignore failures.
    await fetch(`${FB_GRAPH}/${tok.meta_user_id}/permissions?access_token=${encodeURIComponent(tok.access_token)}`, {
      method: "DELETE",
    }).catch(() => {});
  }
  await supabaseAdmin.from("connected_accounts").delete().eq("id", connectedAccountId);
}