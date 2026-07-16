import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

const CMS = [
  {
    label: "WordPress",
    icon: "W",
    description: "Publish and update SEO pages using a WordPress application password or plugin.",
    setup: "Application password",
  },
  {
    label: "Shopify",
    icon: "S",
    description: "Create optimized articles, collection copy, and internal links in your store.",
    setup: "Shopify app",
  },
  {
    label: "Webflow",
    icon: "w",
    description: "Publish directly into a selected Webflow CMS collection.",
    setup: "Workspace OAuth",
  },
  {
    label: "Framer",
    icon: "F",
    description: "Send approved SEO pages and metadata into your Framer CMS.",
    setup: "CMS API",
  },
  {
    label: "Ghost",
    icon: "G",
    description: "Publish search-focused posts through the Ghost Admin API.",
    setup: "Admin API key",
  },
  {
    label: "Notion",
    icon: "N",
    description: "Use a Notion database as the approval and content staging area.",
    setup: "Workspace integration",
  },
];

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({ meta: [{ title: "Website connections — MentionMyApp" }] }),
  component: WebsiteConnections,
});

function WebsiteConnections() {
  return (
    <div className="max-w-7xl">
      <PageHeader
        title="Website connections"
        subtitle="Connect measurement first, then choose where MentionMyApp should publish and update SEO pages."
      />

      <section className="mb-8 overflow-hidden rounded-2xl border border-[#dfe1eb] bg-white shadow-[0_10px_30px_rgba(23,26,43,.05)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[conic-gradient(#4285f4_0_25%,#ea4335_25%_50%,#fbbc05_50%_75%,#34a853_75%)] text-xl font-black text-white">
              G
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold">Google Search Console</h2>
                <span className="rounded-full bg-[#efefff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#5558d8]">
                  Required
                </span>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[var(--color-ink-700)]/65">
                This supplies daily clicks, impressions, indexing data, and the day-one baseline
                used by your 90-day growth report. Access is read-only.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="rounded-xl bg-[#111426] px-5 py-3 text-sm font-bold text-white opacity-55"
            title="Google OAuth credentials must be configured before this button can open the connection flow."
          >
            OAuth setup pending
          </button>
        </div>
        <div className="border-t border-[#ececf2] bg-[#fafafe] px-6 py-3 text-xs text-[#737889]">
          Once connected, metrics sync automatically every day into the SEO Growth dashboard.
        </div>
      </section>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Choose your website platform</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-700)]/55">
            One CMS connection is enough. Customers do not need to connect every platform.
          </p>
        </div>
        <span className="rounded-full border border-[#e1e3eb] bg-white px-3 py-2 text-xs font-semibold text-[#737889]">
          Connection APIs in progress
        </span>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CMS.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-[#e1e3eb] bg-white p-5 shadow-[0_8px_24px_rgba(23,26,43,.04)]"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full border border-[#dfe2ec] font-display text-lg font-black">
                {item.icon}
              </div>
              <span className="rounded-full bg-[#f2f2f7] px-2.5 py-1 text-[10px] font-bold text-[#777c8c]">
                Coming next
              </span>
            </div>
            <h3 className="font-display text-lg font-bold">{item.label}</h3>
            <p className="mt-2 min-h-16 text-sm leading-6 text-[var(--color-ink-700)]/60">
              {item.description}
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-[#ececf2] pt-4">
              <span className="text-xs font-semibold text-[#777c8c]">{item.setup}</span>
              <button
                type="button"
                disabled
                className="text-xs font-bold text-[#6366f1] opacity-60"
              >
                Connect soon →
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-2xl bg-[#111426] p-6 text-white">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.15em] text-[#9ea4bd]">
              Don’t see your website platform?
            </div>
            <h2 className="mt-2 font-display text-xl font-bold">
              We can start with a manual setup.
            </h2>
            <p className="mt-2 text-sm text-[#b8bdd0]">
              Your SEO report and Search Console tracking work independently of the CMS connection.
            </p>
          </div>
          <Link
            to="/contact"
            className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-[#111426]"
          >
            Request a platform
          </Link>
        </div>
      </section>
    </div>
  );
}
