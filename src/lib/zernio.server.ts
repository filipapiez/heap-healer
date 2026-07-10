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

function baseUrl() {
  const url = process.env.ZERNIO_API_URL;
  if (!url) throw new Error("ZERNIO_API_URL is not configured");
  return url.replace(/\/$/, "");
}

function apiKey() {
  const key = process.env.ZERNIO_API_KEY;
  if (!key) throw new Error("ZERNIO_API_KEY is not configured");
  return key;
}

async function zernio<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Zernio ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Ask Zernio for a hosted connect URL. The user is sent there; Zernio then
 * calls our webhook (account.connected) with the new external account.
 */
export async function createConnectLink(input: {
  platform: SocialPlatform;
  workspaceId: string;
  userId: string;
  redirectUri: string;
  webhookUrl: string;
}): Promise<{ url: string }> {
  return zernio<{ url: string }>("/v1/connect-link", {
    method: "POST",
    body: JSON.stringify({
      platform: input.platform,
      state: `${input.workspaceId}:${input.userId}`,
      redirect_uri: input.redirectUri,
      webhook_url: input.webhookUrl,
    }),
  });
}

export async function disconnectZernioAccount(zernioAccountId: string): Promise<void> {
  await zernio(`/v1/accounts/${encodeURIComponent(zernioAccountId)}`, {
    method: "DELETE",
  });
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.ZERNIO_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  // Compute HMAC-SHA256 hex.
  const enc = new TextEncoder();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHmac, timingSafeEqual } = require("crypto") as typeof import("crypto");
  const expected = createHmac("sha256", secret).update(enc.encode(rawBody)).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}