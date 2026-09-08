// Robot form filling for captcha-free directory submission forms.
// Runs a headless browser through Browserless (BROWSERLESS_API_KEY). Without a
// key configured the whole path stays inactive and callers fall back to the
// manual queue — never a false "submitted" stamp.

export type FormProfile = {
  product_name?: string | null;
  tagline?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  category?: string | null;
  contact_email?: string | null;
  pricing_model?: string | null;
  founder_name?: string | null;
  twitter_handle?: string | null;
};

export type FormSubmitOutcome =
  | { ok: true; note: string }
  | { ok: false; error: string; captcha?: boolean; unavailable?: boolean };

/** Heuristic value for a form field, chosen from its name/label/placeholder. */
function valueFor(hint: string, profile: FormProfile): string | null {
  const h = hint.toLowerCase();
  const pick = (v?: string | null) => (v && String(v).trim() ? String(v) : null);
  if (/(^|[^a-z])url|website|site|link|domain/.test(h)) return pick(profile.website_url);
  if (/e-?mail/.test(h)) return pick(profile.contact_email);
  if (/twitter|x handle|social/.test(h)) return pick(profile.twitter_handle);
  if (/logo|image|icon/.test(h)) return pick(profile.logo_url);
  if (/tagline|slogan|headline|short desc|summary|one.?liner/.test(h))
    return pick(profile.tagline) ?? pick(profile.short_description);
  if (/description|about|detail|pitch|bio/.test(h))
    return pick(profile.long_description) ?? pick(profile.short_description);
  if (/category|tag|topic/.test(h)) return pick(profile.category);
  if (/pricing|price|plan|cost/.test(h)) return pick(profile.pricing_model);
  if (/first ?name|your name|full ?name|founder|contact|maker/.test(h)) return pick(profile.founder_name);
  if (/name|product|title|tool|app|company|startup/.test(h)) return pick(profile.product_name);
  return null;
}

export function browserAutomationEnabled(): boolean {
  return Boolean(process.env["BROWSERLESS_API_KEY"]);
}

/**
 * Fill and submit a plain directory form. Returns `unavailable` when no browser
 * service is configured, and `captcha` when the page is protected — both leave
 * the submission honestly unsent.
 */
export async function submitDirectoryForm(
  submitUrl: string,
  profile: FormProfile,
): Promise<FormSubmitOutcome> {
  const key = process.env["BROWSERLESS_API_KEY"];
  if (!key) return { ok: false, error: "Browser automation not configured", unavailable: true };
  const endpoint = `${process.env["BROWSERLESS_URL"] ?? "https://production-sfo.browserless.io"}/function?token=${key}`;

  const script = `
export default async function ({ page, context }) {
  const { url, profile } = context;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  const html = await page.content();
  if (/recaptcha|hcaptcha|turnstile|cf-challenge/i.test(html)) {
    return { data: { status: "captcha" }, type: "application/json" };
  }
  const fields = await page.$$eval("form input, form textarea, form select", (nodes) =>
    nodes.map((n, i) => ({
      i,
      tag: n.tagName.toLowerCase(),
      type: (n.getAttribute("type") || "text").toLowerCase(),
      hint: [n.getAttribute("name"), n.getAttribute("id"), n.getAttribute("placeholder"),
             n.getAttribute("aria-label"), n.closest("label")?.innerText || ""].filter(Boolean).join(" "),
    })),
  );
  if (!fields.length) return { data: { status: "no-form" }, type: "application/json" };
  const handles = await page.$$("form input, form textarea, form select");
  let filled = 0;
  for (const f of fields) {
    if (["hidden", "submit", "button", "file", "checkbox", "radio"].includes(f.type)) continue;
    const value = profile[f.i];
    if (!value) continue;
    try { await handles[f.i].fill(String(value)); filled++; } catch (e) {}
  }
  if (!filled) return { data: { status: "no-match" }, type: "application/json" };
  const before = page.url();
  const button = await page.$('form button[type=submit], form input[type=submit], form button');
  if (!button) return { data: { status: "no-submit" }, type: "application/json" };
  await button.click().catch(() => {});
  await page.waitForTimeout(4000);
  const after = page.url();
  const body = (await page.evaluate(() => document.body.innerText || "")).slice(0, 1200);
  return { data: { status: "submitted", before, after, body, filled }, type: "application/json" };
}`;

  // Resolve the values the remote script should type, keyed by field index is
  // impossible before we see the form — so we send the profile and let the
  // remote page report hints back. Two-phase: first inspect, then fill.
  try {
    const inspect = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/javascript" },
      body: script.replace("const value = profile[f.i];", "const value = null;"),
    });
    if (!inspect.ok) {
      const text = await inspect.text();
      return { ok: false, error: `Browser service HTTP ${inspect.status}: ${text.slice(0, 200)}` };
    }
  } catch {
    /* inspection is best-effort; fall through to the real attempt */
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: script,
        context: { url: submitUrl, profile: buildIndexedValues(profile) },
      }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `Browser service HTTP ${res.status}: ${text.slice(0, 200)}` };
    const payload = JSON.parse(text) as { status?: string; after?: string; before?: string; body?: string };
    if (payload.status === "captcha")
      return { ok: false, error: "Form protected by captcha — needs a human", captcha: true };
    if (payload.status === "submitted") {
      const confirmed = /thank|received|success|submitted|review/i.test(payload.body ?? "") ||
        payload.after !== payload.before;
      return confirmed
        ? { ok: true, note: "Submitted through the directory's own form" }
        : { ok: false, error: "Form submitted but no confirmation detected" };
    }
    return { ok: false, error: `Form could not be completed automatically (${payload.status ?? "unknown"})` };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Field-hint matching happens in the browser, so send a lookup table the
 *  remote script can consult by hint text. */
function buildIndexedValues(profile: FormProfile): Record<string, string> {
  const hints = [
    "name",
    "url",
    "email",
    "tagline",
    "description",
    "category",
    "pricing",
    "founder",
    "twitter",
    "logo",
  ];
  const out: Record<string, string> = {};
  for (const hint of hints) {
    const value = valueFor(hint, profile);
    if (value) out[hint] = value;
  }
  return out;
}
