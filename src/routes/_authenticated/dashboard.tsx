import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { getCurrentWorkspace } from "@/lib/workspace.functions";
import { getGrowthDashboardData } from "@/lib/growth-dashboard.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Growth dashboard — MentionMyApp" }] }),
  component: GrowthDashboard,
});

const WORK_META = {
  audit: {
    title: "Technical SEO foundation",
    detail: "Audit crawl, indexing, metadata, schema, and internal links",
  },
  pages: {
    title: "New indexable pages",
    detail: "Build pages around search demand and competitor gaps",
  },
  placements: {
    title: "Authority backlinks",
    detail: "Qualify and track relevant contextual placements",
  },
} as const;

function GrowthDashboard() {
  const [rangeDays, setRangeDays] = useState(90);
  const { data } = useQuery({
    queryKey: ["current-workspace"],
    queryFn: () => getCurrentWorkspace(),
  });
  const workspace = data?.workspace?.name ?? "Your workspace";
  const { data: growth, isLoading } = useQuery({
    queryKey: ["growth-dashboard"],
    queryFn: () => getGrowthDashboardData(),
  });
  const metrics = growth?.metrics ?? [];
  const recent = metrics.slice(-rangeDays);
  const organicClicks = recent.reduce((sum, row) => sum + (row.clicks ?? 0), 0);
  const impressions = recent.reduce((sum, row) => sum + (row.impressions ?? 0), 0);
  const format = (value: number) =>
    new Intl.NumberFormat("en-US", {
      notation: value >= 10000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(value);
  const connected = Boolean(growth?.connected);
  const rangeLabel = rangeDays === 488 ? "Last 16 months" : `Last ${rangeDays} days`;

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
        <div className="flex flex-wrap gap-3">
          <select
            value={rangeDays}
            onChange={(event) => setRangeDays(Number(event.target.value))}
            className="rounded-xl border border-[#dedfe6] bg-white px-4 py-3 text-sm font-bold text-[#242838]"
            aria-label="Reporting range"
          >
            <option value={28}>Last 28 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last 12 months</option>
            <option value={488}>Last 16 months</option>
          </select>
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
        <Stat
          label="Organic clicks"
          value={isLoading ? "…" : connected ? format(organicClicks) : "—"}
          change={connected ? rangeLabel : "Connect Search Console"}
        />
        <Stat
          label="Impressions"
          value={isLoading ? "…" : connected ? format(impressions) : "—"}
          change={connected ? rangeLabel : "Baseline not connected"}
        />
        <Stat
          label="Backlinks live"
          value={(growth?.backlinksLive ?? 0) > 0 ? format(growth!.backlinksLive) : "—"}
          change={
            (growth?.backlinksLive ?? 0) > 0
              ? "Verified live placements"
              : "No verified placements yet"
          }
        />
        <Stat
          label="AI mentions"
          value={(growth?.aiMentions ?? 0) > 0 ? format(growth!.aiMentions) : "—"}
          change={
            (growth?.aiMentions ?? 0) > 0
              ? "Tracked checks mentioning you"
              : "No successful visibility checks yet"
          }
        />
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
              {rangeLabel}
            </span>
          </div>
          <PerformanceChart metrics={metrics} connected={connected} rangeDays={rangeDays} />
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
            {connected
              ? `Connected to ${growth?.propertyUrl ?? "Search Console"}. Every result is verified in your own data.`
              : "Connect Search Console to start the measurement period and verify every result in your own data."}
          </p>
          <div className="my-7 h-px bg-white/10" />
          <div className="flex items-end justify-between">
            <div>
              <strong className="block text-5xl tracking-[-.06em]">
                {growth?.baselineCapturedAt && growth.baselineDate
                  ? `Day ${Math.max(0, Math.floor((Date.now() - new Date(growth.baselineDate).getTime()) / 86_400_000))}`
                  : "Day 0"}
              </strong>
              <span className="mt-1 block text-xs text-[#9ea4bd]">
                {growth?.lastSyncedAt
                  ? `Synced ${new Date(growth.lastSyncedAt).toLocaleString()}`
                  : "Begins after baseline approval"}
              </span>
            </div>
            <GuaranteeRing
              day={
                growth?.baselineCapturedAt && growth.baselineDate
                  ? Math.max(
                      0,
                      Math.floor(
                        (Date.now() - new Date(growth.baselineDate).getTime()) / 86_400_000,
                      ),
                    )
                  : 0
              }
            />
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
            <span className="text-xs font-semibold text-[#6366f1]">Live data</span>
          </div>
          <div className="space-y-6">
            <WorkItem
              index={1}
              title={WORK_META.audit.title}
              detail={WORK_META.audit.detail}
              stat={
                growth?.workPlan?.audit
                  ? `${growth.workPlan.audit.passed} of ${growth.workPlan.audit.passed + growth.workPlan.audit.failed} checks passing`
                  : undefined
              }
              progress={
                growth?.workPlan?.audit
                  ? growth.workPlan.audit.passed /
                    Math.max(1, growth.workPlan.audit.passed + growth.workPlan.audit.failed)
                  : null
              }
              empty={
                <Link to="/seo-audit" className="text-xs font-bold text-[#6366f1]">
                  Run your first audit to populate this →
                </Link>
              }
            />
            <WorkItem
              index={2}
              title={WORK_META.pages.title}
              detail={WORK_META.pages.detail}
              stat={
                (growth?.workPlan?.pages?.published ?? 0) > 0
                  ? `${growth!.workPlan!.pages.indexed} of ${growth!.workPlan!.pages.published} published pages indexed`
                  : undefined
              }
              progress={
                (growth?.workPlan?.pages?.published ?? 0) > 0
                  ? growth!.workPlan!.pages.indexed / growth!.workPlan!.pages.published
                  : null
              }
              empty={
                <span className="text-xs text-[#858a98]">
                  Published SEO pages appear here after delivery begins.
                </span>
              }
            />
            <WorkItem
              index={3}
              title={WORK_META.placements.title}
              detail={WORK_META.placements.detail}
              stat={
                (growth?.workPlan?.placements?.queued ?? 0) > 0
                  ? `${growth!.workPlan!.placements.live} of ${growth!.workPlan!.placements.queued} tracked placements live`
                  : undefined
              }
              progress={
                (growth?.workPlan?.placements?.queued ?? 0) > 0
                  ? growth!.workPlan!.placements.live / growth!.workPlan!.placements.queued
                  : null
              }
              empty={
                <span className="text-xs text-[#858a98]">
                  No placements have been queued. Only verified live links count toward progress.
                </span>
              }
            />
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
            {connected ? (
              <>
                <Activity
                  color="#22c55e"
                  title={growth?.baselineCapturedAt ? "Baseline captured" : "Baseline connected"}
                  body={
                    growth?.baselineCapturedAt
                      ? `${growth.baselineClicks.toLocaleString()} clicks and ${growth.baselineImpressions.toLocaleString()} impressions were saved as day one.`
                      : `Search Console access for ${growth?.propertyUrl ?? "your property"} is approved; the first snapshot is still syncing.`
                  }
                />
                <Activity
                  color={(growth?.workPlan?.placements?.live ?? 0) > 0 ? "#22c55e" : "#d1d3dc"}
                  title={
                    (growth?.workPlan?.placements?.live ?? 0) > 0
                      ? "Verified placements live"
                      : (growth?.workPlan?.placements?.queued ?? 0) > 0
                        ? "Placements in progress"
                        : "Next: queue the first placement"
                  }
                  body={
                    (growth?.workPlan?.placements?.queued ?? 0) > 0
                      ? `${growth!.workPlan!.placements.live} of ${growth!.workPlan!.placements.queued} tracked placements are verified live.`
                      : "Placement progress appears after work is actually added to the queue."
                  }
                />
              </>
            ) : (
              <Activity
                color="#d1d3dc"
                title="Next: connect baseline"
                body="Add Search Console data to begin tracking."
              />
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function WorkItem({
  index,
  title,
  detail,
  stat,
  progress,
  empty,
}: {
  index: number;
  title: string;
  detail: string;
  stat?: string;
  progress: number | null;
  empty: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#efefff] text-xs font-bold text-[#5558d8]">
          {index}
        </span>
        <div className="flex-1">
          <div className="font-bold text-[#222637]">{title}</div>
          <div className="mt-1 text-xs text-[#858a98]">{detail}</div>
        </div>
        {stat && (
          <span className="max-w-44 text-right text-xs font-bold text-[#6366f1]">{stat}</span>
        )}
      </div>
      {progress != null ? (
        <div className="ml-11 h-1.5 overflow-hidden rounded-full bg-[#eeeef3]">
          <div
            className="h-full rounded-full bg-[#6366f1] transition-[width] duration-700"
            style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }}
          />
        </div>
      ) : (
        !stat && <div className="ml-11">{empty}</div>
      )}
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

function GuaranteeRing({ day }: { day: number }) {
  const size = 64;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const visibleDay = Math.min(day, 90);
  const progress = visibleDay / 90;
  return (
    <div className="relative grid h-16 w-16 place-items-center" title={`Day ${visibleDay} of 90`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#6366f1"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: "stroke-dashoffset .8s ease" }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold tracking-wide text-[#c9cde0]">
        {visibleDay}/90
      </span>
    </div>
  );
}

function PerformanceChart({
  metrics,
  connected,
  rangeDays,
}: {
  metrics: Array<{ day: string; clicks: number | null; impressions: number | null }>;
  connected: boolean;
  rangeDays: number;
}) {
  const width = 900;
  const height = 280;
  const points = metrics.slice(-rangeDays);
  const path = (key: "clicks" | "impressions", close = false) => {
    if (!points.length) return "";
    const max = Math.max(1, ...points.map((row) => row[key] ?? 0));
    const line = points
      .map((row, index) => {
        const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
        const y = height - 18 - ((row[key] ?? 0) / max) * (height - 42);
        return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    return close ? `${line} L${width} ${height} L0 ${height} Z` : line;
  };
  const clicksPath = path("clicks");
  const impressionsPath = path("impressions");
  const impressionsArea = path("impressions", true);

  return (
    <div className="relative mt-10 h-[290px] overflow-hidden border-b border-l border-[#e5e6eb] bg-[repeating-linear-gradient(0deg,transparent_0,transparent_71px,#eff0f4_72px)]">
      {points.length > 0 ? (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Search Console clicks and impressions over the selected ${rangeDays}-day range`}
        >
          <path d={impressionsArea} fill="#6366f1" fillOpacity="0.07" stroke="none" />
          <path
            d={impressionsPath}
            fill="none"
            stroke="#a6a8ef"
            strokeWidth="2.5"
            strokeDasharray="1 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={clicksPath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <div className="absolute inset-0 grid place-items-center text-center">
          {connected ? (
            <div>
              <strong className="block text-sm text-[#242838]">Search Console is connected</strong>
              <span className="mt-2 block text-xs text-[#777c8c]">
                No performance rows were returned for this date range yet.
              </span>
            </div>
          ) : (
            <Link
              to="/accounts"
              className="rounded-xl border border-[#dedfe7] bg-white px-5 py-3 text-sm font-bold shadow-sm"
            >
              Connect your baseline →
            </Link>
          )}
        </div>
      )}
    </div>
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
