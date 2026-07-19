import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  Circle,
  FileText,
  Link2,
  PlugZap,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getCurrentWorkspace } from "@/lib/workspace.functions";
import { getGrowthDashboardData } from "@/lib/growth-dashboard.functions";
import { getWebsiteConnectionStatus } from "@/lib/website-connections.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Growth overview — MentionMyApp" }] }),
  component: GrowthDashboard,
});

type Metric = { day: string; clicks: number | null; impressions: number | null };

function GrowthDashboard() {
  const [rangeDays, setRangeDays] = useState(90);
  const workspaceQuery = useQuery({
    queryKey: ["current-workspace"],
    queryFn: () => getCurrentWorkspace(),
  });
  const growthQuery = useQuery({
    queryKey: ["growth-dashboard"],
    queryFn: () => getGrowthDashboardData(),
  });
  const connectionQuery = useQuery({
    queryKey: ["website-connection-status"],
    queryFn: () => getWebsiteConnectionStatus(),
  });

  const growth = growthQuery.data;
  const metrics = growth?.metrics ?? [];
  const recent = metrics.slice(-rangeDays);
  const organicClicks = recent.reduce((sum, row) => sum + (row.clicks ?? 0), 0);
  const impressions = recent.reduce((sum, row) => sum + (row.impressions ?? 0), 0);
  const connected = Boolean(growth?.connected);
  const publishingConnected = Boolean(
    (connectionQuery.data?.delivery as Array<{ status?: string }> | undefined)?.some(
      (connection) => connection.status === "connected",
    ),
  );
  const websiteIdentified = Boolean(growth?.website);
  const auditReady = Boolean(growth?.workPlan?.audit);
  const displayName =
    workspaceQuery.data?.user.displayName?.trim() ||
    workspaceQuery.data?.user.email?.split("@")[0] ||
    "there";
  const firstName = displayName.split(/\s+/)[0];
  const rangeLabel = rangeDays === 488 ? "Last 16 months" : `Last ${rangeDays} days`;
  const format = (value: number) =>
    new Intl.NumberFormat("en-US", {
      notation: value >= 10_000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(value);

  const setupSteps = [
    {
      title: "Workspace created",
      detail: workspaceQuery.data?.workspace.name ?? "MentionMyApp workspace",
      complete: Boolean(workspaceQuery.data?.workspace),
      to: "/settings" as const,
    },
    {
      title: "Website identified",
      detail: growth?.website ?? "Add your website",
      complete: websiteIdentified,
      to: "/accounts" as const,
    },
    {
      title: "Search data connected",
      detail: growth?.propertyUrl ?? "Connect Search Console",
      complete: connected,
      to: "/accounts" as const,
    },
    {
      title: "Growth plan prepared",
      detail: auditReady
        ? `${growth!.workPlan!.audit!.passed} technical checks passing`
        : "Run your technical audit",
      complete: auditReady,
      to: "/seo-audit" as const,
    },
    {
      title: "Publishing connected",
      detail: publishingConnected ? "Ready to publish" : "Connect your website",
      complete: publishingConnected,
      to: "/accounts" as const,
    },
  ];
  const completedSteps = setupSteps.filter((step) => step.complete).length;

  return (
    <div className="mx-auto max-w-[1020px]">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-[-.025em] text-[#221f25]">
          Welcome {firstName}!
        </h1>
        <div
          className={`inline-flex h-[38px] items-center gap-2 rounded-full border px-3.5 text-sm shadow-sm ${
            connected
              ? "border-[#ccefdc] bg-[#fbfffc] text-[#315d45]"
              : "border-[#e4e2ff] bg-[#fdfcff] text-[#5a5688]"
          }`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${growthQuery.isFetching ? "animate-spin" : ""}`} />
          {connected ? "Live synced" : "Setup in progress"}
        </div>
      </header>

      <section className="rounded-2xl border border-[#e6e5e8] bg-white p-4 sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-[#201e23]">
              Your setup is almost complete!
            </h2>
            <p className="mt-1 text-xs text-[#85818b]">
              {completedSteps} of {setupSteps.length} steps complete
            </p>
          </div>
          <div className="h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-[#efeff2]">
            <div
              className="h-full rounded-full bg-[#6366e8] transition-[width] duration-700"
              style={{ width: `${(completedSteps / setupSteps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-5">
          {setupSteps.map((step, index) => (
            <Link
              key={step.title}
              to={step.to}
              className="group relative rounded-xl border border-transparent px-2.5 py-3 transition hover:border-[#e8e7eb] hover:bg-[#fafafa]"
            >
              {index < setupSteps.length - 1 && (
                <span className="absolute left-[calc(50%+17px)] top-[26px] hidden h-px w-[calc(100%-34px)] bg-[#e7e6e9] md:block" />
              )}
              <span
                className={`relative z-10 grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold ${
                  step.complete
                    ? "bg-[#202025] text-white"
                    : "border border-[#d9d7de] bg-white text-[#8c8992]"
                }`}
              >
                {step.complete ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
              </span>
              <strong className="mt-3 block text-xs font-semibold leading-5 text-[#302d34]">
                {step.title}
              </strong>
              <span className="mt-0.5 block truncate text-[10px] leading-4 text-[#8a8790]">
                {step.detail}
              </span>
            </Link>
          ))}
        </div>

        {!publishingConnected && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eeedf0] pt-4">
            <div className="flex items-center gap-2 text-xs text-[#77737e]">
              <PlatformDot label="WP" tone="#315d86" />
              <PlatformDot label="S" tone="#2f6f54" />
              <PlatformDot label="GH" tone="#27252b" />
              <span className="ml-1">WordPress, Shopify, GitHub and more</span>
            </div>
            <Link
              to="/accounts"
              className="inline-flex h-8 items-center gap-2 rounded-full bg-[#151318] px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-black"
            >
              <PlugZap className="h-3.5 w-3.5" /> Connect website
            </Link>
          </div>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-[#e6e5e8] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-semibold text-[#302d34]">
                Your organic growth
              </h2>
              <span
                className="grid h-4 w-4 place-items-center rounded-full border border-[#cac8ce] text-[9px] font-bold text-[#77737d]"
                title="All numbers come from your connected Search Console property."
              >
                i
              </span>
            </div>
            <p className="mt-1 text-xs text-[#8a8790]">
              Verified performance from your connected Google Search Console property.
            </p>
          </div>
          <select
            value={rangeDays}
            onChange={(event) => setRangeDays(Number(event.target.value))}
            className="rounded-full border border-[#e1e0e4] bg-white px-3 py-2 text-xs font-medium text-[#4a4650] outline-none focus:ring-2 focus:ring-[#d9d8ff]"
            aria-label="Reporting range"
          >
            <option value={28}>Last 28 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last 12 months</option>
            <option value={488}>Last 16 months</option>
          </select>
        </div>

        <div className="mt-5 grid border-y border-[#efeff1] sm:grid-cols-2">
          <MetricBlock
            icon={Search}
            label="Organic clicks"
            value={growthQuery.isLoading ? "…" : connected ? format(organicClicks) : "—"}
            detail={connected ? rangeLabel : "Connect Search Console"}
          />
          <MetricBlock
            icon={TrendingUp}
            label="Search impressions"
            value={growthQuery.isLoading ? "…" : connected ? format(impressions) : "—"}
            detail={connected ? rangeLabel : "No verified baseline yet"}
            bordered
          />
        </div>

        <PerformanceChart metrics={metrics} connected={connected} rangeDays={rangeDays} />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#85818b]">
          <span className="inline-flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-full bg-[#6366e8]" /> Search impressions
          </span>
          <span>
            {growth?.lastSyncedAt
              ? `Last synced ${new Date(growth.lastSyncedAt).toLocaleString()}`
              : "Sync begins after Search Console is connected"}
          </span>
        </div>
      </section>

      <div className="mt-5 space-y-3">
        <PhaseCard
          icon={ShieldCheck}
          iconTone="bg-[#edf6ee] text-[#39704b]"
          title="Foundation phase"
          subtitle="Build a measurable technical and search foundation"
        >
          <PhaseMilestone
            complete={connected}
            icon={Search}
            title="Search baseline"
            detail={
              connected
                ? `${format(growth?.baselineClicks ?? 0)} clicks and ${format(growth?.baselineImpressions ?? 0)} impressions saved at baseline`
                : "Connect Search Console to establish day one"
            }
            action={!connected ? <Link to="/accounts">Connect data →</Link> : undefined}
          />
          <PhaseMilestone
            complete={auditReady}
            icon={ShieldCheck}
            title="Technical audit"
            detail={
              auditReady
                ? `${growth!.workPlan!.audit!.passed} of ${growth!.workPlan!.audit!.passed + growth!.workPlan!.audit!.failed} checks passing`
                : "Crawl indexing, metadata, schema and internal links"
            }
            action={!auditReady ? <Link to="/seo-audit">Run audit →</Link> : undefined}
          />
          <PhaseMilestone
            complete={(growth?.workPlan?.pages.published ?? 0) > 0}
            icon={FileText}
            title="Indexable content"
            detail={`${growth?.workPlan?.pages.indexed ?? 0} of ${growth?.workPlan?.pages.published ?? 0} published pages indexed`}
          />
        </PhaseCard>

        <PhaseCard
          icon={Rocket}
          iconTone="bg-[#f2effc] text-[#6957a5]"
          title="Growth phase"
          subtitle="Publish useful content and earn verifiable authority"
        >
          <PhaseMilestone
            complete={(growth?.workPlan?.pages.published ?? 0) > 0}
            icon={FileText}
            title="Content production"
            detail={`${growth?.workPlan?.pages.published ?? 0} SEO pages published`}
            action={<Link to="/new-post">Create content →</Link>}
          />
          <PhaseMilestone
            complete={(growth?.backlinksLive ?? 0) > 0}
            icon={Link2}
            title="Authority building"
            detail={`${growth?.backlinksLive ?? 0} verified live backlinks`}
            action={<Link to="/backlinks">View backlinks →</Link>}
          />
          <PhaseMilestone
            complete={publishingConnected}
            icon={PlugZap}
            title="Website publishing"
            detail={
              publishingConnected
                ? "A delivery destination is connected"
                : "Connect a website before publishing"
            }
            action={
              !publishingConnected ? <Link to="/accounts">Connect website →</Link> : undefined
            }
          />
        </PhaseCard>

        <PhaseCard
          icon={Sparkles}
          iconTone="bg-[#fff1ec] text-[#a85c3d]"
          title="Scale phase"
          subtitle="Expand discoverability across search, answers and AI"
        >
          <PhaseMilestone
            complete={(growth?.aiMentions ?? 0) > 0}
            icon={Bot}
            title="AI visibility"
            detail={`${growth?.aiMentions ?? 0} successful checks mentioning your brand`}
          />
          <PhaseMilestone
            complete={(growth?.workPlan?.placements.live ?? 0) > 0}
            icon={Link2}
            title="Distribution"
            detail={`${growth?.workPlan?.placements.live ?? 0} of ${growth?.workPlan?.placements.queued ?? 0} tracked placements live`}
          />
          <PhaseMilestone
            complete={connected && publishingConnected}
            icon={TrendingUp}
            title="Closed-loop measurement"
            detail="Connect publishing output to verified search performance"
          />
        </PhaseCard>
      </div>
    </div>
  );
}

function PlatformDot({ label, tone }: { label: string; tone: string }) {
  return (
    <span
      className="grid h-6 min-w-6 place-items-center rounded-full border border-white px-1 text-[8px] font-bold text-white shadow-sm"
      style={{ background: tone }}
    >
      {label}
    </span>
  );
}

function MetricBlock({
  icon: Icon,
  label,
  value,
  detail,
  bordered = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 py-4 sm:px-5 ${bordered ? "border-t border-[#efeff1] sm:border-l sm:border-t-0" : ""}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f4f4f7] text-[#56525d]">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div>
        <div className="text-[11px] font-medium text-[#85818b]">{label}</div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <strong className="font-display text-2xl font-semibold tracking-[-.035em] text-[#211f25]">
            {value}
          </strong>
          <span className="text-[10px] text-[#96929b]">{detail}</span>
        </div>
      </div>
    </div>
  );
}

function PerformanceChart({
  metrics,
  connected,
  rangeDays,
}: {
  metrics: Metric[];
  connected: boolean;
  rangeDays: number;
}) {
  const width = 900;
  const height = 280;
  const left = 54;
  const right = 18;
  const top = 20;
  const bottom = 34;
  const points = metrics.slice(-rangeDays);
  const maxValue = Math.max(1, ...points.map((row) => row.impressions ?? 0));
  const roundedMax = niceMaximum(maxValue);
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const coordinates = points.map((row, index) => ({
    x: left + (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth),
    y: top + chartHeight - ((row.impressions ?? 0) / roundedMax) * chartHeight,
    day: row.day,
  }));
  const line = coordinates
    .map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  const area = line
    ? `${line} L${coordinates.at(-1)!.x.toFixed(1)} ${top + chartHeight} L${coordinates[0].x.toFixed(1)} ${top + chartHeight} Z`
    : "";
  const labels = coordinates.length
    ? [0, 0.25, 0.5, 0.75, 1].map(
        (ratio) =>
          coordinates[
            Math.min(coordinates.length - 1, Math.round((coordinates.length - 1) * ratio))
          ],
      )
    : [];

  return (
    <div className="relative mt-4 h-[300px] overflow-hidden rounded-xl bg-white">
      {points.length ? (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full"
          role="img"
          aria-label={`Search impressions during the selected ${rangeDays}-day range`}
        >
          <defs>
            <linearGradient id="visibility-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366e8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366e8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = top + chartHeight * ratio;
            const value = Math.round(roundedMax * (1 - ratio));
            return (
              <g key={ratio}>
                <line x1={left} x2={width - right} y1={y} y2={y} stroke="#eeeeF1" strokeWidth="1" />
                <text x={left - 10} y={y + 4} textAnchor="end" fill="#97939c" fontSize="10">
                  {formatAxis(value)}
                </text>
              </g>
            );
          })}
          <path d={area} fill="url(#visibility-area)" />
          <path
            d={line}
            fill="none"
            stroke="#6366e8"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {coordinates.at(-1) && (
            <>
              <line
                x1={coordinates.at(-1)!.x}
                x2={coordinates.at(-1)!.x}
                y1={top}
                y2={top + chartHeight}
                stroke="#a5a3ad"
                strokeDasharray="3 5"
              />
              <circle
                cx={coordinates.at(-1)!.x}
                cy={coordinates.at(-1)!.y}
                r="5"
                fill="white"
                stroke="#6366e8"
                strokeWidth="3"
              />
            </>
          )}
          {labels.map((point, index) => (
            <text
              key={`${point.day}-${index}`}
              x={point.x}
              y={height - 8}
              textAnchor={index === 0 ? "start" : index === labels.length - 1 ? "end" : "middle"}
              fill="#97939c"
              fontSize="10"
            >
              {new Date(`${point.day}T00:00:00`).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </text>
          ))}
        </svg>
      ) : (
        <div className="absolute inset-0 grid place-items-center border border-dashed border-[#dddce1] bg-[#fbfbfc] text-center">
          <div className="max-w-[320px] px-5">
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#efefff] text-[#5b5bd6]">
              {connected ? <TrendingUp className="h-4 w-4" /> : <PlugZap className="h-4 w-4" />}
            </span>
            <strong className="mt-3 block text-sm text-[#302d34]">
              {connected ? "Waiting for performance rows" : "Connect your search baseline"}
            </strong>
            <p className="mt-1 text-xs leading-5 text-[#85818b]">
              {connected
                ? "Search Console is connected; data will appear after the next successful sync."
                : "MentionMyApp only shows verified data from your own Search Console property."}
            </p>
            {!connected && (
              <Link
                to="/accounts"
                className="mt-3 inline-flex text-xs font-semibold text-[#5558d8]"
              >
                Connect Search Console →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseCard({
  icon: Icon,
  iconTone,
  title,
  subtitle,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  iconTone: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-[#e6e5e8] bg-white open:shadow-[0_8px_24px_rgba(16,24,40,.05)]">
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${iconTone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block font-display text-base font-semibold text-[#252229]">
            {title}
          </strong>
          <span className="mt-1 block text-xs text-[#88848e]">{subtitle}</span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-[#77737d] transition group-open:rotate-180" />
      </summary>
      <div className="grid gap-3 border-t border-[#efeff1] px-5 py-5 md:grid-cols-3 sm:px-6">
        {children}
      </div>
    </details>
  );
}

function PhaseMilestone({
  complete,
  icon: Icon,
  title,
  detail,
  action,
}: {
  complete: boolean;
  icon: ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#fafafa] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#5f5b65] shadow-sm">
          <Icon className="h-4 w-4" />
        </span>
        {complete ? (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#202025] text-white">
            <Check className="h-3 w-3" />
          </span>
        ) : (
          <Circle className="h-5 w-5 text-[#cfccd3]" />
        )}
      </div>
      <strong className="mt-3 block text-xs font-semibold text-[#302d34]">{title}</strong>
      <p className="mt-1 min-h-10 text-[11px] leading-5 text-[#85818b]">{detail}</p>
      {action && <div className="mt-2 text-[11px] font-semibold text-[#5558d8]">{action}</div>}
    </div>
  );
}

function niceMaximum(value: number) {
  if (value <= 10) return 10;
  const power = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / power) * power;
}

function formatAxis(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}
