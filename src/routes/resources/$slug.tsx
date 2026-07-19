import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileSearch,
  Gauge,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  buildSeoArticle,
  getSeoPage,
  relatedSeoPages,
  SITE_NAME,
  SITE_URL,
  type SeoArticle,
  type SeoPage,
  type SeoSection,
} from "@/seo/pages";

export const Route = createFileRoute("/resources/$slug")({
  loader: ({ params }) => {
    const page = getSeoPage(params.slug);
    if (!page) throw notFound();
    const article = buildSeoArticle(page);
    return {
      page,
      article,
      related: relatedSeoPages(page),
      reportImage: buildReportPreviewImage(page, article),
    };
  },
  head: ({ loaderData }) => {
    const { page, article } = loaderData as {
      page: SeoPage;
      article: SeoArticle;
    };
    return {
      meta: [
        { title: `${page.title} - ${SITE_NAME}` },
        { name: "description", content: page.description },
        { name: "robots", content: "index,follow" },
        { property: "og:title", content: page.title },
        { property: "og:description", content: page.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: page.canonicalUrl },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: page.canonicalUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: page.title,
            description: page.description,
            wordCount: article.wordCount,
            dateModified: "2026-07-10",
            datePublished: "2026-07-10",
            mainEntityOfPage: page.canonicalUrl,
            publisher: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
          }),
        },
      ],
    };
  },
  component: ResourcePage,
});

function ResourcePage() {
  const { page, article, related, reportImage } = Route.useLoaderData();
  const toc = article.sections.map((section) => ({
    id: slugify(section.heading),
    heading: section.heading,
    eyebrow: section.eyebrow,
  }));
  const prioritySections = article.sections.slice(4, 10);

  return (
    <main className="min-h-screen bg-white font-body text-[var(--color-ink-900)]">
      <nav className="border-b border-[var(--color-mist-200)] bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-lg font-bold">
            {SITE_NAME}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/resources"
              className="font-medium text-[var(--color-signal-600)] hover:text-[var(--color-signal-600)]"
            >
              Resources
            </Link>
            <Link
              to="/how-it-works"
              className="font-medium text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)]"
            >
              How it works
            </Link>
            <Link
              to="/seo-audit"
              className="font-medium text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)]"
            >
              SEO audit
            </Link>
            <Link
              to="/auth"
              className="font-medium text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <article>
        <header className="border-b border-[var(--color-mist-200)] bg-[var(--color-mist-50)]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
                Deep audit guide / {page.builder.name} / {page.vertical.name}
              </p>
              <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">
                {page.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-ink-700)]">
                {article.summary}
              </p>
              <div className="mt-7 grid gap-3 text-sm text-[var(--color-ink-700)] sm:grid-cols-3">
                <HeroMetric
                  icon={<Gauge className="h-4 w-4" />}
                  label="Current risk score"
                  value={`${page.estimatedScore}/10`}
                />
                <HeroMetric
                  icon={<FileSearch className="h-4 w-4" />}
                  label="Guide depth"
                  value={`${article.wordCount} words`}
                />
                <HeroMetric
                  icon={<Search className="h-4 w-4" />}
                  label="Search target"
                  value={page.keyword}
                />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/seo-audit" className="btn-primary inline-flex items-center gap-2">
                  Run live audit <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="/sitemap.xml" className="btn-ghost inline-flex items-center gap-2">
                  Check sitemap <Search className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-mist-200)] bg-white p-3 shadow-sm">
              <img
                src={reportImage}
                width="1200"
                height="760"
                alt={`${page.title} report preview image`}
                className="aspect-[1200/760] w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </header>

        <section className="border-b border-[var(--color-mist-200)] bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 md:grid-cols-4">
            <SignalCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Technical"
              text={page.intent.auditFocus}
            />
            <SignalCard
              icon={<MapPin className="h-5 w-5" />}
              title="Local and GBP"
              text={page.vertical.localSignal}
            />
            <SignalCard
              icon={<Bot className="h-5 w-5" />}
              title="AEO/GEO"
              text="Entity clarity, AI answer readiness, FAQs, schema, sources, and citation-friendly pages."
            />
            <SignalCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Content"
              text={page.vertical.contentNeed}
            />
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-[var(--color-mist-200)] bg-white p-5 shadow-sm">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em]">
                Audit sections
              </h2>
              <ol className="mt-4 space-y-2 text-sm leading-6 text-[var(--color-ink-700)]">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      className="grid grid-cols-[48px_minmax(0,1fr)] gap-2 rounded-lg px-2 py-1 hover:bg-[var(--color-mist-50)] hover:text-[var(--color-signal-600)]"
                      href={`#${item.id}`}
                    >
                      <span className="font-semibold text-[var(--color-signal-600)]">
                        {item.eyebrow}
                      </span>
                      <span>{item.heading}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--color-mist-200)] bg-[var(--color-mist-50)] p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em]">
                URL target
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <TargetRow label="Stack" value={page.builder.name} />
                <TargetRow label="Audience" value={page.vertical.name} />
                <TargetRow label="Intent" value={page.intent.label} />
                <TargetRow label="Canonical" value={`/resources/${page.slug}`} />
              </dl>
            </div>
          </aside>

          <div className="min-w-0">
            <section className="rounded-2xl border border-[var(--color-mist-200)] bg-[#0B1020] p-6 text-white shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/55">
                Blunt audit summary
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold">
                This guide focuses on one search, one reader, and one fix path.
              </h2>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <DarkMiniStat label="Stack failure" value={page.builder.commonFailure} />
                <DarkMiniStat label="Business proof" value={page.vertical.trustSignal} />
                <DarkMiniStat label="Desired outcome" value={page.intent.outcome} />
              </div>
            </section>

            <section className="mt-8 grid gap-4 lg:grid-cols-3">
              {prioritySections.map((section) => (
                <PriorityCard key={section.heading} section={section} />
              ))}
            </section>

            <div className="mt-10 space-y-8">
              {article.sections.map((section) => (
                <ArticleSection key={section.heading} section={section} />
              ))}
            </div>

            <section className="mt-10 rounded-2xl border border-[var(--color-mist-200)] bg-[var(--color-mist-50)] p-6 md:p-8">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
                  FAQs
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold">
                  Questions people ask before fixing this
                </h2>
              </div>
              <div className="mt-6 grid gap-4">
                {article.faqs.map((faq) => (
                  <div
                    key={faq.question}
                    className="rounded-xl border border-[var(--color-mist-200)] bg-white p-5"
                  >
                    <h3 className="font-display text-lg font-bold">{faq.question}</h3>
                    <p className="mt-3 leading-8 text-[var(--color-ink-800)]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10 rounded-2xl border border-[var(--color-mist-200)] bg-white p-6 md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
                    Related specific URLs
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold">
                    More targets from the same library
                  </h2>
                </div>
                <Link to="/resources" className="btn-ghost inline-flex items-center gap-2">
                  All resources <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {related.map((relatedPage) => (
                  <Link
                    key={relatedPage.slug}
                    to="/resources/$slug"
                    params={{ slug: relatedPage.slug }}
                    className="group rounded-xl border border-[var(--color-mist-200)] bg-white p-4 transition-colors hover:border-[var(--color-signal-400)]"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
                      {relatedPage.builder.name} / {relatedPage.intent.label}
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug group-hover:text-[var(--color-signal-600)]">
                      {relatedPage.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink-700)]">
                      {relatedPage.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}

function HeroMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-mist-200)] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-[var(--color-ink-900)]">
        {value}
      </div>
    </div>
  );
}

function SignalCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-mist-200)] bg-white p-4">
      <div className="flex items-center gap-2 font-display font-bold">
        <span className="text-[var(--color-signal-600)]">{icon}</span>
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--color-ink-700)]">{text}</p>
    </div>
  );
}

function TargetRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-700)]">
        {label}
      </dt>
      <dd className="mt-1 break-words font-semibold text-[var(--color-ink-900)]">{value}</dd>
    </div>
  );
}

function DarkMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">{label}</div>
      <div className="mt-2 text-sm leading-6 text-white/85">{value}</div>
    </div>
  );
}

function PriorityCard({ section }: { section: SeoSection }) {
  return (
    <a
      href={`#${slugify(section.heading)}`}
      className="rounded-xl border border-[var(--color-mist-200)] bg-white p-5 shadow-sm transition-colors hover:border-[var(--color-signal-400)]"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
        {section.eyebrow}
      </div>
      <h3 className="mt-2 font-display text-lg font-bold leading-snug">{section.heading}</h3>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-[var(--color-ink-700)]">
        {section.paragraphs[0]}
      </p>
    </a>
  );
}

function ArticleSection({ section }: { section: SeoSection }) {
  return (
    <section
      id={slugify(section.heading)}
      className="scroll-mt-8 rounded-2xl border border-[var(--color-mist-200)] bg-white p-6 shadow-sm md:p-8"
    >
      <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
        {section.eyebrow}
      </div>
      <h2 className="mt-2 font-display text-3xl font-bold leading-tight">{section.heading}</h2>
      <div className="mt-5 space-y-5 text-base leading-8 text-[var(--color-ink-800)]">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      {section.bullets && (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {section.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex gap-3 rounded-xl border border-[var(--color-mist-200)] bg-[var(--color-mist-50)] p-4 text-sm leading-6 text-[var(--color-ink-800)]"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-signal-600)]" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildReportPreviewImage(page: SeoPage, article: SeoArticle) {
  const score = page.estimatedScore;
  const scorePercent = Math.max(8, Math.min(96, Math.round(score * 10)));
  const issueCount = 22 + (page.index % 41);
  const titleLines = splitSvgLines(page.title, 31).slice(0, 3);
  const subLines = splitSvgLines(
    `${page.builder.name} stack / ${page.vertical.name} / ${page.intent.titleNoun}`,
    44,
  ).slice(0, 2);
  const titleSpans = titleLines
    .map(
      (line, index) =>
        `<tspan x="78" dy="${index === 0 ? "0" : "48"}">${escapeSvgText(line)}</tspan>`,
    )
    .join("");
  const subSpans = subLines
    .map(
      (line, index) =>
        `<tspan x="78" dy="${index === 0 ? "0" : "24"}">${escapeSvgText(line)}</tspan>`,
    )
    .join("");
  const findings = [
    `${page.builder.commonFailure}`,
    `${page.intent.auditFocus}`,
    `${page.vertical.trustSignal}`,
    `${page.vertical.contentNeed}`,
  ];
  const findingRows = findings
    .map((finding, index) => {
      const y = 446 + index * 54;
      const text = splitSvgLines(finding, 58)[0] ?? finding;
      return `
        <rect x="590" y="${y - 25}" width="520" height="42" rx="14" fill="#FFFFFF" opacity="0.92"/>
        <circle cx="616" cy="${y - 4}" r="8" fill="#5B5BD6"/>
        <text x="638" y="${y + 2}" font-size="18" font-weight="650" fill="#182033">${escapeSvgText(text)}</text>
      `;
    })
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760" role="img" aria-label="${escapeSvgText(page.title)} SEO report preview">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#F7F8FC"/>
          <stop offset="48%" stop-color="#EEF0F7"/>
          <stop offset="100%" stop-color="#FFFFFF"/>
        </linearGradient>
        <linearGradient id="panel" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#11182D"/>
          <stop offset="100%" stop-color="#29315A"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="20" stdDeviation="24" flood-color="#11182D" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="1200" height="760" rx="38" fill="url(#bg)"/>
      <rect x="44" y="42" width="1112" height="676" rx="34" fill="#FFFFFF" filter="url(#shadow)"/>
      <rect x="44" y="42" width="1112" height="215" rx="34" fill="url(#panel)"/>
      <rect x="44" y="218" width="1112" height="39" fill="url(#panel)"/>
      <text x="78" y="96" font-size="22" font-weight="800" letter-spacing="3" fill="#B9C0FF">SEO AUDIT REPORT</text>
      <text x="78" y="158" font-size="44" font-weight="900" fill="#FFFFFF">${titleSpans}</text>
      <text x="78" y="292" font-size="21" font-weight="650" fill="#535D72">${subSpans}</text>

      <rect x="78" y="348" width="438" height="284" rx="28" fill="#F7F8FC" stroke="#E4E7F2"/>
      <text x="112" y="400" font-size="19" font-weight="800" fill="#535D72">Estimated SEO foundation</text>
      <text x="112" y="492" font-size="94" font-weight="900" fill="#0B1020">${score.toFixed(1)}</text>
      <text x="294" y="488" font-size="30" font-weight="800" fill="#535D72">/10</text>
      <rect x="112" y="532" width="330" height="20" rx="10" fill="#E4E7F2"/>
      <rect x="112" y="532" width="${Math.round(330 * (scorePercent / 100))}" height="20" rx="10" fill="#5B5BD6"/>
      <text x="112" y="590" font-size="20" font-weight="700" fill="#535D72">${article.wordCount} words / ${issueCount} checks / resource URL</text>

      <rect x="558" y="348" width="586" height="284" rx="28" fill="#F7F8FC" stroke="#E4E7F2"/>
      <text x="590" y="400" font-size="19" font-weight="800" fill="#535D72">Bad things this page checks</text>
      ${findingRows}

      <rect x="78" y="662" width="1030" height="28" rx="14" fill="#EEF0F7"/>
      <rect x="78" y="662" width="710" height="28" rx="14" fill="#5B5BD6"/>
      <text x="92" y="682" font-size="15" font-weight="800" fill="#FFFFFF">Audit framework: crawl, index, GBP, AEO/GEO, content, cost, measurement</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function splitSvgLines(value: string, maxLength: number) {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
