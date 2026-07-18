import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const TIMEOUT_MS = 10_000;
const SITEMAP_SAMPLE_SIZE = 10;

const COMMON_PATHS = [
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/random-fake-url-xyz",
  "/privacy",
  "/terms",
  "/contact",
  "/about",
  "/pricing",
  "/blog",
  "/docs",
  "/faq",
  "/how-it-works",
  "/support",
  "/login",
  "/signup",
  "/app",
  "/dashboard",
  "/account",
  "/admin",
] as const;

const TRUST_PATHS = ["/privacy", "/terms", "/contact", "/about"] as const;
const CONTENT_PATHS = ["/pricing", "/blog", "/docs", "/faq", "/how-it-works", "/support"] as const;
const APP_PATHS = ["/login", "/signup", "/app", "/dashboard", "/account", "/admin"] as const;

const SeoAuditInputSchema = z.object({
  websiteUrl: z.string().min(3).max(300),
  githubUrl: z.string().max(300).optional().default(""),
  gbpUrl: z.string().max(500).optional().default(""),
});

type CategoryName =
  | "Technical"
  | "Indexability"
  | "On-page"
  | "Content/trust"
  | "AEO/GEO"
  | "GitHub source"
  | "Google Business"
  | "Sitemap sample";

type Category = { name: CategoryName; good: string[]; bad: string[] };

type FetchResult = {
  requestedUrl: string;
  status: number | null;
  finalUrl: string;
  contentType: string;
  text: string;
  error: string;
  elapsedMs: number;
  headers: Record<string, string>;
};

type ParsedPage = {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  robots: string;
  canonical: string;
  viewport: string;
  lang: string;
  h1: string[];
  h1Count: number;
  h2Count: number;
  h3Count: number;
  links: number;
  internalLinks: number;
  externalLinks: number;
  images: number;
  imagesMissingAlt: number;
  wordCount: number;
  htmlLength: number;
  ogCount: number;
  twitterCount: number;
  schemaTypes: string[];
  schemaCount: number;
};

type GithubAudit = {
  input: string;
  owner: string;
  repo: string;
  url: string;
  reachable: boolean;
  defaultBranch: string;
  description: string;
  homepage: string;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string;
  readmeFound: boolean;
  error: string;
};

export type SeoAuditResult = {
  websiteUrl: string;
  baseUrl: string;
  score: number;
  cost: string;
  tone: string;
  categories: Category[];
  good: string[];
  issues: string[];
  copy: string;
  home: FetchResult & ParsedPage;
  hosts: Record<string, Pick<FetchResult, "status" | "finalUrl" | "error" | "elapsedMs">>;
  paths: Record<string, Pick<FetchResult, "status" | "finalUrl" | "error" | "elapsedMs">>;
  sitemapCount: number;
  sitemapFirst: string[];
  github: GithubAudit | null;
  gbp: {
    input: string;
    provided: boolean;
    looksLikeProfile: boolean;
    message: string;
  };
};

function normalizeWebsite(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Website URL is required");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function rootDomain(url: string) {
  return new URL(url).hostname.replace(/^www\./i, "");
}

function hostVariants(baseUrl: string) {
  const domain = rootDomain(baseUrl);
  return [
    `http://${domain}`,
    `https://${domain}`,
    `http://www.${domain}`,
    `https://www.${domain}`,
  ];
}

async function fetchWithTimeout(url: string, limit = 350_000): Promise<FetchResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "MentionMyApp SEO Audit" },
    });
    const contentType = response.headers.get("content-type") ?? "";
    const textLike = /text|html|xml|json|javascript/i.test(contentType);
    const text = textLike ? (await response.text()).slice(0, limit) : "";
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });
    return {
      requestedUrl: url,
      status: response.status,
      finalUrl: response.url,
      contentType,
      text,
      error: "",
      elapsedMs: Date.now() - started,
      headers,
    };
  } catch (error) {
    return {
      requestedUrl: url,
      status: null,
      finalUrl: "",
      contentType: "",
      text: "",
      error: error instanceof Error ? error.message : String(error),
      elapsedMs: Date.now() - started,
      headers: {},
    };
  } finally {
    clearTimeout(timer);
  }
}

function isOk(status: number | null) {
  return status != null && status >= 200 && status < 300;
}

function isMissing(status: number | null) {
  return status == null || status >= 400;
}

function stripHtml(value: string) {
  return value
    .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeBasic(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function tags(source: string, tag: string) {
  return Array.from(source.matchAll(new RegExp(`<${tag}\\b[^>]*>`, "gi"))).map((match) => match[0]);
}

function tagText(source: string, tag: string) {
  return Array.from(source.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi")))
    .map((match) => decodeBasic(stripHtml(match[1] ?? "")))
    .filter(Boolean);
}

function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}=["']([^"']*)`, "i"));
  return match ? decodeBasic(match[1] ?? "").trim() : "";
}

function metaContent(source: string, name: string) {
  for (const tag of tags(source, "meta")) {
    if (attr(tag, "name").toLowerCase() === name.toLowerCase()) return attr(tag, "content");
  }
  return "";
}

function firstLink(source: string, rel: string) {
  for (const tag of tags(source, "link")) {
    if (attr(tag, "rel").toLowerCase().split(/\s+/).includes(rel.toLowerCase())) return attr(tag, "href");
  }
  return "";
}

function jsonLdTypes(source: string) {
  const found = new Set<string>();
  for (const match of source.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const body = decodeBasic(match[1] ?? "").trim();
    try {
      const parsed = JSON.parse(body) as unknown;
      walkJsonLd(parsed, found);
    } catch {
      if (body.includes("@type")) found.add("invalid-json-ld");
    }
  }
  return Array.from(found).sort();
}

function walkJsonLd(value: unknown, found: Set<string>) {
  if (Array.isArray(value)) {
    value.forEach((item) => walkJsonLd(item, found));
    return;
  }
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  const type = record["@type"];
  if (typeof type === "string") found.add(type);
  if (Array.isArray(type)) type.forEach((item) => found.add(String(item)));
  for (const key of ["@graph", "mainEntity", "itemListElement"]) walkJsonLd(record[key], found);
}

function parsePage(source: string, baseUrl: string): ParsedPage {
  const title = tagText(source, "title")[0] ?? "";
  const description = metaContent(source, "description");
  const robots = metaContent(source, "robots");
  const canonical = firstLink(source, "canonical");
  const viewport = metaContent(source, "viewport");
  const htmlTag = source.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const h1 = tagText(source, "h1");
  const h2 = tagText(source, "h2");
  const h3 = tagText(source, "h3");
  const anchorTags = tags(source, "a");
  const imageTags = tags(source, "img");
  const baseHost = safeHost(baseUrl);
  let internalLinks = 0;
  let externalLinks = 0;
  for (const anchor of anchorTags) {
    const href = attr(anchor, "href");
    if (!href || /^(#|javascript:|mailto:|tel:)/i.test(href)) continue;
    const host = safeHost(new URL(href, baseUrl).toString());
    if (!host || host === baseHost) internalLinks++;
    else externalLinks++;
  }
  const imagesMissingAlt = imageTags.filter((image) => !attr(image, "alt").trim()).length;
  const bodyText = stripHtml(source);
  const words = bodyText.match(/[A-Za-z0-9][A-Za-z0-9'-]+/g) ?? [];
  const schemaTypes = jsonLdTypes(source);
  const ogCount = tags(source, "meta").filter((tag) => attr(tag, "property").toLowerCase().startsWith("og:")).length;
  const twitterCount = tags(source, "meta").filter((tag) => attr(tag, "name").toLowerCase().startsWith("twitter:")).length;
  return {
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    robots,
    canonical,
    viewport,
    lang: attr(htmlTag, "lang"),
    h1: h1.slice(0, 8),
    h1Count: h1.length,
    h2Count: h2.length,
    h3Count: h3.length,
    links: anchorTags.length,
    internalLinks,
    externalLinks,
    images: imageTags.length,
    imagesMissingAlt,
    wordCount: words.length,
    htmlLength: source.length,
    ogCount,
    twitterCount,
    schemaTypes,
    schemaCount: schemaTypes.length,
  };
}

function safeHost(url: string) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function sitemapUrls(text: string) {
  return Array.from(text.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi))
    .map((match) => decodeBasic((match[1] ?? "").trim()))
    .filter(Boolean);
}

function robotsDisallowsAll(text: string) {
  let agents: string[] = [];
  for (const rawLine of text.split("\n")) {
    const line = rawLine.split("#", 1)[0]?.trim() ?? "";
    if (!line) {
      agents = [];
      continue;
    }
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim().toLowerCase();
    if (key === "user-agent") agents.push(value);
    if (key === "disallow" && value === "/" && (agents.includes("*") || agents.includes("googlebot"))) return true;
  }
  return false;
}

function addGood(categories: Map<CategoryName, Category>, name: CategoryName, message: string) {
  categories.get(name)!.good.push(message);
}

function addBad(
  categories: Map<CategoryName, Category>,
  weights: number[],
  name: CategoryName,
  message: string,
  weight: number,
) {
  categories.get(name)!.bad.push(message);
  weights.push(weight);
}

function categoriesMap() {
  const names: CategoryName[] = [
    "Technical",
    "Indexability",
    "On-page",
    "Content/trust",
    "AEO/GEO",
    "GitHub source",
    "Google Business",
    "Sitemap sample",
  ];
  return new Map(names.map((name) => [name, { name, good: [], bad: [] } satisfies Category]));
}

function summarize<T extends FetchResult>(result: T) {
  return {
    status: result.status,
    finalUrl: result.finalUrl,
    error: result.error,
    elapsedMs: result.elapsedMs,
  };
}

function canonicalHosts(hosts: FetchResult[]) {
  return new Set(hosts.filter((host) => host.finalUrl).map((host) => safeHost(host.finalUrl)));
}

function looksGenericH1(h1: string) {
  return /^(hi[, ]|hello\b|welcome\b|home$|get started$)/i.test(h1.trim());
}

function costForScore(score: number) {
  if (score >= 8) return "$300-$800";
  if (score >= 6) return "$500-$1,200";
  if (score >= 4) return "$800-$1,500";
  return "$1,000-$2,500";
}

function toneForScore(score: number) {
  if (score >= 8) return "The SEO foundation is solid, but growth will come from content, internal links, GBP activity, and authority";
  if (score >= 6) return "The site is not broken, but it is leaving ranking signals on the table";
  if (score >= 4) return "There are enough technical/content issues here that indexing and rankings can suffer";
  return "This is a messy SEO setup and Google will struggle to trust/index it properly";
}

function parseGithubUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/github\.com[/:]([^/\s]+)\/([^/\s#?]+?)(?:\.git)?(?:[/?#]|$)/i);
  if (!match) return null;
  return { owner: match[1]!, repo: match[2]!.replace(/\.git$/i, "") };
}

async function auditGithub(raw: string): Promise<GithubAudit | null> {
  const input = raw.trim();
  if (!input) return null;
  const parsed = parseGithubUrl(input);
  if (!parsed) {
    return {
      input,
      owner: "",
      repo: "",
      url: input,
      reachable: false,
      defaultBranch: "",
      description: "",
      homepage: "",
      stars: 0,
      forks: 0,
      openIssues: 0,
      pushedAt: "",
      readmeFound: false,
      error: "Could not parse GitHub owner/repo",
    };
  }

  const api = await fetchWithTimeout(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, 120_000);
  if (!isOk(api.status)) {
    return {
      input,
      ...parsed,
      url: `https://github.com/${parsed.owner}/${parsed.repo}`,
      reachable: false,
      defaultBranch: "",
      description: "",
      homepage: "",
      stars: 0,
      forks: 0,
      openIssues: 0,
      pushedAt: "",
      readmeFound: false,
      error: api.error || `GitHub API returned ${api.status ?? "no response"}`,
    };
  }

  const payload = JSON.parse(api.text || "{}") as {
    html_url?: string;
    default_branch?: string;
    description?: string | null;
    homepage?: string | null;
    stargazers_count?: number;
    forks_count?: number;
    open_issues_count?: number;
    pushed_at?: string;
  };
  const branch = payload.default_branch ?? "main";
  const readme = await fetchWithTimeout(
    `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/README.md`,
    80_000,
  );

  return {
    input,
    ...parsed,
    url: payload.html_url ?? `https://github.com/${parsed.owner}/${parsed.repo}`,
    reachable: true,
    defaultBranch: branch,
    description: payload.description ?? "",
    homepage: payload.homepage ?? "",
    stars: payload.stargazers_count ?? 0,
    forks: payload.forks_count ?? 0,
    openIssues: payload.open_issues_count ?? 0,
    pushedAt: payload.pushed_at ?? "",
    readmeFound: isOk(readme.status) && readme.text.trim().length > 0,
    error: "",
  };
}

function githubFindings(
  github: GithubAudit | null,
  baseUrl: string,
  categories: Map<CategoryName, Category>,
  weights: number[],
) {
  if (!github) {
    addBad(categories, weights, "GitHub source", "No GitHub repository URL provided for source/entity indexing", 0.4);
    return;
  }
  if (!github.reachable) {
    addBad(categories, weights, "GitHub source", `GitHub repo is not publicly reachable: ${github.error}`, 1.0);
    return;
  }
  addGood(categories, "GitHub source", `Public GitHub repo is reachable: ${github.url}`);
  addGood(categories, "GitHub source", `Default branch detected: ${github.defaultBranch}`);
  if (github.readmeFound) addGood(categories, "GitHub source", "README is present for crawlable project context");
  else addBad(categories, weights, "GitHub source", "README is missing or not reachable", 0.5);
  if (github.description) addGood(categories, "GitHub source", "Repository description exists");
  else addBad(categories, weights, "GitHub source", "Repository description is empty", 0.3);
  if (github.homepage) {
    addGood(categories, "GitHub source", `Repository homepage is set: ${github.homepage}`);
    if (safeHost(github.homepage) && safeHost(github.homepage) !== safeHost(baseUrl)) {
      addBad(categories, weights, "GitHub source", "Repository homepage points to a different domain than the audited site", 0.4);
    }
  } else {
    addBad(categories, weights, "GitHub source", "Repository homepage URL is not set", 0.4);
  }
}

function googleBusinessFindings(
  gbpUrl: string,
  categories: Map<CategoryName, Category>,
  weights: number[],
) {
  const trimmed = gbpUrl.trim();
  const looksLikeProfile = /google\.[^/]+\/maps|g\.page|business\.google\.com|maps\.app\.goo\.gl/i.test(trimmed);
  if (trimmed && looksLikeProfile) {
    addGood(categories, "Google Business", "Google Business Profile URL was provided");
  } else if (trimmed) {
    addBad(categories, weights, "Google Business", "GBP URL was provided, but it does not look like a Google Business/Maps profile", 0.4);
  } else {
    addBad(categories, weights, "Google Business", "No Google Business Profile URL provided", 0.5);
  }
  addBad(categories, weights, "Google Business", "GBP views, calls, directions, reviews, comments, and posts require a connected Google Business account", 0.3);
  return {
    input: trimmed,
    provided: Boolean(trimmed),
    looksLikeProfile,
    message: trimmed
      ? "Profile URL saved for the audit. Connect Google Business to sync live metrics."
      : "Paste a GBP/Maps URL and connect Google Business to sync profile metrics.",
  };
}

function buildCopy(domain: string, score: number, good: string[], issues: string[], cost: string, tone: string) {
  const goodLines = (good.slice(0, 12).map((item) => `- ${item}`).join("\n")) || "- A few basics are in place";
  const badLines = (issues.slice(0, 16).map((item) => `- ${item}`).join("\n")) || "- Nothing major from the quick scan";
  const priorityLines = (issues.slice(0, 6).map((item, index) => `${index + 1}. ${item}`).join("\n"))
    || "1. Build more search-intent pages\n2. Improve internal linking\n3. Keep technical SEO clean";
  return `${domain} — ${score}/10
Good:
${goodLines}

Bad:
${badLines}

Tell them: ${tone}. Fix the highest-impact technical issues first, then build pages around real search intent, GBP proof, and source/entity signals instead of only having a nice-looking homepage.

Priority fixes:
${priorityLines}

Cost: ${cost}.`;
}

export const runSeoAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SeoAuditInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const categories = categoriesMap();
    const weights: number[] = [];
    const normalizedUrl = normalizeWebsite(data.websiteUrl);
    const hosts = await Promise.all(hostVariants(normalizedUrl).map((url) => fetchWithTimeout(url, 70_000)));
    let preferred = hosts.find((host) => host.requestedUrl === `https://${rootDomain(normalizedUrl)}` && isOk(host.status));
    preferred ??= hosts.find((host) => host.requestedUrl === `https://www.${rootDomain(normalizedUrl)}` && isOk(host.status));
    preferred ??= hosts.find((host) => isOk(host.status));
    const baseUrl = (preferred?.finalUrl || normalizedUrl).replace(/\/$/, "");

    const home = await fetchWithTimeout(baseUrl);
    const parsedHome = parsePage(home.text, baseUrl);
    const pathPairs = await Promise.all(COMMON_PATHS.map(async (path) => [path, await fetchWithTimeout(`${baseUrl}${path}`, 120_000)] as const));
    const pathResults = Object.fromEntries(pathPairs) as Record<(typeof COMMON_PATHS)[number], FetchResult>;
    const sitemapList = isOk(pathResults["/sitemap.xml"].status) ? sitemapUrls(pathResults["/sitemap.xml"].text) : [];
    const sitemapPages = sitemapList.filter((url) => !new URL(url, baseUrl).pathname.endsWith(".xml"));
    const sampleUrls = sitemapPages.slice(0, SITEMAP_SAMPLE_SIZE);
    const sampleResults = await Promise.all(sampleUrls.map((url) => fetchWithTimeout(url, 90_000)));
    const github = await auditGithub(data.githubUrl);
    const gbp = googleBusinessFindings(data.gbpUrl, categories, weights);

    if (isOk(home.status)) addGood(categories, "Technical", `Homepage returns ${home.status} at ${baseUrl}`);
    else addBad(categories, weights, "Technical", "Homepage is not returning a clean 200", 3.0);

    if (baseUrl.startsWith("https://")) addGood(categories, "Technical", "Preferred URL is HTTPS");
    else addBad(categories, weights, "Technical", "Preferred URL is not HTTPS", 1.5);

    const httpRoot = hosts.find((host) => host.requestedUrl === `http://${rootDomain(normalizedUrl)}`);
    if (httpRoot?.finalUrl.startsWith("https://")) addGood(categories, "Technical", "HTTP redirects to HTTPS");
    else addBad(categories, weights, "Technical", "HTTP version does not clearly force HTTPS", 1.0);

    const hostSet = canonicalHosts(hosts);
    const responsiveHosts = hosts.filter((host) => isOk(host.status));
    if (hostSet.size === 1 && responsiveHosts.length >= 2) addGood(categories, "Technical", "www/non-www and HTTP/HTTPS collapse to one host");
    else if (responsiveHosts.length >= 2) addBad(categories, weights, "Technical", "Host variants may create duplicate versions", 1.0);

    const brokenHosts = hosts.filter((host) => host.error || host.status == null || host.status >= 500);
    if (brokenHosts.length) addBad(categories, weights, "Technical", `Broken host variants: ${brokenHosts.map((host) => host.requestedUrl).join(", ")}`, 1.0);

    if (home.elapsedMs <= 1_500) addGood(categories, "Technical", `Homepage response is quick enough (${home.elapsedMs} ms)`);
    else addBad(categories, weights, "Technical", `Homepage response is slow or mediocre (${home.elapsedMs} ms)`, home.elapsedMs > 3_000 ? 1.1 : 0.5);

    if (/html/i.test(home.contentType)) addGood(categories, "Technical", "Homepage serves HTML content");
    else addBad(categories, weights, "Technical", `Homepage content type is unusual: ${home.contentType || "missing"}`, 0.8);

    if (parsedHome.lang) addGood(categories, "Technical", `HTML lang is set (${parsedHome.lang})`);
    else addBad(categories, weights, "Technical", "Missing html lang attribute", 0.3);

    if (parsedHome.viewport) addGood(categories, "Technical", "Viewport meta tag exists");
    else addBad(categories, weights, "Technical", "Missing viewport meta tag", 0.6);

    const robotsMeta = parsedHome.robots.toLowerCase();
    const robotsHeader = home.headers["x-robots-tag"]?.toLowerCase() ?? "";
    if (!robotsMeta.includes("noindex") && !robotsHeader.includes("noindex")) addGood(categories, "Indexability", "Homepage is not marked noindex");
    else addBad(categories, weights, "Indexability", "Homepage has noindex via meta/header", 3.0);

    if (parsedHome.canonical && !/localhost|127\.0\.0\.1/i.test(parsedHome.canonical)) {
      addGood(categories, "Indexability", `Canonical exists: ${parsedHome.canonical}`);
      if (!parsedHome.canonical.startsWith("https://")) addBad(categories, weights, "Indexability", "Canonical is not HTTPS", 0.7);
      if (safeHost(parsedHome.canonical) && safeHost(parsedHome.canonical) !== safeHost(baseUrl)) {
        addBad(categories, weights, "Indexability", "Canonical points to a different host than the live page", 1.4);
      }
    } else if (parsedHome.canonical) addBad(categories, weights, "Indexability", "Canonical is broken or points to localhost", 2.0);
    else addBad(categories, weights, "Indexability", "Missing canonical", 1.2);

    const robots = pathResults["/robots.txt"];
    if (isOk(robots.status)) {
      addGood(categories, "Indexability", "robots.txt exists");
      if (robotsDisallowsAll(robots.text)) addBad(categories, weights, "Indexability", "robots.txt contains a broad Disallow: / rule", 2.5);
      if (/sitemap:/i.test(robots.text)) addGood(categories, "Indexability", "robots.txt references a sitemap");
      else addBad(categories, weights, "Indexability", "robots.txt does not reference the sitemap", 0.4);
    } else addBad(categories, weights, "Indexability", "robots.txt missing", 1.2);

    if (isOk(pathResults["/sitemap.xml"].status)) {
      addGood(categories, "Indexability", `sitemap.xml exists with ${sitemapList.length} URLs`);
      if (sitemapList.length === 0) addBad(categories, weights, "Indexability", "Sitemap is empty", 1.4);
      else if (sitemapList.length <= 2) addBad(categories, weights, "Indexability", "Sitemap is tiny", 0.8);
      else if (sitemapList.length >= 20) addGood(categories, "Indexability", "Sitemap exposes a real SEO surface");
      if (sitemapList.length > 1_000) addBad(categories, weights, "Indexability", "Large sitemap needs indexability/quality review", 0.6);
    } else addBad(categories, weights, "Indexability", "sitemap.xml missing", 1.5);

    const fake = pathResults["/random-fake-url-xyz"];
    if (fake.status === 404) addGood(categories, "Indexability", "Fake/random URLs return hard 404");
    else if (isOk(fake.status)) addBad(categories, weights, "Indexability", "Fake/random URLs return 200 soft 404", 2.2);
    else addBad(categories, weights, "Indexability", "Fake URL behavior is unclear", 0.6);

    const liveAppRoutes = APP_PATHS.filter((path) => isOk(pathResults[path].status));
    if (liveAppRoutes.length) addBad(categories, weights, "Indexability", `App/auth routes may be indexable: ${liveAppRoutes.join(", ")}`, 1.2);
    else addGood(categories, "Indexability", "Common app/auth routes are not publicly indexable");

    if (parsedHome.title && parsedHome.titleLength >= 20 && parsedHome.titleLength <= 70) addGood(categories, "On-page", `Title tag exists and is usable (${parsedHome.titleLength} chars)`);
    else if (parsedHome.title) addBad(categories, weights, "On-page", `Title tag is weak or wrong length (${parsedHome.titleLength} chars): ${parsedHome.title.slice(0, 90)}`, 1.0);
    else addBad(categories, weights, "On-page", "Missing title tag", 1.5);

    if (parsedHome.description && parsedHome.descriptionLength >= 50 && parsedHome.descriptionLength <= 180) addGood(categories, "On-page", `Meta description exists (${parsedHome.descriptionLength} chars)`);
    else if (parsedHome.description) addBad(categories, weights, "On-page", `Meta description is too short/long (${parsedHome.descriptionLength} chars)`, 0.8);
    else addBad(categories, weights, "On-page", "Missing meta description", 1.2);

    if (parsedHome.h1Count === 1) {
      const h1 = parsedHome.h1[0] ?? "";
      addGood(categories, "On-page", `One H1 exists: ${h1.slice(0, 90)}`);
      if (h1.length < 12 || looksGenericH1(h1)) addBad(categories, weights, "On-page", `H1 is vague and not keyword useful: ${h1.slice(0, 90)}`, 0.9);
    } else if (parsedHome.h1Count === 0) addBad(categories, weights, "On-page", "Missing H1", 1.2);
    else addBad(categories, weights, "On-page", `Multiple H1s on homepage (${parsedHome.h1Count})`, 0.8);

    if (parsedHome.h2Count >= 2) addGood(categories, "On-page", `Page has supporting H2 structure (${parsedHome.h2Count} H2s)`);
    else addBad(categories, weights, "On-page", "Weak heading structure: not enough H2 sections", 0.5);

    if (parsedHome.wordCount >= 450) addGood(categories, "On-page", `Homepage has enough crawlable text (${parsedHome.wordCount} words)`);
    else addBad(categories, weights, "On-page", `Homepage crawlable text is thin (${parsedHome.wordCount} words)`, parsedHome.wordCount < 200 ? 1.1 : 0.6);

    if (parsedHome.internalLinks >= 10) addGood(categories, "On-page", `Internal linking is decent (${parsedHome.internalLinks} internal links)`);
    else addBad(categories, weights, "On-page", `Homepage internal linking is light (${parsedHome.internalLinks} internal links)`, 0.7);

    if (parsedHome.images > 0 && parsedHome.imagesMissingAlt === 0) addGood(categories, "On-page", "Homepage images have alt text");
    else if (parsedHome.imagesMissingAlt > 0) addBad(categories, weights, "On-page", `${parsedHome.imagesMissingAlt} homepage images are missing alt text`, 0.5);

    if (parsedHome.ogCount >= 3) addGood(categories, "On-page", "Open Graph tags are present");
    else addBad(categories, weights, "On-page", "Open Graph tags are missing or thin", 0.4);

    if (parsedHome.twitterCount >= 2) addGood(categories, "On-page", "Twitter/X card tags are present");
    else addBad(categories, weights, "On-page", "Twitter/X card tags are missing or thin", 0.3);

    if (parsedHome.schemaCount > 0) addGood(categories, "AEO/GEO", `Structured data found: ${parsedHome.schemaTypes.slice(0, 5).join(", ")}`);
    else addBad(categories, weights, "AEO/GEO", "No JSON-LD structured data found", 0.9);

    if (isOk(pathResults["/llms.txt"].status)) addGood(categories, "AEO/GEO", "llms.txt exists for AI crawler/context guidance");
    else addBad(categories, weights, "AEO/GEO", "Missing llms.txt/context file for AI discovery", 0.3);

    if (isOk(pathResults["/faq"].status)) addGood(categories, "AEO/GEO", "FAQ page exists");
    else addBad(categories, weights, "AEO/GEO", "Missing FAQ page for question-based search/AI answers", 0.5);

    if (isOk(pathResults["/how-it-works"].status)) addGood(categories, "AEO/GEO", "How-it-works/methodology page exists");
    else addBad(categories, weights, "AEO/GEO", "Missing how-it-works/methodology page", 0.5);

    const presentTrust = TRUST_PATHS.filter((path) => isOk(pathResults[path].status));
    const missingTrust = TRUST_PATHS.filter((path) => isMissing(pathResults[path].status));
    if (presentTrust.length) addGood(categories, "Content/trust", `Trust pages found: ${presentTrust.join(", ")}`);
    if (missingTrust.length) addBad(categories, weights, "Content/trust", `Missing trust pages: ${missingTrust.join(", ")}`, 1.2);
    else addGood(categories, "Content/trust", "Core trust pages exist");

    const presentContent = CONTENT_PATHS.filter((path) => isOk(pathResults[path].status));
    const missingContent = CONTENT_PATHS.filter((path) => isMissing(pathResults[path].status));
    if (presentContent.length) addGood(categories, "Content/trust", `Content/support pages found: ${presentContent.join(", ")}`);
    if (missingContent.length >= 2) addBad(categories, weights, "Content/trust", `Thin SEO surface: missing ${missingContent.join(", ")}`, 0.8);

    githubFindings(github, baseUrl, categories, weights);

    if (sampleUrls.length) {
      addGood(categories, "Sitemap sample", `Sampled ${sampleUrls.length} sitemap URLs`);
      const non200 = sampleResults.filter((result) => !isOk(result.status));
      const missingTitles = sampleResults.filter((result) => isOk(result.status) && !parsePage(result.text, result.finalUrl).title);
      const noindex = sampleResults.filter((result) => {
        const parsed = parsePage(result.text, result.finalUrl);
        return parsed.robots.toLowerCase().includes("noindex") || (result.headers["x-robots-tag"] ?? "").toLowerCase().includes("noindex");
      });
      if (non200.length) addBad(categories, weights, "Sitemap sample", `${non200.length} sampled sitemap URLs are not clean 200s`, 1.2);
      else addGood(categories, "Sitemap sample", "Sampled sitemap URLs returned 200");
      if (missingTitles.length) addBad(categories, weights, "Sitemap sample", `${missingTitles.length} sampled sitemap URLs are missing titles`, 0.6);
      if (noindex.length) addBad(categories, weights, "Sitemap sample", `${noindex.length} sampled sitemap URLs are noindex`, 1.0);
    } else {
      addBad(categories, weights, "Sitemap sample", "No sitemap page URLs available to sample", 0.6);
    }

    const categoryList = Array.from(categories.values());
    const good = categoryList.flatMap((category) => category.good);
    const issues = categoryList.flatMap((category) => category.bad);
    const score = Math.max(1, Math.min(10, Number((10 - weights.reduce((sum, weight) => sum + weight, 0)).toFixed(1))));
    const cost = costForScore(score);
    const tone = toneForScore(score);
    const domain = rootDomain(baseUrl);

    // Persistence is deliberately best-effort: the user should still receive
    // an audit if dashboard history is temporarily unavailable.
    try {
      const { data: profile, error: profileError } = await context.supabase
        .from("profiles")
        .select("current_workspace_id")
        .eq("id", context.userId)
        .maybeSingle();
      if (profileError) throw profileError;
      if (profile?.current_workspace_id) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error: persistError } = await supabaseAdmin.from("seo_audit_runs" as never).insert({
          workspace_id: profile.current_workspace_id,
          website: normalizedUrl,
          score,
          checks_passed: good.length,
          checks_failed: issues.length,
        } as never);
        if (persistError) throw persistError;
      }
    } catch (persistError) {
      console.error("[seo-audit] failed to persist run", persistError);
    }

    return {
      websiteUrl: normalizedUrl,
      baseUrl,
      score,
      cost,
      tone,
      categories: categoryList,
      good,
      issues,
      copy: buildCopy(domain, score, good, issues, cost, tone),
      home: { ...home, ...parsedHome },
      hosts: Object.fromEntries(hosts.map((host) => [host.requestedUrl, summarize(host)])),
      paths: Object.fromEntries(Object.entries(pathResults).map(([path, result]) => [path, summarize(result)])),
      sitemapCount: sitemapList.length,
      sitemapFirst: sitemapList.slice(0, 15),
      github,
      gbp,
    } satisfies SeoAuditResult;
  });
