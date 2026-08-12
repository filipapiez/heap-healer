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

  return `<article>
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
