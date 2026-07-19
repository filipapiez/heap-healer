import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  Check,
  CircleAlert,
  FileSearch,
  Gauge,
  RefreshCw,
  SearchCheck,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { getGrowthDashboardData } from "@/lib/growth-dashboard.functions";

export const Route = createFileRoute("/_authenticated/seo-audit")({
  head: () => ({ meta: [{ title: "Technical audit — MentionMyApp" }] }),
  component: TechnicalAuditPage,
});

function TechnicalAuditPage() {
  const growthQuery = useQuery({
    queryKey: ["growth-dashboard"],
    queryFn: () => getGrowthDashboardData(),
  });
  const growth = growthQuery.data;
  const audit = growth?.workPlan.audit;
  const totalChecks = audit ? audit.passed + audit.failed : 0;
  const healthScore = audit ? Math.round(Number(audit.score) * 10) : null;
  const passRate = audit ? Math.round((audit.passed / Math.max(1, totalChecks)) * 100) : 0;
  const state =
    healthScore == null
      ? "Not audited"
      : healthScore >= 85
        ? "Excellent"
        : healthScore >= 70
          ? "Good"
          : "Needs attention";

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dde4f3] bg-white px-4 py-3 text-xs text-[#71809b]">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#6366e8]" /> MentionMyApp checks issues that can
          block Google and AI crawlers
        </span>
        <span>
          {audit?.ranAt
            ? `Last audit ${new Date(audit.ranAt).toLocaleString()}`
            : "Run your first technical audit"}
        </span>
      </div>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-.03em] text-[#201d24]">
            Technical audit
          </h1>
          <p className="mt-2 text-sm text-[#85818b]">
            Identify technical, indexability, SEO, AEO and GEO issues on{" "}
            {growth?.website ?? "your website"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/analytics"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dfdde2] bg-white px-3 text-xs font-semibold text-[#302d34] shadow-sm"
          >
            <Share2 className="h-4 w-4" /> View analytics
          </Link>
          <Link
            to="/grow"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#18161b] px-3 text-xs font-semibold text-white shadow-sm"
          >
            <RefreshCw className="h-4 w-4" /> Run new audit
          </Link>
        </div>
      </header>

      {growthQuery.isLoading ? (
        <div className="grid min-h-[420px] place-items-center rounded-2xl border border-[#e4e3e7] bg-white text-sm text-[#85818b]">
          Loading the latest audit…
        </div>
      ) : audit && healthScore != null ? (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
            <article className="rounded-2xl border border-[#e4e3e7] bg-white p-5">
              <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.07em] text-[#57535d]">
                <Gauge className="h-4 w-4" /> Health score
              </div>
              <div className="grid items-center gap-6 sm:grid-cols-[190px_1fr]">
                <HealthGauge score={healthScore} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <AuditMetric label="Checks passing" value={audit.passed} tone="text-[#2f704c]" />
                  <AuditMetric label="Needs attention" value={audit.failed} tone="text-[#a85c3d]" />
                  <AuditMetric label="Pass rate" value={`${passRate}%`} tone="text-[#5558d8]" />
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-[#e4e3e7] bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-[.07em] text-[#57535d]">
                Latest run
              </div>
              <div className="mt-5 space-y-3">
                <AuditFact label="Website" value={growth?.website ?? "—"} />
                <AuditFact label="Overall state" value={state} />
                <AuditFact label="Checks performed" value={String(totalChecks)} />
                <AuditFact label="Completed" value={new Date(audit.ranAt).toLocaleDateString()} />
              </div>
            </article>
          </section>

          <section className="mt-5 rounded-2xl border border-[#e4e3e7] bg-white p-6">
            <div className="mx-auto max-w-[820px] text-center">
              <span
                className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${audit.failed === 0 ? "bg-[#e9f9ee] text-[#2f9d52]" : "bg-[#fff4e9] text-[#c4772b]"}`}
              >
                {audit.failed === 0 ? (
                  <Check className="h-8 w-8" />
                ) : (
                  <CircleAlert className="h-8 w-8" />
                )}
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-[#27242b]">
                {audit.failed === 0
                  ? "No technical issues found"
                  : `${audit.failed} checks need attention`}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#85818b]">
                The saved audit summary is fully verified. Run a fresh audit to view the current
                issue-by-issue remediation plan.
              </p>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-4">
              <CoverageCard
                icon={ShieldCheck}
                title="Technical SEO"
                detail="Hosts, HTTPS, speed and crawlability"
              />
              <CoverageCard
                icon={SearchCheck}
                title="Indexability"
                detail="Robots, sitemaps, canonicals and indexing"
              />
              <CoverageCard
                icon={FileSearch}
                title="On-page"
                detail="Titles, descriptions, headings and links"
              />
              <CoverageCard
                icon={Bot}
                title="AEO & GEO"
                detail="Schema, trust pages and AI discovery files"
              />
            </div>
          </section>
        </>
      ) : (
        <section className="grid min-h-[460px] place-items-center rounded-2xl border border-[#e4e3e7] bg-white p-8 text-center">
          <div className="max-w-md">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#efefff] text-[#5b5bd6]">
              <FileSearch className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-[#27242b]">
              Run your first technical audit
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#85818b]">
              MentionMyApp will crawl the public website and save a truthful score with the number
              of checks passing and failing.
            </p>
            <Link
              to="/grow"
              className="mt-5 inline-flex h-10 items-center rounded-full bg-[#18161b] px-5 text-sm font-semibold text-white"
            >
              Start audit
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function HealthGauge({ score }: { score: number }) {
  const hue = score >= 85 ? "#50b38a" : score >= 70 ? "#e7ad3c" : "#e46f61";
  return (
    <div
      className="relative mx-auto grid h-[170px] w-[170px] place-items-center rounded-full"
      style={{ background: `conic-gradient(${hue} ${score * 3.6}deg, #eeeeF1 0deg)` }}
    >
      <div className="grid h-[132px] w-[132px] place-items-center rounded-full bg-white text-center">
        <div>
          <strong className="font-display text-4xl font-semibold tracking-[-.05em] text-[#252229]">
            {score}
          </strong>
          <span className="text-sm text-[#9a969f]">/100</span>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[.08em] text-[#77737e]">
            Health score
          </div>
        </div>
      </div>
    </div>
  );
}

function AuditMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-[#ebe9ed] bg-[#fbfbfc] p-4">
      <div className="text-[10px] font-medium text-[#85818b]">{label}</div>
      <strong className={`mt-2 block font-display text-2xl font-semibold ${tone}`}>{value}</strong>
    </div>
  );
}

function AuditFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#efedf1] pb-3 text-xs last:border-0">
      <span className="text-[#85818b]">{label}</span>
      <strong className="max-w-[180px] truncate text-right text-[#302d34]">{value}</strong>
    </div>
  );
}

function CoverageCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof ShieldCheck;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-[#dcefe3] bg-[#f7fff9] p-4 text-left">
      <Icon className="h-5 w-5 text-[#3b8b59]" />
      <strong className="mt-3 block text-sm text-[#315c42]">{title}</strong>
      <p className="mt-1 text-[11px] leading-5 text-[#66816f]">{detail}</p>
    </div>
  );
}
