import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCurrentWorkspace } from "@/lib/workspace.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Growth dashboard — MentionMyApp" }] }),
  component: GrowthDashboard,
});

const WORK = [
  {
    title: "Technical SEO foundation",
    detail: "Audit crawl, indexing, metadata, schema, and internal links",
    progress: 72,
  },
  {
    title: "New indexable pages",
    detail: "Build pages around search demand and competitor gaps",
    progress: 42,
  },
  {
    title: "Authority backlinks",
    detail: "Qualify and track relevant contextual placements",
    progress: 28,
  },
];

function GrowthDashboard() {
  const { data } = useQuery({
    queryKey: ["current-workspace"],
    queryFn: () => getCurrentWorkspace(),
  });
  const workspace = data?.workspace?.name ?? "Your workspace";

  return (
    <div className="mx-auto max-w-[1480px]">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[.17em] text-[#6366f1]">
            MentionMyApp growth report
          </div>
          <h1 className="font-display text-4xl font-bold tracking-[-.045em] text-[#111426]">
            Organic growth overview
          </h1>
          <p className="mt-2 text-sm text-[#777c8c]">
            {workspace} · measured against your day-one baseline
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/seo-audit"
            className="rounded-xl border border-[#dedfe6] bg-white px-5 py-3 text-sm font-bold text-[#242838]"
          >
            View SEO audit
          </Link>
          <Link
            to="/grow"
            className="rounded-xl bg-[#111426] px-5 py-3 text-sm font-bold text-white"
          >
            Update growth plan
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Organic clicks" value="—" change="Connect Search Console" />
        <Stat label="Indexed pages" value="—" change="Baseline not connected" />
        <Stat label="Backlinks live" value="0" change="Placements will appear here" />
        <Stat label="AI mentions" value="0" change="Tracking starts after audit" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_.85fr]">
        <article className="rounded-2xl border border-[#e0e1e7] bg-white p-7">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[.14em] text-[#969aa8]">
                Search Console performance
              </div>
              <h2 className="mt-2 font-display text-xl font-bold tracking-[-.025em]">
                Organic clicks and impressions
              </h2>
            </div>
            <span className="rounded-lg border border-[#e4e5ea] px-3 py-2 text-xs text-[#777c8c]">
              Last 90 days
            </span>
          </div>
          <div className="relative mt-10 h-[290px] overflow-hidden border-b border-l border-[#e5e6eb] bg-[repeating-linear-gradient(0deg,transparent_0,transparent_71px,#eff0f4_72px)]">
            <svg
              viewBox="0 0 900 280"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0 250 C110 248 155 230 235 234 S370 202 445 207 S590 150 660 162 S790 78 900 58"
                fill="none"
                stroke="#6366f1"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M0 250 C110 248 155 230 235 234 S370 202 445 207 S590 150 660 162 S790 78 900 58 L900 280 L0 280Z"
                fill="#6366f112"
              />
              <path
                d="M0 258 C125 254 210 245 300 247 S480 218 560 221 S730 170 900 138"
                fill="none"
                stroke="#a6a8ef"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <Link
                to="/seo-audit"
                className="rounded-xl border border-[#dedfe7] bg-white px-5 py-3 text-sm font-bold shadow-sm"
              >
                Connect your baseline →
              </Link>
            </div>
          </div>
          <div className="mt-4 flex gap-6 text-xs text-[#777c8c]">
            <span>
              <i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#6366f1]" />
              Organic clicks
            </span>
            <span>
              <i className="mr-2 inline-block h-2 w-2 rounded-full bg-[#a6a8ef]" />
              Impressions
            </span>
          </div>
        </article>

        <article className="rounded-2xl bg-[#111426] p-7 text-white">
          <div className="text-[11px] font-bold uppercase tracking-[.14em] text-[#9ea4bd]">
            90-day guarantee
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold leading-tight tracking-[-.03em]">
            Growth is measured from a clear baseline.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#b8bdd0]">
            Connect Search Console to start the measurement period and verify every result in your
            own data.
          </p>
          <div className="my-7 h-px bg-white/10" />
          <div className="flex items-end justify-between">
            <div>
              <strong className="block text-5xl tracking-[-.06em]">Day 0</strong>
              <span className="mt-1 block text-xs text-[#9ea4bd]">
                Begins after baseline approval
              </span>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#6366f1] text-lg">
              ✓
            </span>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <article className="rounded-2xl border border-[#e0e1e7] bg-white p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[.14em] text-[#969aa8]">
                Current work plan
              </div>
              <h2 className="mt-2 font-display text-xl font-bold">What we’re building</h2>
            </div>
            <span className="text-xs font-semibold text-[#6366f1]">Audit stage</span>
          </div>
          <div className="space-y-6">
            {WORK.map((item, index) => (
              <div key={item.title}>
                <div className="mb-2 flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#efefff] text-xs font-bold text-[#5558d8]">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-[#222637]">{item.title}</div>
                    <div className="mt-1 text-xs text-[#858a98]">{item.detail}</div>
                  </div>
                  <span className="text-xs font-bold text-[#6366f1]">{item.progress}%</span>
                </div>
                <div className="ml-11 h-1.5 overflow-hidden rounded-full bg-[#eeeef3]">
                  <div
                    className="h-full rounded-full bg-[#6366f1]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#e0e1e7] bg-white p-7">
          <div className="text-[11px] font-bold uppercase tracking-[.14em] text-[#969aa8]">
            Latest activity
          </div>
          <h2 className="mt-2 font-display text-xl font-bold">Growth timeline</h2>
          <div className="mt-7 space-y-5">
            <Activity
              color="#6366f1"
              title="Workspace ready"
              body="Your SEO growth workspace is active."
            />
            <Activity
              color="#22c55e"
              title="Owner access confirmed"
              body="Payment is not required for this account."
            />
            <Activity
              color="#d1d3dc"
              title="Next: connect baseline"
              body="Add Search Console data to begin tracking."
            />
          </div>
        </article>
      </section>
    </div>
  );
}

function Stat({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <article className="rounded-2xl border border-[#e0e1e7] bg-white p-6">
      <div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#969aa8]">{label}</div>
      <strong className="mt-5 block font-display text-4xl tracking-[-.06em]">{value}</strong>
      <div className="mt-3 text-xs text-[#7e8392]">{change}</div>
    </article>
  );
}

function Activity({ color, title, body }: { color: string; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <span
        className="mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-[#f1f1f5]"
        style={{ background: color }}
      />
      <div>
        <div className="text-sm font-bold">{title}</div>
        <div className="mt-1 text-xs leading-5 text-[#858a98]">{body}</div>
      </div>
    </div>
  );
}
