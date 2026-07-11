import { Link, createFileRoute } from "@tanstack/react-router";
import { pagesByPlatform, seoPages, SITE_NAME, SITE_URL } from "@/seo/pages";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: `${SITE_NAME} Resources - 1,000 mention and launch guides` },
      {
        name: "description",
        content:
          "Browse 1,000 indexable MentionMyApp resources for LinkedIn, Reddit, Forbes, Yahoo Finance, and other mention-led launch channels.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: `${SITE_NAME} resource library` },
      {
        property: "og:description",
        content:
          "A searchable library of platform, audience, and competitor-aware launch resources.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/resources` }],
  }),
  component: ResourcesIndex,
});

function ResourcesIndex() {
  const grouped = pagesByPlatform();

  return (
    <main className="min-h-screen bg-white font-body text-[var(--color-ink-900)]">
      <nav className="border-b border-[var(--color-mist-200)] bg-white/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-lg font-bold">
            {SITE_NAME}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/resources" className="font-medium text-[var(--color-signal-600)]">
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

      <section className="border-b border-[var(--color-mist-200)] bg-[var(--color-mist-50)]">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
            SEO resource hub
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-tight md:text-5xl">
            1,000 indexable MentionMyApp pages for platform-specific launch and mention intent.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-ink-700)]">
            Every URL follows the same editorial structure: answer the query, explain channel fit,
            compare the competitive landscape, give execution steps, and close with FAQs. The
            library includes LinkedIn, Reddit, Forbes, Yahoo Finance, and other high-intent channels
            without implying false affiliation.
          </p>
          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--color-mist-200)] bg-white p-4">
              <div className="font-display text-3xl font-bold">{seoPages.length}</div>
              <div className="mt-1 text-[var(--color-ink-700)]">crawlable resource URLs</div>
            </div>
            <div className="rounded-lg border border-[var(--color-mist-200)] bg-white p-4">
              <div className="font-display text-3xl font-bold">20</div>
              <div className="mt-1 text-[var(--color-ink-700)]">
                platform and publication angles
              </div>
            </div>
            <div className="rounded-lg border border-[var(--color-mist-200)] bg-white p-4">
              <div className="font-display text-3xl font-bold">10</div>
              <div className="mt-1 text-[var(--color-ink-700)]">audience segments per intent</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">All URLs</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-ink-700)]">
              These pages are grouped by URL entity so search engines and readers can move through
              the library naturally.
            </p>
          </div>
          <a className="btn-ghost" href="/sitemap.xml">
            Sitemap
          </a>
        </div>

        <div className="space-y-8">
          {grouped.map(({ platform, pages }) => (
            <section key={platform.slug} className="border-t border-[var(--color-mist-200)] pt-6">
              <h3 className="font-display text-xl font-bold">{platform.name}</h3>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {pages.map((page) => (
                  <Link
                    key={page.slug}
                    to="/resources/$slug"
                    params={{ slug: page.slug }}
                    className="rounded-lg border border-[var(--color-mist-200)] px-4 py-3 text-sm font-medium text-[var(--color-ink-800)] transition-colors hover:border-[var(--color-signal-400)] hover:text-[var(--color-signal-600)]"
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
