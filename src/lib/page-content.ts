// Shared structured model for generated SEO pages plus deterministic renderers.
// The LLM produces this JSON once; every renderer is pure so a page never
// depends on a model call at request time.

export type GeneratedPage = {
  slug: string;
  pageType: "landing-page" | "feature-page" | "use-case" | "informational" | "industry-page";
  searchIntent: "informational" | "commercial" | "transactional" | "mixed";
  primaryKeyword: string;
  secondaryKeywords: string[];
  semanticKeywords: string[];
  entities: string[];
  seoTitle: string;
  metaDescription: string;
  h1: string;
  hero: { eyebrow?: string; heading: string; description: string };
  introduction: string;
  sections: { heading: string; content: string }[];
  features: { name: string; description: string }[];
  faqs: { question: string; answer: string }[];
  internalLinks: { anchorText: string; url: string }[];
  cta: { heading: string; description: string; buttonText: string; buttonUrl: string };
  canonicalUrl: string;
  structuredData: Record<string, unknown>;
  breadcrumbs?: { name: string; url: string }[];
};

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${escapeHtml(part)}</p>`)
    .join("\n");
}

export function renderPageHtml(page: GeneratedPage): string {
  const crumbs = page.breadcrumbs?.length
    ? `<nav aria-label="Breadcrumb"><ol>${page.breadcrumbs
        .map(
          (crumb) =>
            `<li><a href="${escapeHtml(crumb.url)}">${escapeHtml(crumb.name)}</a></li>`,
        )
        .join("")}<li aria-current="page">${escapeHtml(page.h1)}</li></ol></nav>`
    : "";

  return `<style>${ARTICLE_CSS}</style><article class="mm-article">
${crumbs}
  <header>
    ${page.hero.eyebrow ? `<p>${escapeHtml(page.hero.eyebrow)}</p>` : ""}
    <h1>${escapeHtml(page.h1)}</h1>
    <p>${escapeHtml(page.hero.description)}</p>
    <p><a href="${escapeHtml(page.cta.buttonUrl)}">${escapeHtml(page.cta.buttonText)}</a></p>
  </header>
  <section>
${paragraphs(page.introduction)}
  </section>
${page.sections
  .map(
    (section) => `  <section>
    <h2>${escapeHtml(section.heading)}</h2>
${paragraphs(section.content)}
  </section>`,
  )
  .join("\n")}
${
  page.features.length
    ? `  <section>
    <h2>Features</h2>
    <ul>
${page.features
  .map(
    (feature) =>
      `      <li><strong>${escapeHtml(feature.name)}</strong> — ${escapeHtml(feature.description)}</li>`,
  )
  .join("\n")}
    </ul>
  </section>`
    : ""
}
${
  page.faqs.length
    ? `  <section>
    <h2>Frequently asked questions</h2>
${page.faqs
  .map(
    (faq) => `    <h3>${escapeHtml(faq.question)}</h3>
    <p>${escapeHtml(faq.answer)}</p>`,
  )
  .join("\n")}
  </section>`
    : ""
}
${
  page.internalLinks.length
    ? `  <section>
    <h2>Related</h2>
    <ul>
${page.internalLinks
  .map(
    (link) =>
      `      <li><a href="${escapeHtml(link.url)}">${escapeHtml(link.anchorText)}</a></li>`,
  )
  .join("\n")}
    </ul>
  </section>`
    : ""
}
  <section>
    <h2>${escapeHtml(page.cta.heading)}</h2>
    <p>${escapeHtml(page.cta.description)}</p>
    <p><a href="${escapeHtml(page.cta.buttonUrl)}">${escapeHtml(page.cta.buttonText)}</a></p>
  </section>
</article>`;
}

export function renderPageMarkdown(page: GeneratedPage): string {
  const lines: string[] = [`# ${page.h1}`, "", page.hero.description, "", page.introduction, ""];
  for (const section of page.sections) {
    lines.push(`## ${section.heading}`, "", section.content, "");
  }
  if (page.features.length) {
    lines.push("## Features", "");
    for (const feature of page.features) lines.push(`- **${feature.name}** — ${feature.description}`);
    lines.push("");
  }
  if (page.faqs.length) {
    lines.push("## Frequently asked questions", "");
    for (const faq of page.faqs) lines.push(`### ${faq.question}`, "", faq.answer, "");
  }
  if (page.internalLinks.length) {
    lines.push("## Related", "");
    for (const link of page.internalLinks) lines.push(`- [${link.anchorText}](${link.url})`);
    lines.push("");
  }
  lines.push(`## ${page.cta.heading}`, "", page.cta.description, "", `[${page.cta.buttonText}](${page.cta.buttonUrl})`, "");
  return lines.join("\n");
}

export function wordCount(page: GeneratedPage) {
  const text = [
    page.introduction,
    ...page.sections.map((section) => `${section.heading} ${section.content}`),
    ...page.features.map((feature) => feature.description),
    ...page.faqs.map((faq) => `${faq.question} ${faq.answer}`),
  ].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

const BANNED_PHRASES = [
  "in today's digital landscape",
  "in today's fast-paced world",
  "technology is constantly evolving",
  "are you searching for",
  "lorem ipsum",
  "todo",
  "placeholder",
];

const UNSUPPORTED_CLAIMS = ["#1", "number one", "best in the world", "most trusted", "industry-leading", "guaranteed"];

export type QualityReport = { score: number; issues: string[] };

export function scoreGeneratedPage(
  page: GeneratedPage,
  context: { allowedInternalUrls: string[]; existingSlugs: string[]; origin: string },
): QualityReport {
  const issues: string[] = [];
  let score = 100;
  const penalise = (points: number, issue: string) => {
    score -= points;
    issues.push(issue);
  };

  const keyword = page.primaryKeyword.toLowerCase();
  const haystack = `${page.introduction} ${page.sections.map((s) => `${s.heading} ${s.content}`).join(" ")}`.toLowerCase();

  if (!page.seoTitle) penalise(15, "Missing SEO title");
  else if (page.seoTitle.length < 30 || page.seoTitle.length > 70)
    penalise(5, `SEO title length ${page.seoTitle.length} outside 45-65 target`);
  if (!page.metaDescription) penalise(15, "Missing meta description");
  else if (page.metaDescription.length < 110 || page.metaDescription.length > 175)
    penalise(5, `Meta description length ${page.metaDescription.length} outside 120-165 target`);
  if (!page.h1) penalise(15, "Missing H1");
  if (!keyword) penalise(15, "Missing primary keyword");
  if (keyword && !page.seoTitle.toLowerCase().includes(keyword.split(" ")[0]))
    penalise(6, "Primary keyword not present in SEO title");
  if (keyword && !page.h1.toLowerCase().includes(keyword.split(" ")[0]))
    penalise(6, "Primary keyword not present in H1");
  if (keyword && !haystack.includes(keyword.split(" ")[0]))
    penalise(8, "Primary topic not covered in the introduction or body");
  if (page.secondaryKeywords.length + page.semanticKeywords.length + page.entities.length < 3)
    penalise(6, "Fewer than 3 related terms or entities");
  if (page.sections.length < 5) penalise(8, `Only ${page.sections.length} content sections`);
  if (page.faqs.length < 3) penalise(5, "Fewer than 3 FAQs");
  if (!page.cta?.heading || !page.cta?.buttonUrl) penalise(8, "Missing CTA");
  if (!/^https:\/\//.test(page.canonicalUrl) || !page.canonicalUrl.startsWith(context.origin))
    penalise(15, "Canonical URL does not point at the customer's domain");
  if (wordCount(page) < 600) penalise(10, `Content is thin (${wordCount(page)} words)`);
  if (context.existingSlugs.includes(page.slug)) penalise(40, "Slug already exists");

  const invalidLinks = page.internalLinks.filter(
    (link) => !context.allowedInternalUrls.includes(link.url),
  );
  if (invalidLinks.length) penalise(10, `Invented internal links: ${invalidLinks.map((l) => l.url).join(", ")}`);

  const lower = `${haystack} ${page.metaDescription} ${page.hero.description}`.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) penalise(8, `Filler or placeholder text detected: "${phrase}"`);
  }
  for (const claim of UNSUPPORTED_CLAIMS) {
    if (lower.includes(claim)) penalise(8, `Unsupported claim detected: "${claim}"`);
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), issues };
}

// Self-contained styling shipped with every generated page so it matches the
// MentionMyApp look on any site, without depending on the host's CSS.
export const ARTICLE_CSS = `.mm-article{--ink:#0C0E1A;--paper:#F4F5FB;--violet:#6C5CE7;--muted:#6B7086;--line:#E3E5F0;background:var(--paper);color:var(--ink);font-family:"DM Sans",ui-sans-serif,system-ui,sans-serif;font-size:17px;line-height:1.7;padding:48px 20px 80px;min-height:100vh}
.mm-article>*{max-width:880px;margin-left:auto;margin-right:auto}
.mm-article h1,.mm-article h2,.mm-article h3{font-family:"Space Grotesk",ui-sans-serif,system-ui,sans-serif;letter-spacing:-.02em;line-height:1.15;margin:0 0 14px}
.mm-article a{color:var(--violet)}
.mm-article nav ol{list-style:none;display:flex;flex-wrap:wrap;gap:8px;padding:0;margin:0 auto 28px;font-size:13px;color:var(--muted)}
.mm-article nav li+li:before{content:"/";margin-right:8px;color:var(--line)}
.mm-article nav a{color:var(--muted);text-decoration:none}
.mm-article>header{background:var(--ink);color:#fff;border-radius:28px;padding:56px 48px;margin-bottom:24px}
.mm-article>header>p:first-child{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#C9C3FF;background:rgba(108,92,231,.25);border-radius:999px;padding:6px 14px;margin:0 0 20px}
.mm-article>header h1{font-size:clamp(34px,5vw,56px);color:#fff}
.mm-article>header p{color:#C8CBDA;font-size:19px;max-width:640px}
.mm-article>header a,.mm-article>section:last-child a{display:inline-block;background:var(--violet);color:#fff;text-decoration:none;font-weight:600;border-radius:12px;padding:12px 22px;margin-top:8px}
.mm-article>section{background:#fff;border:1px solid var(--line);border-radius:20px;padding:32px 36px;margin-bottom:16px}
.mm-article>section h2{font-size:26px}
.mm-article>section p{margin:0 0 12px;color:#2A2D3E}
.mm-article>section ul{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.mm-article>section li{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:18px;color:var(--muted);font-size:15px}
.mm-article>section li strong{display:block;color:var(--ink);font-family:"Space Grotesk",sans-serif;font-size:17px;margin-bottom:4px}
.mm-article>section h3{font-size:18px;margin-top:20px;padding-top:20px;border-top:1px solid var(--line)}
.mm-article>section h2+h3{margin-top:0;padding-top:0;border-top:0}
.mm-article>section:last-child{background:var(--violet);border:0;color:#fff;text-align:center;padding:48px 36px}
.mm-article>section:last-child h2,.mm-article>section:last-child p{color:#fff}
.mm-article>section:last-child a{background:#fff;color:var(--ink)}
@media(max-width:640px){.mm-article>header{padding:36px 24px}.mm-article>section{padding:24px 20px}}`;
