// Daily article syndication: republishes each newly generated SEO page to the
// workspace's connected writing platforms (Dev.to, Hashnode, Medium) with a
// canonical link back to the original page. These are real, automatic backlinks.

import { renderPageMarkdown, type GeneratedPage } from "./page-content";

type Account = {
  id: string;
  workspace_id: string;
  platform: "devto" | "hashnode" | "medium";
  api_token: string;
  handle: string | null;
  publication_id: string | null;
  status: string;
};

type PublishResult = { ok: true; url: string | null } | { ok: false; error: string };

const MAX_PAGES_PER_RUN = 3;
const TAG_RE = /[^a-z0-9]/g;

function tagsFor(page: GeneratedPage): string[] {
  return [page.primaryKeyword, ...(page.secondaryKeywords ?? [])]
    .slice(0, 4)
    .map((t) => t.toLowerCase().replace(TAG_RE, ""))
    .filter((t) => t.length >= 2 && t.length <= 24);
}

function intro(page: GeneratedPage, canonical: string) {
  return `${renderPageMarkdown(page)}\n\n---\n\n*Originally published at [${new URL(canonical).host}](${canonical}).*\n`;
}

async function publishDevTo(account: Account, page: GeneratedPage, canonical: string): Promise<PublishResult> {
  try {
    const res = await fetch("https://dev.to/api/articles", {
      method: "POST",
      headers: { "api-key": account.api_token, "Content-Type": "application/json" },
      body: JSON.stringify({
        article: {
          title: page.seoTitle || page.h1,
          body_markdown: intro(page, canonical),
          published: true,
          canonical_url: canonical,
          description: page.metaDescription,
          tags: tagsFor(page),
        },
      }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `Dev.to HTTP ${res.status}: ${text.slice(0, 300)}` };
    const json = JSON.parse(text) as { url?: string };
    return { ok: true, url: json.url ?? null };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function publishHashnode(account: Account, page: GeneratedPage, canonical: string): Promise<PublishResult> {
  if (!account.publication_id) return { ok: false, error: "Hashnode publication id missing" };
  const mutation = `mutation Publish($input: PublishPostInput!) {
    publishPost(input: $input) { post { url } }
  }`;
  try {
    const res = await fetch("https://gql.hashnode.com", {
      method: "POST",
      headers: { Authorization: account.api_token, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            title: page.seoTitle || page.h1,
            publicationId: account.publication_id,
            contentMarkdown: intro(page, canonical),
            originalArticleURL: canonical,
            tags: tagsFor(page).map((slug) => ({ slug, name: slug })),
          },
        },
      }),
    });
    const json = (await res.json()) as {
      data?: { publishPost?: { post?: { url?: string } } };
      errors?: Array<{ message: string }>;
    };
    if (json.errors?.length) return { ok: false, error: `Hashnode: ${json.errors[0].message}` };
    return { ok: true, url: json.data?.publishPost?.post?.url ?? null };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function publishMedium(account: Account, page: GeneratedPage, canonical: string): Promise<PublishResult> {
  try {
    let authorId = account.handle;
    if (!authorId) {
      const me = await fetch("https://api.medium.com/v1/me", {
        headers: { Authorization: `Bearer ${account.api_token}` },
      });
      if (!me.ok) return { ok: false, error: `Medium auth failed (HTTP ${me.status})` };
      const meJson = (await me.json()) as { data?: { id?: string } };
      authorId = meJson.data?.id ?? null;
    }
    if (!authorId) return { ok: false, error: "Medium user id unavailable" };
    const res = await fetch(`https://api.medium.com/v1/users/${authorId}/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${account.api_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        title: page.seoTitle || page.h1,
        contentFormat: "markdown",
        content: intro(page, canonical),
        canonicalUrl: canonical,
        tags: tagsFor(page).slice(0, 3),
        publishStatus: "public",
      }),
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `Medium HTTP ${res.status}: ${text.slice(0, 300)}` };
    const json = JSON.parse(text) as { data?: { url?: string } };
    return { ok: true, url: json.data?.url ?? null };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

function publisher(platform: Account["platform"]) {
  if (platform === "devto") return publishDevTo;
  if (platform === "hashnode") return publishHashnode;
  return publishMedium;
}

export type SyndicationRunResult = {
  ok: true;
  accounts: number;
  published: number;
  failed: number;
  details: Array<{ workspace: string; platform: string; page: string; url?: string | null; error?: string }>;
};

/** Republish recent generated pages to every connected writing platform. */
export async function runDailySyndication(opts?: { workspaceId?: string }): Promise<SyndicationRunResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let accountQuery = supabaseAdmin
    .from("syndication_accounts")
    .select("id,workspace_id,platform,api_token,handle,publication_id,status")
    .eq("status", "connected");
  if (opts?.workspaceId) accountQuery = accountQuery.eq("workspace_id", opts.workspaceId);
  const { data: accountRows, error: accountError } = await accountQuery;
  if (accountError) throw accountError;
  const accounts = (accountRows ?? []) as unknown as Account[];

  const details: SyndicationRunResult["details"] = [];
  let published = 0;
  let failed = 0;

  const byWorkspace = new Map<string, Account[]>();
  for (const account of accounts) {
    const list = byWorkspace.get(account.workspace_id) ?? [];
    list.push(account);
    byWorkspace.set(account.workspace_id, list);
  }

  for (const [workspaceId, workspaceAccounts] of byWorkspace) {
    const { data: pageRows, error: pageError } = await supabaseAdmin
      .from("generated_pages")
      .select("id,canonical_url,content_json,primary_keyword")
      .eq("workspace_id", workspaceId)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(10);
    if (pageError) throw pageError;

    const { data: doneRows } = await supabaseAdmin
      .from("syndication_posts")
      .select("generated_page_id,platform")
      .eq("workspace_id", workspaceId)
      .eq("status", "published");
    const done = new Set((doneRows ?? []).map((row) => `${row.generated_page_id}:${row.platform}`));

    for (const account of workspaceAccounts) {
      let count = 0;
      for (const row of pageRows ?? []) {
        if (count >= MAX_PAGES_PER_RUN) break;
        if (done.has(`${row.id}:${account.platform}`)) continue;
        const page = row.content_json as unknown as GeneratedPage | null;
        if (!page?.h1) continue;
        const canonical = row.canonical_url;
        if (!canonical?.startsWith("http")) continue;

        const result = await publisher(account.platform)(account, page, canonical);
        count += 1;
        if (result.ok) published += 1;
        else failed += 1;

        await supabaseAdmin.from("syndication_posts").upsert(
          {
            workspace_id: workspaceId,
            generated_page_id: row.id,
            platform: account.platform,
            title: page.seoTitle || page.h1,
            external_url: result.ok ? result.url : null,
            status: result.ok ? "published" : "failed",
            error: result.ok ? null : result.error,
          },
          { onConflict: "generated_page_id,platform" },
        );

        await supabaseAdmin
          .from("syndication_accounts")
          .update({
            last_used_at: new Date().toISOString(),
            last_error: result.ok ? null : result.error,
            status: result.ok ? "connected" : "error",
          })
          .eq("id", account.id);

        details.push({
          workspace: workspaceId,
          platform: account.platform,
          page: row.primary_keyword,
          url: result.ok ? result.url : undefined,
          error: result.ok ? undefined : result.error,
        });
      }
    }
  }

  return { ok: true, accounts: accounts.length, published, failed, details };
}
