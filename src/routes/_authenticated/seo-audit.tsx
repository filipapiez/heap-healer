import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Copy,
  ExternalLink,
  Github,
  Link2,
  RefreshCw,
  Search,
  Store,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { listAccounts, startConnect } from "@/lib/accounts.functions";
import { getEngagementStats } from "@/lib/engagement.functions";
import { runSeoAudit, type SeoAuditResult } from "@/lib/seo-audit.functions";

export const Route = createFileRoute("/_authenticated/seo-audit")({
  head: () => ({ meta: [{ title: "SEO Audit — MentionMyApp" }] }),
  component: SeoAudit,
});

function SeoAudit() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [gbpUrl, setGbpUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [connectError, setConnectError] = useState("");

  const accountsQ = useQuery({ queryKey: ["accounts"], queryFn: () => listAccounts() });
  const engagementQ = useQuery({ queryKey: ["engagement"], queryFn: () => getEngagementStats() });

  const googleAccounts = useMemo(
    () => (accountsQ.data?.accounts ?? []).filter((account) => account.platform === "google_business" && account.status === "connected"),
    [accountsQ.data],
  );

  const audit = useMutation({
    mutationFn: () => runSeoAudit({ data: { websiteUrl, githubUrl, gbpUrl } }),
    onSuccess: () => setCopied(false),
  });

  const connectGbp = useMutation({
    mutationFn: () => {
      setConnectError("");
      return startConnect({ data: { platform: "google_business", origin: window.location.origin } });
    },
    onSuccess: (result) => {
      window.location.href = result.url;
    },
    onError: (error) => {
      setConnectError(error instanceof Error ? error.message : String(error));
    },
  });

  const result = audit.data as SeoAuditResult | undefined;
  const canRun = websiteUrl.trim().length > 2 && !audit.isPending;

  async function copyReport() {
    if (!result?.copy) return;
    await navigator.clipboard.writeText(result.copy);
    setCopied(true);
  }

  return (
    <div className="max-w-7xl">
      <PageHeader
        title="SEO Audit"
        subtitle="Deep technical, content, AEO/GEO, GitHub, and Google Business checks in one place."
        actions={
          <button
            type="button"
            onClick={() => connectGbp.mutate()}
            disabled={connectGbp.isPending}
            className="btn-primary"
          >
            {connectGbp.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
            {googleAccounts.length ? "Connect another GBP" : "Connect GBP"}
          </button>
        }
      />

      {connectError && (
        <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{connectError}</div>
      )}

      <section className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,.8fr)]">
        <form
          className="card p-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (canRun) audit.mutate();
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Run a deep audit</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-700)]/60">
                Paste the site, optional GitHub repo, and GBP profile to create a fix list customers can understand.
              </p>
            </div>
            <div className="rounded-full bg-[var(--color-signal-500)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-signal-600)]">
              Server-side crawl
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label>
              <span className="label">Website URL</span>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-700)]/35" />
                <input
                  className="input pl-9"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(event.target.value)}
                />
              </div>
            </label>

            <label>
              <span className="label">GitHub URL</span>
              <div className="relative">
                <Github className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-700)]/35" />
                <input
                  className="input pl-9"
                  placeholder="https://github.com/company/repo"
                  value={githubUrl}
                  onChange={(event) => setGithubUrl(event.target.value)}
                />
              </div>
            </label>

            <label className="lg:col-span-2">
              <span className="label">Google Business Profile URL</span>
              <div className="relative">
                <Store className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--color-ink-700)]/35" />
                <input
                  className="input pl-9"
                  placeholder="https://maps.google.com/... or https://g.page/..."
                  value={gbpUrl}
                  onChange={(event) => setGbpUrl(event.target.value)}
                />
              </div>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary" disabled={!canRun}>
              {audit.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {audit.isPending ? "Auditing…" : "Run audit"}
            </button>
            {audit.error && (
              <div className="text-sm text-rose-700">
                {audit.error instanceof Error ? audit.error.message : String(audit.error)}
              </div>
            )}
          </div>
        </form>

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Google Business</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-700)]/60">
                Connect GBP to show local SEO proof next to the crawl.
              </p>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-semibold ${googleAccounts.length ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              {googleAccounts.length ? "Connected" : "Not connected"}
            </div>
          </div>

          {googleAccounts.length ? (
            <div className="space-y-2">
              {googleAccounts.slice(0, 3).map((account) => (
                <div key={account.id} className="flex items-center gap-3 rounded-xl border border-[var(--color-mist-200)] p-3">
                  {account.avatar_url ? (
                    <img src={account.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-mist-100)] font-semibold">G</div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{account.display_name || account.handle || "Google Business"}</div>
                    <div className="truncate text-xs text-[var(--color-ink-700)]/55">{account.handle || "Metrics sync ready"}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--color-mist-300)] p-4 text-sm text-[var(--color-ink-700)]/65">
              Customers can connect Google Business here. Until it is connected, profile views, calls, directions, reviews, and comments stay empty instead of being guessed.
            </div>
          )}
        </section>
      </section>

      <MetricGrid googleConnected={googleAccounts.length > 0} engagement={engagementQ.data} />

      {result ? (
        <AuditResult result={result} copied={copied} onCopy={copyReport} />
      ) : (
        <section className="card p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-signal-500)]/10 text-[var(--color-signal-600)]">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-semibold">Ready for a real SEO report</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-ink-700)]/60">
            Run the audit to see technical problems, indexability gaps, source/GitHub signals, GBP readiness, social content metrics, and a paste-ready fix list.
          </p>
        </section>
      )}
    </div>
  );
}

function MetricGrid({
  googleConnected,
  engagement,
}: {
  googleConnected: boolean;
  engagement?: Awaited<ReturnType<typeof getEngagementStats>>;
}) {
  const totals = engagement?.totals ?? { scheduled: 0, publishing: 0, published: 0, failed: 0, accounts: 0 };
  const googlePosts = engagement?.byPlatform?.find((row) => row.platform === "google_business")?.published ?? 0;
  const locked = googleConnected ? "Waiting for GBP sync" : "Connect GBP";
  const metrics = [
    { label: "Published posts", value: totals.published, note: "All platforms" },
    { label: "Scheduled posts", value: totals.scheduled, note: "Ready to publish" },
    { label: "Google posts", value: googlePosts, note: "GBP targets" },
    { label: "Connected accounts", value: totals.accounts, note: "Workspace" },
    { label: "GBP profile views", value: "—", note: locked },
    { label: "Website clicks", value: "—", note: locked },
    { label: "Calls", value: "—", note: locked },
    { label: "Direction requests", value: "—", note: locked },
    { label: "Reviews", value: "—", note: locked },
    { label: "Average rating", value: "—", note: locked },
    { label: "Comments / replies", value: "—", note: locked },
    { label: "Unanswered reviews", value: "—", note: locked },
  ];

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Posts, views, comments, and local signals
        </h2>
        <span className="text-xs text-[var(--color-ink-700)]/50">
          Live GBP metrics appear after provider sync
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="card p-4">
            <div className="font-display text-2xl font-bold">{metric.value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/50">
              {metric.label}
            </div>
            <div className="mt-2 text-xs text-[var(--color-ink-700)]/55">{metric.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AuditResult({ result, copied, onCopy }: { result: SeoAuditResult; copied: boolean; onCopy: () => void }) {
  const scoreColor =
    result.score >= 8 ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
    result.score >= 6 ? "text-amber-700 bg-amber-50 border-amber-100" :
    "text-rose-700 bg-rose-50 border-rose-100";

  return (
    <div className="space-y-6">
      <section className="card overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className={`border-b p-6 lg:border-b-0 lg:border-r ${scoreColor}`}>
            <div className="text-xs font-bold uppercase tracking-wide opacity-70">SEO score</div>
            <div className="mt-3 font-display text-6xl font-bold">{result.score}</div>
            <div className="mt-2 text-sm font-semibold">out of 10</div>
            <div className="mt-5 rounded-xl bg-white/70 p-3 text-sm">
              <div className="font-semibold">Estimated fix cost</div>
              <div>{result.cost}</div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">{result.baseUrl}</h2>
                <p className="mt-1 max-w-3xl text-sm text-[var(--color-ink-700)]/65">{result.tone}</p>
              </div>
              <button type="button" className="btn-ghost" onClick={onCopy}>
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy report"}
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MiniStat label="Good findings" value={result.good.length} tone="good" />
              <MiniStat label="Bad findings" value={result.issues.length} tone="bad" />
              <MiniStat label="Sitemap URLs" value={result.sitemapCount} tone="neutral" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <FindingsCard title="Good things" items={result.good} kind="good" />
        <FindingsCard title="Bad things" items={result.issues} kind="bad" />
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Deep categories
        </h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {result.categories.map((category) => (
            <div key={category.name} className="card p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-display text-base font-semibold">{category.name}</h3>
                <div className="flex gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">{category.good.length} good</span>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-800">{category.bad.length} bad</span>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SmallList items={category.good} empty="No positives in this section" kind="good" />
                <SmallList items={category.bad} empty="No issues in this section" kind="bad" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SourceCard result={result} />
        <RawSignalsCard result={result} />
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Paste-ready report</h2>
          <button type="button" className="btn-ghost" onClick={onCopy}>
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="max-h-[520px] overflow-auto rounded-xl border border-[var(--color-mist-200)] bg-[var(--color-mist-50)] p-4 text-sm leading-6 text-[var(--color-ink-800)] whitespace-pre-wrap">
          {result.copy}
        </pre>
      </section>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number | string; tone: "good" | "bad" | "neutral" }) {
  const colors = {
    good: "bg-emerald-50 text-emerald-800",
    bad: "bg-rose-50 text-rose-800",
    neutral: "bg-[var(--color-mist-100)] text-[var(--color-ink-800)]",
  };
  return (
    <div className={`rounded-xl p-4 ${colors[tone]}`}>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-70">{label}</div>
    </div>
  );
}

function FindingsCard({ title, items, kind }: { title: string; items: string[]; kind: "good" | "bad" }) {
  const Icon = kind === "good" ? CheckCircle2 : AlertTriangle;
  const color = kind === "good" ? "text-emerald-700" : "text-rose-700";
  return (
    <section className="card p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
        <Icon className={`h-5 w-5 ${color}`} />
        {title}
      </h2>
      <SmallList items={items.slice(0, 16)} empty="Nothing found" kind={kind} />
    </section>
  );
}

function SmallList({ items, empty, kind }: { items: string[]; empty: string; kind: "good" | "bad" }) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-ink-700)]/55">{empty}</p>;
  }
  return (
    <ul className="space-y-2 text-sm text-[var(--color-ink-800)]">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${kind === "good" ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SourceCard({ result }: { result: SeoAuditResult }) {
  return (
    <section className="card p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
        <Github className="h-5 w-5" />
        GitHub source indexing
      </h2>
      {result.github ? (
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--color-mist-200)] p-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{result.github.owner}/{result.github.repo}</div>
              <div className="truncate text-xs text-[var(--color-ink-700)]/55">{result.github.description || result.github.error || "No description"}</div>
            </div>
            <a href={result.github.url} target="_blank" rel="noreferrer" className="btn-ghost !px-2 !py-1">
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Stars" value={result.github.stars} tone="neutral" />
            <MiniStat label="Open issues" value={result.github.openIssues} tone={result.github.openIssues ? "bad" : "neutral"} />
          </div>
          <p className="text-xs text-[var(--color-ink-700)]/60">
            Public repos, READMEs, descriptions, and homepage links can reinforce entity/source signals when they point back to the audited site.
          </p>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-ink-700)]/60">
          Paste a GitHub URL before running the audit to check public source signals and README availability.
        </p>
      )}
    </section>
  );
}

function RawSignalsCard({ result }: { result: SeoAuditResult }) {
  const rows = [
    ["Title", result.home.title || "Missing"],
    ["Meta description", result.home.description || "Missing"],
    ["Canonical", result.home.canonical || "Missing"],
    ["H1", result.home.h1.join(" | ") || "Missing"],
    ["Word count", String(result.home.wordCount)],
    ["Internal links", String(result.home.internalLinks)],
    ["Schema", result.home.schemaTypes.join(", ") || "None"],
    ["GBP", result.gbp.message],
  ];
  return (
    <section className="card p-5">
      <h2 className="mb-3 font-display text-lg font-semibold">Raw signals</h2>
      <dl className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 rounded-lg border border-[var(--color-mist-200)] p-3 text-sm sm:grid-cols-[150px_minmax(0,1fr)]">
            <dt className="font-semibold text-[var(--color-ink-700)]/70">{label}</dt>
            <dd className="min-w-0 break-words text-[var(--color-ink-900)]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
