// Server-only Zernio adapter. Never import from client-reachable code without
// going through a createServerFn handler (see accounts.functions.ts).
import type { Database } from "@/integrations/supabase/types";

export type SocialPlatform = Database["public"]["Enums"]["social_platform"];

export const PLATFORMS: readonly SocialPlatform[] = [
  "youtube", "x", "instagram", "facebook", "pinterest",
  "linkedin", "tiktok", "threads", "bluesky", "reddit", "google_business",
] as const;

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  youtube: "YouTube",
  x: "X (Twitter)",
  instagram: "Instagram",
  facebook: "Facebook",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  threads: "Threads",
  bluesky: "Bluesky",
  reddit: "Reddit",
  google_business: "Google Business",
};

// Map our internal enum to Zernio's platform slugs.
const ZERNIO_PLATFORM: Record<SocialPlatform, string> = {
  youtube: "youtube",
  x: "twitter",
  instagram: "instagram",
  facebook: "facebook",
  pinterest: "pinterest",
  linkedin: "linkedin",
  tiktok: "tiktok",
  threads: "threads",
  bluesky: "bluesky",
  reddit: "reddit",
  google_business: "googlebusiness",
};

function baseUrl() {
  const raw = (process.env.ZERNIO_API_URL || "https://zernio.com").trim().replace(/\/+$/, "");
  // Extract origin only — users often paste dashboard URLs like
  // https://zernio.com/dashboard/api-keys, which would 404.
  let origin = raw;
  try { origin = new URL(raw).origin; } catch { origin = "https://zernio.com"; }
  return `${origin}/api`;
}

function apiKey() {
  const key = process.env.ZERNIO_API_KEY;
  if (!key) throw new Error("ZERNIO_API_KEY is not configured");
  return key;
}

async function zernio<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${baseUrl()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey()}`,
        ...(init.headers ?? {}),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Zernio fetch failed for ${url}: ${msg}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Zernio ${res.status} at ${url}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Find or create a Zernio profile for a given workspace. Profiles are the
 * account containers in Zernio's model; we use one per workspace and match by
 * the workspace name we stored on Zernio's side.
 */
export async function ensureZernioProfileId(workspaceName: string, workspaceId: string): Promise<string> {
  const nameTag = `mma:${workspaceId}`; // stable, unique per workspace
  const list = await zernio<{ profiles?: Array<{ _id: string; name: string; description?: string }> }>(
    "/v1/profiles",
    { method: "GET" },
  );
  const existing = (list.profiles ?? []).find(
    (p) => p.description === nameTag || p.name === nameTag,
  );
  if (existing) return existing._id;
  const created = await zernio<{ profile: { _id: string } }>("/v1/profiles", {
    method: "POST",
    body: JSON.stringify({
      name: workspaceName.slice(0, 60) || "Workspace",
      description: nameTag,
    }),
  });
  return created.profile._id;
}

/**
 * Ask Zernio for a hosted connect URL. The user is redirected there; Zernio
 * completes OAuth and then redirects back to our redirectUri and also fires
 * an account.connected webhook we ingest in /api/public/zernio.
 */
export async function createConnectLink(input: {
  platform: SocialPlatform;
  profileId: string;
  redirectUri: string;
}): Promise<{ url: string }> {
  const platform = ZERNIO_PLATFORM[input.platform];
  const qs = new URLSearchParams({
    profileId: input.profileId,
    redirect_url: input.redirectUri,
  }).toString();
  const res = await zernio<{ authUrl: string }>(
    `/v1/connect/${encodeURIComponent(platform)}?${qs}`,
    { method: "GET" },
  );
  return { url: res.authUrl };
}

export async function disconnectZernioAccount(zernioAccountId: string): Promise<void> {
  // Zernio's account resource lives at DELETE /v1/accounts/{accountId}.
  await fetch(`${baseUrl()}/v1/accounts/${encodeURIComponent(zernioAccountId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
}

/**
 * Publish a post to a single connected account via Zernio.
 * Returns the external post id/url when Zernio provides them.
 */
export async function publishToZernio(input: {
  zernioAccountId: string;
  platform: SocialPlatform;
  caption: string;
  mediaUrls: string[];
}): Promise<{ external_post_id?: string; external_url?: string }> {
  const res = await zernio<{ postId?: string; publicUrl?: string }>("/v1/posts", {
    method: "POST",
    body: JSON.stringify({
      accounts: [input.zernioAccountId],
      content: input.caption,
      mediaUrls: input.mediaUrls,
    }),
  });
  return { external_post_id: res.postId, external_url: res.publicUrl };
}

export async function verifyWebhookSignature(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = process.env.ZERNIO_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const { createHmac, timingSafeEqual } = await import("crypto");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}