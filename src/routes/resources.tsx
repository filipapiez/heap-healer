import { Link, createFileRoute } from "@tanstack/react-router";
import { featuredSeoPages, pagesByIntent, seoPages, SITE_NAME, SITE_URL } from "@/seo/pages";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: `${SITE_NAME} SEO Audit Library - 1,000 specific audit pages` },
      {
        name: "description",
        content:
          "Browse 1,000 specific SEO audit, indexing, GBP, AEO/GEO, and technical SEO cleanup pages for Lovable, Vercel, Shopify, WordPress, Wix, and more.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: `${SITE_NAME} SEO audit resource library` },
      {
        property: "og:description",
        content:
          "Specific URLs for high-intent SEO audit searches, built with a long-form golden template.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/resources` }],
  }),
  component: ResourcesIndex,
});

function ResourcesIndex() {
  const grouped = pagesByIntent();
  const featured = featuredSeoPages();

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

      <section className="border-b border-[var(--color-mist-200)] bg-[var(--color-mist-50)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
              Golden-template SEO library
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">
              1,000 specific URLs for SEO audit, indexing, GBP, and AI visibility searches.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-ink-700)]">
              Each page targets one real search pattern: a stack, an audit problem, and a business
              type. No more generic “launch playbook” pages. These are long-form audit pages built
              for searches like Lovable SEO audit for SaaS startups, Vercel indexing fix for AI
              tools, and Wix Google Business Profile audit for roofers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="btn-primary" href="/sitemap.xml">
                View sitemap
              </a>
              <Link to="/seo-audit" className="btn-ghost">
                Run live audit
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--color-mist-200)] bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-[#0B1020] p-5 text-white">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                SEO inventory
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Stat label="URLs" value={seoPages.length} />
                <Stat label="Audit intents" value={5} />
                <Stat label="Stacks" value={10} />
                <Stat label="Business types" value={20} />
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[var(--color-mist-200)] p-4">
              <div className="text-sm font-semibold">Golden template per page</div>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-700)]">
                <li>Direct answer and search intent</li>
                <li>Technical, indexing, GBP, and AI visibility sections</li>
                <li>Generated report image and 2,500-3,500 word body</li>
                <li>FAQs, schema, related pages, and sitemap inclusion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
              Featured targets
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">Specific URLs, not generic filler.</h2>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {featured.map((page) => (
            <Link
              key={page.slug}
              to="/resources/$slug"
              params={{ slug: page.slug }}
              className="group rounded-2xl border border-[var(--color-mist-200)] bg-white p-5 shadow-sm transition-colors hover:border-[var(--color-signal-400)]"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
                {page.builder.name} / {page.intent.label}
              </div>
              <h3 className="mt-3 font-display text-xl font-bold leading-tight group-hover:text-[var(--color-signal-600)]">
                {page.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-ink-700)]">
                {page.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
            All URLs
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">Grouped by audit intent</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-ink-700)]">
            Each group contains 200 pages: 10 site stacks multiplied by 20 business types.
          </p>
        </div>

        <div className="space-y-10">
          {grouped.map(({ intent, pages }) => (
            <section key={intent.slug} className="border-t border-[var(--color-mist-200)] pt-7">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl font-bold">{intent.titleNoun}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-ink-700)]">
                    {intent.searchIntent}. Outcome: {intent.outcome}.
                  </p>
                </div>
                <div className="rounded-full bg-[var(--color-mist-100)] px-3 py-1 text-xs font-semibold text-[var(--color-ink-700)]">
                  {pages.length} URLs
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-white/60">{label}</div>
    </div>
  );
}
