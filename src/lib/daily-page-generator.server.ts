// Daily SEO page generation. Runs once per calendar day per connected website:
// gather real context -> pick an uncovered search opportunity -> generate a
// structured page -> quality gate -> render natively -> queue a publish job.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  detectPublishingConfig,
  renderPageFile,
  resolvePagePath,
  upsertSitemapEntry,
  type PublishingConfig,
} from "@/lib/repo-adapter.server";
import {
  scoreGeneratedPage,
  wordCount,
  type GeneratedPage,
} from "@/lib/page-content";

const MODEL = "google/gemini-3.1-pro-preview";
const QUALITY_THRESHOLD = 75;
const MAX_ATTEMPTS = 2;

type Connection = {
  id: string;
  workspace_id: string;
  external_id: string;
  display_name: string | null;
  metadata: Record<string, unknown>;
  framework: string | null;
  publish_path: string | null;
  content_format: string | null;
  router_type: string | null;
  sitemap_path: string | null;
};

type WebsiteResult = {
  workspaceId: string;
  connectionId: string;
  status: "generated" | "skipped" | "failed";
  slug?: string;
  seoScore?: number;
  stage?: string;
  message?: string;
};

async function hash(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normaliseTopic(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !["the", "and", "for", "with", "your", "best"].includes(word))
    .sort()
    .join("-");
}

function originOf(website: string) {
  const url = website.startsWith("http") ? website : `https://${website}`;
  return new URL(url).origin;
}

async function callModel(system: string, user: string): Promise<GeneratedPage> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI generation failed (${response.status}): ${body.slice(0, 400)}`);
  }
  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned an empty page");
  const json = content.trim().replace(/^```(?:json)?/, "").replace(/```$/, "");
  return JSON.parse(json) as GeneratedPage;
}

const SYSTEM_PROMPT = `You are the in-house SEO content lead for the company whose website you are writing for.
You write pages that the company itself publishes on its own domain.

Hard rules:
- Only use facts supplied in the context. Never invent customers, reviews, testimonials, revenue, awards, partnerships, statistics, pricing, integrations, certifications, or product features.
- Never reference GitHub, the repository, or a README. Write as the company.
- Never use superlatives such as "best", "#1", "leading", or "most trusted" unless the context states them.
- Never open with filler such as "In today's digital landscape", "In today's fast-paced world", "Technology is constantly evolving", or "Are you searching for". Answer the searcher's question in the first sentence.
- Internal links may ONLY use URLs from the provided list of existing site URLs. Never invent a URL.
- Exactly one H1. Do not keyword stuff. Do not emit a meta keywords tag.
- SEO title 45-65 characters. Meta description 120-165 characters.
- Produce 5-8 meaningful sections and 4-6 genuinely useful FAQs. Aim for 800-1500 words when the topic warrants it.
- Structured data must only use schema types that truthfully apply. Never emit AggregateRating, Review, or Offer.

Reply with a single JSON object matching exactly this shape (no markdown, no commentary):
{"slug":"","pageType":"landing-page|feature-page|use-case|informational|industry-page","searchIntent":"informational|commercial|transactional|mixed","primaryKeyword":"","secondaryKeywords":[],"semanticKeywords":[],"entities":[],"seoTitle":"","metaDescription":"","h1":"","hero":{"eyebrow":"","heading":"","description":""},"introduction":"","sections":[{"heading":"","content":""}],"features":[{"name":"","description":""}],"faqs":[{"question":"","answer":""}],"internalLinks":[{"anchorText":"","url":""}],"cta":{"heading":"","description":"","buttonText":"","buttonUrl":""},"canonicalUrl":"","structuredData":{},"breadcrumbs":[{"name":"","url":""}]}`;

async function generateForConnection(connection: Connection): Promise<WebsiteResult> {
  const base: WebsiteResult = {
    workspaceId: connection.workspace_id,
    connectionId: connection.id,
    status: "skipped",
  };

  const installationId = Number(connection.metadata?.installation_id);
  if (!Number.isSafeInteger(installationId) || installationId <= 0) {
    return { ...base, message: "GitHub installation metadata is unavailable" };
  }

  // One page per website per calendar day.
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { data: today, error: todayError } = await supabaseAdmin
    .from("generated_pages" as never)
    .select("id")
    .eq("workspace_id", connection.workspace_id)
    .gte("generated_at", startOfDay.toISOString())
    .limit(1);
  if (todayError) throw todayError;
  if ((today ?? []).length) return { ...base, message: "Already generated today" };

  const [{ data: client }, { data: profile }, { data: previous }] = await Promise.all([
    supabaseAdmin
      .from("seo_clients" as never)
      .select("id,name,website")
      .eq("workspace_id", connection.workspace_id)
      .maybeSingle(),
    supabaseAdmin
      .from("workspace_directory_profile" as never)
      .select("product_name,tagline,short_description,long_description,website_url,category")
      .eq("workspace_id", connection.workspace_id)
      .maybeSingle(),
    supabaseAdmin
      .from("generated_pages" as never)
      .select("slug,primary_keyword,topic,semantic_topic_hash,canonical_url")
      .eq("workspace_id", connection.workspace_id)
      .order("generated_at", { ascending: false })
      .limit(100),
  ]);

  const clientRow = client as unknown as { id: string; name: string; website: string } | null;
  const profileRow = profile as unknown as Record<string, string | null> | null;
  const website = clientRow?.website ?? profileRow?.website_url ?? null;
  if (!website) return { ...base, message: "No website domain on file for this workspace" };
  const origin = originOf(website);

  const priorPages = (previous ?? []) as unknown as {
    slug: string;
    primary_keyword: string;
    topic: string | null;
    semantic_topic_hash: string | null;
    canonical_url: string;
  }[];

  const { data: sitePages } = clientRow
    ? await supabaseAdmin
        .from("seo_pages" as never)
        .select("url,keyword")
        .eq("client_id", clientRow.id)
        .limit(200)
    : { data: [] as unknown[] };
  const existingUrls = ((sitePages ?? []) as unknown as { url: string; keyword: string | null }[]).map(
    (page) => page.url,
  );

  const { data: queuedJobs } = await supabaseAdmin
    .from("website_publish_jobs" as never)
    .select("slug,status")
    .eq("workspace_id", connection.workspace_id)
    .limit(200);
  const jobSlugs = ((queuedJobs ?? []) as unknown as { slug: string }[]).map((job) => job.slug);

  const { getRepositoryMeta, readRepositoryFile } = await import("@/lib/github-app.server");
  const repo = await getRepositoryMeta(installationId, connection.external_id);
  const readmePath = repo.files.find((file) => /^readme\.mdx?$/i.test(file));
  const readme = readmePath
    ? await readRepositoryFile(installationId, connection.external_id, readmePath, repo.defaultBranch)
    : null;

  const config: PublishingConfig = connection.framework
    ? {
        framework: connection.framework as PublishingConfig["framework"],
        publish_path: connection.publish_path ?? "{slug}.html",
        content_format: (connection.content_format ?? "html") as PublishingConfig["content_format"],
        router_type: (connection.router_type ?? "static") as PublishingConfig["router_type"],
        sitemap_path: connection.sitemap_path,
      }
    : detectPublishingConfig(repo.files);
  if (!connection.framework) {
    await supabaseAdmin
      .from("website_connections" as never)
      .update({
        framework: config.framework,
        publish_path: config.publish_path,
        content_format: config.content_format,
        router_type: config.router_type,
        sitemap_path: config.sitemap_path,
      } as never)
      .eq("id", connection.id);
  }

  const allowedInternalUrls = Array.from(
    new Set([origin, `${origin}/`, ...existingUrls, ...priorPages.map((page) => page.canonical_url)]),
  );
  const existingSlugs = Array.from(
    new Set([
      ...priorPages.map((page) => page.slug),
      ...jobSlugs,
      ...existingUrls
        .map((url) => {
          try {
            return new URL(url).pathname.replace(/^\/|\/$/g, "");
          } catch {
            return "";
          }
        })
        .filter(Boolean),
    ]),
  );

  const contextBlock = `COMPANY
name: ${clientRow?.name ?? profileRow?.product_name ?? connection.display_name ?? origin}
domain: ${origin}
product: ${profileRow?.product_name ?? "unknown"}
tagline: ${profileRow?.tagline ?? "unknown"}
description: ${profileRow?.short_description ?? "unknown"}
long description: ${profileRow?.long_description ?? "unknown"}
category: ${profileRow?.category ?? "unknown"}

REPOSITORY SIGNALS (background only — never mention these sources on the page)
description: ${repo.description ?? "none"}
topics: ${repo.topics.join(", ") || "none"}
languages: ${repo.languages.join(", ") || "none"}
readme excerpt:
${(readme ?? "none").slice(0, 6000)}

EXISTING SITE URLS (the only URLs allowed for internal links)
${allowedInternalUrls.join("\n")}

ALREADY TARGETED — do not repeat these slugs, keywords, or their close variants
${priorPages.map((page) => `- /${page.slug} :: ${page.primary_keyword} :: ${page.topic ?? ""}`).join("\n") || "- none yet"}
reserved slugs: ${existingSlugs.join(", ") || "none"}

TASK
Pick ONE search opportunity this website does not already cover, that a real buyer or researcher would search for, that this company can answer credibly from the information above, and that deserves its own page. Then write that page.
canonicalUrl must be exactly ${origin}/<slug>. cta.buttonUrl and breadcrumb URLs must come from the allowed URL list or be the canonical URL itself.`;

  let page: GeneratedPage | null = null;
  let report = { score: 0, issues: ["not generated"] as string[] };
  let feedback = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const candidate = await callModel(SYSTEM_PROMPT, `${contextBlock}${feedback}`);
    candidate.slug = String(candidate.slug ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    candidate.canonicalUrl = `${origin}/${candidate.slug}`;
    candidate.secondaryKeywords ??= [];
    candidate.semanticKeywords ??= [];
    candidate.entities ??= [];
    candidate.internalLinks ??= [];
    candidate.features ??= [];
    candidate.faqs ??= [];
    candidate.sections ??= [];

    const semanticHash = await hash(normaliseTopic(candidate.primaryKeyword ?? ""));
    const duplicate = priorPages.some((prior) => prior.semantic_topic_hash === semanticHash);
    report = scoreGeneratedPage(candidate, { allowedInternalUrls, existingSlugs, origin });
    if (duplicate) {
      report = { score: Math.min(report.score, 40), issues: [...report.issues, "Duplicate search intent"] };
    }

    page = candidate;
    if (report.score >= QUALITY_THRESHOLD) break;
    feedback = `\n\nPREVIOUS ATTEMPT REJECTED (score ${report.score}). Fix all of these and choose a different angle if the intent was duplicated:\n- ${report.issues.join("\n- ")}`;
  }

  if (!page) return { ...base, status: "failed", stage: "generation_failed", message: "No page produced" };

  const semanticTopicHash = await hash(normaliseTopic(page.primaryKeyword));
  const contentHash = await hash(JSON.stringify(page));

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("generated_pages" as never)
    .insert({
      workspace_id: connection.workspace_id,
      connection_id: connection.id,
      slug: page.slug,
      canonical_url: page.canonicalUrl,
      primary_keyword: page.primaryKeyword,
      secondary_keywords: page.secondaryKeywords,
      topic: page.hero?.heading ?? page.h1,
      search_intent: page.searchIntent,
      page_type: page.pageType,
      seo_title: page.seoTitle,
      meta_description: page.metaDescription,
      h1: page.h1,
      content_json: page as unknown as Record<string, unknown>,
      seo_score: report.score,
      quality_issues: report.issues,
      content_hash: contentHash,
      semantic_topic_hash: semanticTopicHash,
      status: report.score >= QUALITY_THRESHOLD ? "queued" : "rejected",
      error_message: report.score >= QUALITY_THRESHOLD ? null : report.issues.join("; "),
    } as never)
    .select("id")
    .single();
  if (insertError) throw insertError;
  const generatedPageId = (inserted as unknown as { id: string }).id;

  if (report.score < QUALITY_THRESHOLD) {
    return {
      ...base,
      status: "skipped",
      slug: page.slug,
      seoScore: report.score,
      stage: "quality_gate",
      message: `Below quality threshold (${report.score}): ${report.issues.join("; ")}`,
    };
  }

  // Render natively for this repository, plus a sitemap entry when one exists.
  let files: { path: string; content: string }[];
  try {
    files = [
      { path: resolvePagePath(config, page.slug), content: renderPageFile(config, page) },
    ];
  } catch (error) {
    await supabaseAdmin
      .from("generated_pages" as never)
      .update({
        status: "failed",
        failure_stage: "render_failed",
        error_message: error instanceof Error ? error.message : String(error),
      } as never)
      .eq("id", generatedPageId);
    return { ...base, status: "failed", stage: "render_failed", slug: page.slug };
  }

  if (config.sitemap_path?.endsWith(".xml")) {
    try {
      const xml = await readRepositoryFile(
        installationId,
        connection.external_id,
        config.sitemap_path,
        repo.defaultBranch,
      );
      const updated = xml
        ? upsertSitemapEntry(xml, page.canonicalUrl, new Date().toISOString().slice(0, 10))
        : null;
      if (updated) files.push({ path: config.sitemap_path, content: updated });
    } catch (error) {
      console.error("[daily-page-generator] sitemap update skipped", error);
    }
  }

  const { data: job, error: jobError } = await supabaseAdmin
    .from("website_publish_jobs" as never)
    .insert({
      workspace_id: connection.workspace_id,
      connection_id: connection.id,
      generated_page_id: generatedPageId,
      title: page.seoTitle,
      slug: page.slug,
      html: renderPageFile(config, page),
      excerpt: page.metaDescription,
      publish_mode: "publish",
      status: "queued",
      metadata: {
        keyword: page.primaryKeyword,
        canonical_url: page.canonicalUrl,
        seo_score: report.score,
        generated: true,
        files,
      },
    } as never)
    .select("id")
    .single();
  if (jobError) throw jobError;
  const jobId = (job as unknown as { id: string }).id;

  const { processWebsitePublishJobs } = await import("@/lib/website-publish.server");
  await processWebsitePublishJobs({ jobId });

  const { data: finished } = await supabaseAdmin
    .from("website_publish_jobs" as never)
    .select("status,error_message,external_id")
    .eq("id", jobId)
    .maybeSingle();
  const finishedJob = finished as unknown as {
    status: string;
    error_message: string | null;
    external_id: string | null;
  } | null;
  const published = finishedJob?.status === "published";

  await supabaseAdmin
    .from("generated_pages" as never)
    .update({
      publish_job_id: jobId,
      status: published ? "published" : "failed",
      failure_stage: published ? null : "github_failed",
      error_message: published ? null : (finishedJob?.error_message ?? "Publishing failed"),
      github_commit_sha: published ? finishedJob?.external_id : null,
      published_at: published ? new Date().toISOString() : null,
      last_meaningful_update_at: published ? new Date().toISOString() : null,
    } as never)
    .eq("id", generatedPageId);

  return {
    ...base,
    status: published ? "generated" : "failed",
    slug: page.slug,
    seoScore: report.score,
    stage: published ? undefined : "github_failed",
    message: published ? `${wordCount(page)} words published` : (finishedJob?.error_message ?? undefined),
  };
}

export async function runDailyPageGeneration() {
  const { data, error } = await supabaseAdmin
    .from("website_connections" as never)
    .select(
      "id,workspace_id,external_id,display_name,metadata,framework,publish_path,content_format,router_type,sitemap_path",
    )
    .eq("platform", "github")
    .eq("status", "connected")
    .eq("daily_generation_enabled", true)
    .eq("auto_publish", true);
  if (error) throw error;

  const results: WebsiteResult[] = [];
  for (const raw of (data ?? []) as unknown as Connection[]) {
    try {
      results.push(await generateForConnection(raw));
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : String(failure);
      console.error("[daily-page-generator] website failed", raw.id, message);
      results.push({
        workspaceId: raw.workspace_id,
        connectionId: raw.id,
        status: "failed",
        stage: "generation_failed",
        message,
      });
    }
  }
  return {
    websites: results.length,
    generated: results.filter((result) => result.status === "generated").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
  };
}
