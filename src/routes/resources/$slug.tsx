import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import {
  buildSeoArticle,
  getSeoPage,
  relatedSeoPages,
  SITE_NAME,
  SITE_URL,
  type SeoArticle,
  type SeoPage,
} from "@/seo/pages";

export const Route = createFileRoute("/resources/$slug")({
  loader: ({ params }) => {
    const page = getSeoPage(params.slug);
    if (!page) throw notFound();
    return {
      page,
      article: buildSeoArticle(page),
      related: relatedSeoPages(page),
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
  const { page, article, related } = Route.useLoaderData();
  const toc = article.sections.map((section: any) => ({
    id: section.heading
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    heading: section.heading,
  }));

  return (
    <main className="min-h-screen bg-white font-body text-[var(--color-ink-900)]">
      <nav className="border-b border-[var(--color-mist-200)] bg-white/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-lg font-bold">
            {SITE_NAME}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/resources"
              className="font-medium text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)]"
            >
              Resources
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
          <div className="mx-auto max-w-6xl px-5 py-12">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
                {page.intent.articleAngle} / {page.platform.name}
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
                {page.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-[var(--color-ink-700)]">
                {article.summary}
              </p>
              <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-700)]">
                <span className="rounded-md border border-[var(--color-mist-200)] bg-white px-3 py-2">
                  {article.wordCount} words
                </span>
                <span className="rounded-md border border-[var(--color-mist-200)] bg-white px-3 py-2">
                  Indexable
                </span>
                <span className="rounded-md border border-[var(--color-mist-200)] bg-white px-3 py-2">
                  Canonical: MentionMyApp.com
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-lg border border-[var(--color-mist-200)] p-4">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em]">
                Template
              </h2>
              <ol className="mt-4 space-y-2 text-sm leading-6 text-[var(--color-ink-700)]">
                {toc.map((item: any) => (
                  <li key={item.id}>
                    <a className="hover:text-[var(--color-signal-600)]" href={`#${item.id}`}>
                      {item.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="prose max-w-none">
              {article.sections.map((section: any) => {
                const id = section.heading
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                return (
                  <section
                    key={section.heading}
                    id={id}
                    className="scroll-mt-8 border-b border-[var(--color-mist-200)] py-8"
                  >
                    <h2 className="font-display text-2xl font-bold">{section.heading}</h2>
                    <div className="mt-4 space-y-4 text-base leading-8 text-[var(--color-ink-800)]">
                      {section.paragraphs.map((paragraph: any) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.bullets && (
                      <ul className="mt-5 grid gap-2 text-sm leading-6 text-[var(--color-ink-700)] md:grid-cols-2">
                        {section.bullets.map((bullet: any) => (
                          <li
                            key={bullet}
                            className="rounded-lg border border-[var(--color-mist-200)] bg-[var(--color-mist-50)] px-4 py-3"
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}

              <section className="py-8">
                <h2 className="font-display text-2xl font-bold">FAQs</h2>
                <div className="mt-5 space-y-4">
                  {article.faqs.map((faq: any) => (
                    <div
                      key={faq.question}
                      className="rounded-lg border border-[var(--color-mist-200)] p-5"
                    >
                      <h3 className="font-display text-lg font-bold">{faq.question}</h3>
                      <p className="mt-3 leading-8 text-[var(--color-ink-800)]">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className="border-t border-[var(--color-mist-200)] py-8">
              <h2 className="font-display text-2xl font-bold">Related pages</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {related.map((relatedPage: any) => (
                  <Link
                    key={relatedPage.slug}
                    to="/resources/$slug"
                    params={{ slug: relatedPage.slug }}
                    className="rounded-lg border border-[var(--color-mist-200)] px-4 py-3 text-sm font-medium text-[var(--color-ink-800)] hover:border-[var(--color-signal-400)] hover:text-[var(--color-signal-600)]"
                  >
                    {relatedPage.title}
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
