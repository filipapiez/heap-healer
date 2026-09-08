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

export function browserAutomationEnabled(): boolean {
  return Boolean(process.env["BROWSERLESS_API_KEY"]);
}

function text(value?: string | null): string | null {
  return value && String(value).trim() ? String(value).trim() : null;
}

/** Values the remote script matches against each field's name/label/placeholder. */
function fieldValues(profile: FormProfile): Record<string, string> {
  const map: Record<string, string | null> = {
    website: text(profile.website_url),
    email: text(profile.contact_email),
    twitter: text(profile.twitter_handle),
    logo: text(profile.logo_url),
    tagline: text(profile.tagline) ?? text(profile.short_description),
    description: text(profile.long_description) ?? text(profile.short_description),
    category: text(profile.category),
    pricing: text(profile.pricing_model),
    person: text(profile.founder_name),
    product: text(profile.product_name),
  };
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(map)) if (value) out[key] = value;
  return out;
}

const REMOTE_SCRIPT = `
export default async function ({ page, context }) {
  const { url, values } = context;
  const json = (data) => ({ data, type: "application/json" });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  const html = await page.content();
  if (/recaptcha|hcaptcha|turnstile|cf-challenge/i.test(html)) return json({ status: "captcha" });

  const selector = "form input, form textarea, form select";
  const handles = await page.$$(selector);
  if (!handles.length) return json({ status: "no-form" });
  const meta = await page.$$eval(selector, (nodes) =>
    nodes.map((n) => ({
      type: (n.getAttribute("type") || n.tagName).toLowerCase(),
      hint: [
        n.getAttribute("name"),
        n.getAttribute("id"),
        n.getAttribute("placeholder"),
        n.getAttribute("aria-label"),
        (n.closest("label") && n.closest("label").innerText) || "",
      ].filter(Boolean).join(" ").toLowerCase(),
    })),
  );

  const pick = (hint) => {
    if (/e-?mail/.test(hint)) return values.email;
    if (/url|website|site|link|domain/.test(hint)) return values.website;
    if (/twitter|x handle|social/.test(hint)) return values.twitter;
    if (/logo|image|icon/.test(hint)) return values.logo;
    if (/tagline|slogan|headline|short|summary|one.?liner/.test(hint)) return values.tagline;
    if (/description|about|detail|pitch|bio/.test(hint)) return values.description;
    if (/category|tag|topic/.test(hint)) return values.category;
    if (/pricing|price|plan|cost/.test(hint)) return values.pricing;
    if (/founder|your name|full ?name|first ?name|contact|maker/.test(hint)) return values.person;
    if (/name|product|title|tool|app|company|startup/.test(hint)) return values.product;
    return null;
  };

  let filled = 0;
  for (let i = 0; i < meta.length; i++) {
    const field = meta[i];
    if (["hidden", "submit", "button", "file", "checkbox", "radio", "select"].includes(field.type)) continue;
    const value = pick(field.hint);
    if (!value) continue;
    try { await handles[i].fill(String(value)); filled++; } catch (e) {}
  }
  if (!filled) return json({ status: "no-match" });

  const before = page.url();
  const button = await page.$("form button[type=submit], form input[type=submit], form button");
  if (!button) return json({ status: "no-submit" });
  await button.click().catch(() => {});
  await page.waitForTimeout(4000);
  const body = (await page.evaluate(() => document.body.innerText || "")).slice(0, 1200);
  return json({ status: "submitted", before, after: page.url(), body, filled });
}`;

/**
 * Fill and submit a plain directory form. Returns `unavailable` when no browser
 * service is configured and `captcha` when the page is protected — both leave
 * the submission honestly unsent.
 */
export async function submitDirectoryForm(
  submitUrl: string,
  profile: FormProfile,
): Promise<FormSubmitOutcome> {
  const key = process.env["BROWSERLESS_API_KEY"];
  if (!key) return { ok: false, error: "Browser automation not configured", unavailable: true };
  const base = process.env["BROWSERLESS_URL"] ?? "https://production-sfo.browserless.io";
  const values = fieldValues(profile);
  if (!values["product"] || !values["website"]) {
    return { ok: false, error: "Submission profile incomplete", unavailable: true };
  }

  try {
    const res = await fetch(`${base}/function?token=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: REMOTE_SCRIPT, context: { url: submitUrl, values } }),
    });
    const raw = await res.text();
    if (!res.ok) return { ok: false, error: `Browser service HTTP ${res.status}: ${raw.slice(0, 200)}` };
    const payload = JSON.parse(raw) as {
      status?: string;
      before?: string;
      after?: string;
      body?: string;
    };
    if (payload.status === "captcha")
      return { ok: false, error: "Form protected by captcha — needs a human", captcha: true };
    if (payload.status === "submitted") {
      const confirmed =
        /thank|received|success|submitted|review|we'll be in touch/i.test(payload.body ?? "") ||
        payload.after !== payload.before;
      return confirmed
        ? { ok: true, note: "Submitted through the directory's own form" }
        : { ok: false, error: "Form filled but no confirmation detected" };
    }
    return {
      ok: false,
      error: `Form could not be completed automatically (${payload.status ?? "unknown"})`,
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
