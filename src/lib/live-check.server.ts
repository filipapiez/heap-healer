import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Verifies that a published page really loads on the customer's live site.
 * Status: live | waiting_publish (Lovable site not re-published yet) | not_live | checking
 */
export type LiveStatus = "live" | "waiting_publish" | "not_live" | "checking";

type CheckResult = { status: LiveStatus; reason: string | null; host: string | null };

const UA = "MentionMyApp-LiveCheck/1.0 (+https://mentionmyapp.com)";

async function get(url: string) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, "cache-control": "no-cache" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  return { status: res.status, text: res.ok ? await res.text() : "" };
}

function titleOf(html: string) {
  return (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim().toLowerCase();
}

function detectHost(html: string, url: string): string | null {
  if (/lovable\.app|gptengineer|lovable-tagger|lovable\.dev/i.test(html) || /\.lovable\.app$/i.test(new URL(url).hostname))
    return "lovable";
  if (/vercel/i.test(html)) return "vercel";
  if (/netlify/i.test(html)) return "netlify";
  return null;
}

export async function checkPageLive(url: string, slug: string, title?: string | null): Promise<CheckResult> {
  let page;
  try {
    page = await get(url);
  } catch (e) {
    return { status: "not_live", reason: `Site didn't respond: ${e instanceof Error ? e.message : e}`, host: null };
  }
  const host = page.text ? detectHost(page.text, url) : null;
  if (page.status === 404 || page.status >= 500 || !page.text) {
    return { status: host === "lovable" ? "waiting_publish" : "not_live", reason: `Page returned ${page.status}`, host };
  }

  const html = page.text.toLowerCase();
  const pageTitle = titleOf(page.text);
  const wanted = (title ?? "").toLowerCase().trim();
  // Server-rendered pages: our own title/heading is in the HTML.
  if (wanted && (pageTitle.includes(wanted.slice(0, 40)) || html.includes(wanted.slice(0, 40)))) {
    return { status: "live", reason: null, host };
  }

  // Single-page apps (Lovable, Vite): HTML is the same shell for every URL, so
  // look inside the deployed JavaScript for the page's route.
  const origin = new URL(url).origin;
  const scripts = [...page.text.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)]
    .map((m) => new URL(m[1], origin).toString())
    .filter((s) => s.startsWith(origin))
    .slice(0, 4);
  const needles = [`/${slug}"`, `/${slug}'`, `/${slug}\``, `"${slug}"`];
  const seen = new Set<string>();
  const queue = [...scripts];
  while (queue.length && seen.size < 25) {
    const src = queue.shift()!;
    if (seen.has(src)) continue;
    seen.add(src);
    try {
      const js = await get(src);
      if (needles.some((n) => js.text.includes(n))) return { status: "live", reason: null, host };
      // Follow lazily-loaded route chunks.
      for (const m of js.text.matchAll(/["'`]((?:\.\/|\/assets\/|assets\/)[\w.-]+\.js)["'`]/g)) {
        const path = m[1].startsWith("assets/") ? `/${m[1]}` : m[1];
        const next = new URL(path, src).toString();
        if (next.startsWith(origin) && !seen.has(next)) queue.push(next);
      }
    } catch {
      /* ignore single chunk failure */
    }
  }

  if (host === "lovable") {
    return {
      status: "waiting_publish",
      reason: "The page is saved in the code, but the Lovable site hasn't been re-published yet.",
      host,
    };
  }
  return { status: "not_live", reason: "The page address shows the homepage or a not-found page.", host };
}

/** Re-check every page that isn't confirmed live yet. Backs off after many attempts. */
export async function runLiveChecks(options: { clientId?: string; limit?: number } = {}) {
  let q = supabaseAdmin
    .from("seo_pages" as never)
    .select("id,url,title,live_status,live_check_attempts,live_checked_at")
    .neq("live_status", "live")
    .order("published_at", { ascending: false })
    .limit(options.limit ?? 40);
  if (options.clientId) q = q.eq("client_id", options.clientId);
  const { data, error } = await q;
  if (error) throw error;

  let live = 0;
  let pending = 0;
  for (const raw of (data ?? []) as unknown as Array<{
    id: string; url: string; title: string | null; live_check_attempts: number; live_checked_at: string | null;
  }>) {
    // Back off: after 12 attempts only re-check every 6 hours.
    if (raw.live_check_attempts > 12 && raw.live_checked_at &&
        Date.now() - new Date(raw.live_checked_at).getTime() < 6 * 3600_000) continue;
    let slug = "";
    try {
      slug = new URL(raw.url).pathname.replace(/^\/+|\/+$/g, "").split("/").pop() ?? "";
    } catch {
      continue;
    }
    if (!slug) continue;
    const result = await checkPageLive(raw.url, slug, raw.title);
    if (result.status === "live") live++;
    else pending++;
    await supabaseAdmin
      .from("seo_pages" as never)
      .update({
        live_status: result.status,
        live_reason: result.reason,
        live_host: result.host,
        live_checked_at: new Date().toISOString(),
        live_check_attempts: raw.live_check_attempts + 1,
      } as never)
      .eq("id", raw.id);
  }
  return { checked: live + pending, live, pending };
}
