// Server-side auto-submission for directories that accept form/API POSTs.
// Realistic scope: most directories require captcha/human verification, so
// only a subset actually go through. Rest fall to the manual queue.

type Profile = {
  product_name?: string | null;
  tagline?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  category?: string | null;
  contact_email?: string | null;
  pricing_model?: string | null;
  twitter_handle?: string | null;
  founder_name?: string | null;
};

type Directory = {
  slug: string;
  name: string;
  submit_url: string;
  submission_method: string;
  auto_submit_config: Record<string, unknown> | null;
};

export type SubmitResult =
  | { ok: true; live_url?: string | null; note?: string }
  | { ok: false; error: string; needs_manual: boolean };

const REQUIRED_FIELDS: (keyof Profile)[] = [
  "product_name",
  "tagline",
  "short_description",
  "website_url",
  "contact_email",
];

function missingProfile(p: Profile | null): string | null {
  if (!p) return "Fill your submission profile first (product name, tagline, description, website, email).";
  const missing = REQUIRED_FIELDS.filter((f) => !p[f] || String(p[f]).trim() === "");
  return missing.length ? `Missing profile fields: ${missing.join(", ")}` : null;
}

// Real form auto-submit rarely works — most directories use captcha, CSRF tokens,
// or human review. We only attempt when auto_submit_config explicitly whitelists
// the endpoint; otherwise we short-circuit to pending_action.
export async function attemptAutoSubmit(
  directory: Directory,
  profile: Profile | null,
): Promise<SubmitResult> {
  const gap = missingProfile(profile);
  if (gap) return { ok: false, error: gap, needs_manual: true };

  if (!directory.auto_submit_config) {
    return { ok: false, error: "No auto-submit config — manual submission required.", needs_manual: true };
  }

  const cfg = directory.auto_submit_config as {
    method?: string;
    endpoint?: string;
    fields?: Record<string, string>;
    content_type?: string;
  };
  if (!cfg.endpoint) {
    return { ok: false, error: "Missing endpoint in auto_submit_config.", needs_manual: true };
  }

  const fieldMap = cfg.fields ?? {};
  const body: Record<string, string> = {};
  for (const [remote, local] of Object.entries(fieldMap)) {
    const val = (profile as Record<string, unknown>)[local];
    if (val != null) body[remote] = String(val);
  }

  const contentType = cfg.content_type ?? "application/x-www-form-urlencoded";
  const init: RequestInit = {
    method: cfg.method ?? "POST",
    headers: { "Content-Type": contentType, "User-Agent": "MentionMyApp/1.0 (+https://mentionmyapp.com)" },
    body:
      contentType === "application/json"
        ? JSON.stringify(body)
        : new URLSearchParams(body).toString(),
  };

  try {
    const res = await fetch(cfg.endpoint, init);
    const text = (await res.text()).slice(0, 500);
    if (res.status >= 200 && res.status < 400) {
      return { ok: true, note: `Auto-submitted (HTTP ${res.status})` };
    }
    return {
      ok: false,
      error: `Auto-submit rejected (HTTP ${res.status}): ${text}`,
      needs_manual: true,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Auto-submit network error: ${msg}`, needs_manual: true };
  }
}
