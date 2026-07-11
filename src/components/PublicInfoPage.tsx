import { Link } from "@tanstack/react-router";

import { SITE_NAME, type TrustPage } from "@/legal/pages";

export function PublicInfoPage({ page }: { page: TrustPage }) {
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
              to="/how-it-works"
              className="font-medium text-[var(--color-ink-700)] hover:text-[var(--color-ink-900)]"
            >
              How it works
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

      <header className="border-b border-[var(--color-mist-200)] bg-[var(--color-mist-50)]">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--color-signal-600)]">
            {page.eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-tight md:text-6xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-ink-700)]">
            {page.summary}
          </p>
        </div>
      </header>

      <article className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-[var(--color-mist-200)] bg-white p-5 shadow-sm">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em]">
              Page sections
            </h2>
            <ol className="mt-4 space-y-2 text-sm leading-6 text-[var(--color-ink-700)]">
              {page.sections.map((section) => (
                <li key={section.heading}>
                  <a
                    href={`#${slugify(section.heading)}`}
                    className="block rounded-lg px-2 py-1 hover:bg-[var(--color-mist-50)] hover:text-[var(--color-signal-600)]"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="space-y-8">
          {page.sections.map((section) => (
            <section
              key={section.heading}
              id={slugify(section.heading)}
              className="scroll-mt-8 rounded-2xl border border-[var(--color-mist-200)] bg-white p-6 shadow-sm md:p-8"
            >
              <h2 className="font-display text-3xl font-bold leading-tight">{section.heading}</h2>
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
                      className="rounded-xl border border-[var(--color-mist-200)] bg-[var(--color-mist-50)] p-4 text-sm leading-6 text-[var(--color-ink-800)]"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="rounded-2xl border border-[var(--color-mist-200)] bg-[#0B1020] p-6 text-white shadow-sm md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/55">
              Next step
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold">
              Run a deeper audit with website, GitHub, and GBP context.
            </h2>
            <p className="mt-4 max-w-3xl leading-8 text-white/75">
              MentionMyApp works best when the report has the real website URL, optional source
              repository, and Google Business Profile context instead of guessing from a homepage.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/seo-audit" className="btn-primary">
                Run SEO audit
              </Link>
              <Link to="/resources" className="btn-ghost border-white/20 text-white hover:bg-white/10">
                Browse resources
              </Link>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
