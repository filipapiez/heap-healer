import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isAfter,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, FileText, SearchCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { checkMyPagesLive, getContentPlanData } from "@/lib/growth-dashboard.functions";
import {
  getWebsiteConnectionStatus,
  listWebsitePublishJobs,
  retryWebsitePublishJob,
} from "@/lib/website-connections.functions";
import { WEBSITE_CONNECTION_QUERY_KEY } from "@/connection-status";

export const Route = createFileRoute("/_authenticated/scheduled")({
  head: () => ({ meta: [{ title: "Content plan — MentionMyApp" }] }),
  component: ContentPlanPage,
});

type SeoPage = {
  id: string;
  url: string;
  keyword: string | null;
  indexed: boolean;
  impressions: number;
  clicks: number;
  published_at: string;
  live_status: string;
  live_reason: string | null;
  live_host: string | null;
  live_checked_at: string | null;
};

type DeliveryConnection = {
  id: string;
  platform: "github" | "wordpress" | "shopify";
  external_id: string;
  display_name: string | null;
  status: string;
};

type PublishJob = {
  id: string;
  title: string;
  slug: string;
  publish_mode: string;
  status: string;
  external_url: string | null;
  external_id: string | null;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
  metadata: Record<string, unknown> | null;
  connection: DeliveryConnection | null;
  generated: {
    id: string;
    primary_keyword: string | null;
    seo_score: number | null;
    canonical_url: string | null;
    published_at: string | null;
    github_commit_sha: string | null;
    failure_stage: string | null;
  } | null;
};

function pageLabel(page: SeoPage) {
  if (page.keyword) return page.keyword;
  try {
    return new URL(page.url).pathname.replace(/\//g, " ").trim() || page.url;
  } catch {
    return page.url;
  }
}

function ContentPlanPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const planQuery = useQuery({
    queryKey: ["seo-content-plan"],
    queryFn: () => getContentPlanData(),
  });
  const connectionQuery = useQuery({
    queryKey: WEBSITE_CONNECTION_QUERY_KEY,
    queryFn: () => getWebsiteConnectionStatus(),
  });
  const jobsQuery = useQuery({
    queryKey: ["website-publish-jobs"],
    queryFn: () => listWebsitePublishJobs(),
  });
  const allDeliveryConnections = (connectionQuery.data?.delivery ??
    []) as unknown as DeliveryConnection[];
  const deliveryConnections = allDeliveryConnections.filter(
    (connection) =>
      connection.status === "connected" &&
      // Only GitHub repositories are processed by the automatic daily writer.
      connection.platform === "github",
  ) as DeliveryConnection[];
  const retryJob = useMutation({
    mutationFn: (jobId: string) => retryWebsitePublishJob({ data: { jobId } }),
    onSuccess: async (result) => {
      if (result.status === "failed") toast.error(result.error_message ?? "Delivery failed again");
      else toast.success("Delivery completed");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["website-publish-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["seo-content-plan"] }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const pages = useMemo(() => planQuery.data?.items ?? [], [planQuery.data?.items]);
  // Automatically re-check any page not yet confirmed live, once per visit.
  const liveChecked = useRef(false);
  useEffect(() => {
    if (liveChecked.current || !pages.some((p) => p.live_status !== "live")) return;
    liveChecked.current = true;
    checkMyPagesLive()
      .then(() => queryClient.invalidateQueries({ queryKey: ["seo-content-plan"] }))
      .catch(() => undefined);
  }, [pages, queryClient]);
  const waitingLovable = pages.filter((p) => p.live_status === "waiting_publish").length;
  const calendarStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const visiblePages = pages.filter((page) => isSameMonth(new Date(page.published_at), month));

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e4e3e7] bg-white px-4 py-3 text-xs text-[#85818b]">
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#6366e8]" /> Only successful website publications
          appear here; page metrics attach after Search Console returns evidence.
        </span>
        <span className="rounded-full border border-[#e4e3e7] px-3 py-1.5 font-semibold text-[#65616b]">
          SEO content · Website only
        </span>
      </div>

      {waitingLovable > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>{waitingLovable} page{waitingLovable > 1 ? "s are" : " is"} saved but not live yet.</strong>{" "}
          This site is built with Lovable, which only goes live after the project is re-published.
          Open the project in Lovable and click <strong>Publish → Update</strong>. We re-check
          automatically and mark each page Live as soon as it loads.
        </div>
      )}

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-.03em] text-[#201d24]">
            Content plan
          </h1>
          <p className="mt-2 text-sm text-[#85818b]">
            Published and indexed SEO pages for {planQuery.data?.website ?? "your website"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MetricPill value={pages.filter((p) => p.live_status === "live").length} label="live" />
          <MetricPill value={pages.filter((page) => page.indexed).length} label="indexed" />
          <Link
            to="/grow"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#18161b] px-4 text-xs font-semibold text-white shadow-sm"
          >
            <SearchCheck className="h-4 w-4" /> Build growth plan
          </Link>
        </div>
      </header>

      <section className="overflow-hidden mb-6 rounded-2xl border border-[#e4e3e7] bg-white">
        <div className="flex items-center justify-between border-b border-[#e7e6ea] px-4 py-3">
          <button
            type="button"
            onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1))}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#e4e3e7] text-[#65616b]"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <strong className="font-display text-sm font-semibold text-[#302d34]">
            {format(month, "MMMM yyyy")}
          </strong>
          <button
            type="button"
            onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1))}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#e4e3e7] text-[#65616b]"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-b border-[#e7e6ea] px-4 py-2.5 text-[11px] text-[#65616b]">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Indexed on Google</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#a09ca8]" /> Published, waiting for Google</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border border-dashed border-[#6366e8] bg-[#eef0ff]" /> Scheduled</span>
        </div>
        {planQuery.isLoading ? (
          <div className="grid min-h-[420px] place-items-center text-sm text-[#85818b]">
            Loading website content…
          </div>
        ) : planQuery.error ? (
          <div className="grid min-h-[420px] place-items-center p-8 text-center text-sm text-[#a54343]">
            The website content plan could not load.
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-7 border-b border-[#eceaed] text-center text-[10px] font-semibold uppercase tracking-[.06em] text-[#77737e] md:grid">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="px-2 py-3">
                  {day}
                </div>
              ))}
            </div>
            <div className="hidden grid-cols-7 md:grid">
              {days.map((day) => {
                const dayPages = pages.filter((page) =>
                  isSameDay(new Date(page.published_at), day),
                );
                const today = startOfDay(new Date());
                const isToday = isSameDay(day, today);
                const scheduled =
                  deliveryConnections.length > 0 &&
                  (isAfter(day, today) || (isToday && dayPages.length === 0));
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[122px] border-b border-r border-[#efedf1] p-2 last:border-r-0 ${isToday ? "bg-[#f7f7ff]" : ""}`}
                  >
                    <span
                      className={`text-[11px] ${isToday ? "rounded-full bg-[#6366e8] px-1.5 py-0.5 font-semibold text-white" : isSameMonth(day, month) ? "text-[#57535d]" : "text-[#bbb8bf]"}`}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="mt-2 space-y-1.5">
                      {dayPages.slice(0, 2).map((page) => (
                        <PageChip key={page.id} page={page} />
                      ))}
                      {scheduled && (
                        <div className="rounded-lg border border-dashed border-[#c7c9f5] bg-[#f5f6ff] px-2.5 py-2">
                          <span className="text-[10px] font-semibold text-[#5b5bd6]">Scheduled</span>
                          <strong className="mt-1 block truncate text-[10px] text-[#302d34]">
                            {deliveryConnections.length} new page{deliveryConnections.length > 1 ? "s" : ""}
                          </strong>
                        </div>
                      )}
                      {dayPages.length > 2 && (
                        <span className="text-[10px] text-[#85818b]">
                          +{dayPages.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="divide-y divide-[#efedf1] md:hidden">
              {visiblePages.length ? (
                visiblePages.map((page) => (
                  <div key={page.id} className="p-4">
                    <PageChip page={page} expanded />
                  </div>
                ))
              ) : (
                <EmptyMonth />
              )}
            </div>
            {visiblePages.length === 0 && !deliveryConnections.length && (
              <div className="hidden md:block">
                <EmptyMonth />
              </div>
            )}
          </>
        )}
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-2xl border border-[#e4e3e7] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#302d34]">
                Automatic daily publishing
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#85818b]">
                MentionMyApp writes one new SEO page per day for each connected website, checks its
                quality, and publishes it for you. Nothing to approve by hand.
              </p>
            </div>
            <Link to="/accounts" className="text-xs font-semibold text-[#5b5bd6]">
              Manage connections →
            </Link>
          </div>
          {deliveryConnections.length ? (
            <div className="mt-4 grid gap-2">
              {deliveryConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#ebeaf0] px-3 py-3 text-sm"
                >
                  <span className="min-w-0 truncate text-[#302d34]">
                    {connection.display_name || connection.external_id}
                    <span className="ml-2 text-xs text-[#a09ca8]">{connection.platform}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    publishing daily
                  </span>
                </div>
              ))}
              <p className="mt-1 text-xs text-[#85818b]">
                Next page is scheduled automatically — new pages appear in the calendar and delivery
                list below.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-[#d8d7dc] p-5 text-sm text-[#77737e]">
              Connect WordPress, Shopify, or a GitHub repository so daily pages can be published.
            </div>
          )}
        </div>


        <div className="rounded-2xl border border-[#e4e3e7] bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-[#302d34]">
            Recent delivery jobs
          </h2>
          <div className="mt-4 space-y-2">
            {jobsQuery.isLoading ? (
              <p className="text-xs text-[#85818b]">Loading jobs…</p>
            ) : ((jobsQuery.data?.jobs ?? []) as unknown as PublishJob[]).length ? (
              ((jobsQuery.data?.jobs ?? []) as unknown as PublishJob[]).slice(0, 8).map((job) => {
                const keyword =
                  job.generated?.primary_keyword ??
                  (typeof job.metadata?.keyword === "string" ? job.metadata.keyword : null);
                const pageUrl =
                  job.generated?.canonical_url ??
                  (typeof job.metadata?.canonical_url === "string"
                    ? job.metadata.canonical_url
                    : job.external_url);
                const score =
                  job.generated?.seo_score ??
                  (typeof job.metadata?.seo_score === "number" ? job.metadata.seo_score : null);
                const commitSha = job.generated?.github_commit_sha ?? job.external_id;
                return (
                <div key={job.id} className="rounded-xl border border-[#ebeaf0] p-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="min-w-0 truncate text-[#302d34]">{job.title}</strong>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 font-semibold ${job.status === "published" ? "bg-emerald-50 text-emerald-700" : job.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
                    >
                      {job.status === "published" && job.publish_mode === "pull_request"
                        ? "review ready"
                        : job.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[#85818b]">
                    {job.connection?.platform ?? "website"} ·{" "}
                    {job.connection?.display_name || job.connection?.external_id || "site"} · /
                    {job.slug}
                  </p>
                  {keyword && <p className="mt-1 truncate text-[#85818b]">Keyword: {keyword}</p>}
                  <p className="mt-1 text-[#a09ca8]">
                    Generated {format(new Date(job.created_at), "MMM d, HH:mm")}
                    {job.processed_at
                      ? ` · Published ${format(new Date(job.processed_at), "MMM d, HH:mm")}`
                      : ""}
                    {typeof score === "number" ? ` · SEO ${score}/100` : ""}
                  </p>
                  {commitSha && (
                    <p className="mt-1 font-mono text-[10px] text-[#a09ca8]">
                      commit {commitSha.slice(0, 10)}
                    </p>
                  )}
                  {pageUrl && (
                    <a
                      href={pageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block font-semibold text-[#5b5bd6]"
                    >
                      Open page →
                    </a>
                  )}
                  {(job.error_message || job.generated?.failure_stage) && (
                    <p className="mt-1 text-red-700">
                      {job.generated?.failure_stage ? `${job.generated.failure_stage}: ` : ""}
                      {job.error_message ?? "Delivery failed"}
                    </p>
                  )}
                  {job.status === "failed" && (
                    <button
                      type="button"
                      disabled={retryJob.isPending}
                      onClick={() => retryJob.mutate(job.id)}
                      className="mt-2 font-semibold text-[#5b5bd6] disabled:opacity-40"
                    >
                      Retry delivery
                    </button>
                  )}
                </div>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-[#d8d7dc] p-4 text-xs text-[#85818b]">
                No delivery jobs yet.
              </p>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

function MetricPill({ value, label }: { value: number; label: string }) {
  return (
    <span className="rounded-full border border-[#e4e3e7] bg-white px-3 py-2 text-xs text-[#57535d]">
      <strong>{value}</strong> {label}
    </span>
  );
}

function PageChip({ page, expanded = false }: { page: SeoPage; expanded?: boolean }) {
  const live = page.live_status === "live";
  const label = page.indexed
    ? "Indexed"
    : live
      ? "Live"
      : page.live_status === "waiting_publish"
        ? "Waiting for Lovable publish"
        : page.live_status === "not_live"
          ? "Not live yet"
          : "Checking…";
  const tone = page.indexed || live
    ? "border-[#d9eddf] bg-[#f3fbf5]"
    : page.live_status === "checking"
      ? "border-[#e4e3e7] bg-[#fafafa]"
      : "border-amber-200 bg-amber-50";
  return (
    <a
      href={page.url}
      target="_blank"
      rel="noreferrer"
      title={page.live_reason ?? undefined}
      className={`block rounded-lg border px-2.5 py-2 ${tone}`}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#57535d]">
        <FileText className="h-3 w-3" /> {label}
      </span>
      <strong
        className={`mt-1 block truncate text-[#302d34] ${expanded ? "text-sm" : "text-[10px]"}`}
      >
        {pageLabel(page)}
      </strong>
      {expanded && (
        <span className="mt-1 block text-xs text-[#85818b]">
          {format(new Date(page.published_at), "MMM d")} · {page.impressions} impressions ·{" "}
          {page.clicks} clicks
        </span>
      )}
    </a>
  );
}

function EmptyMonth() {
  return (
    <div className="grid min-h-[180px] place-items-center p-8 text-center">
      <div>
        <FileText className="mx-auto h-6 w-6 text-[#aaa7af]" />
        <strong className="mt-3 block font-display text-base font-semibold text-[#302d34]">
          No website pages published this month
        </strong>
        <p className="mt-1 text-xs text-[#85818b]">
          New pages appear here automatically once they go live.
        </p>
      </div>
    </div>
  );
}
