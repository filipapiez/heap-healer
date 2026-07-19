import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, FileText, SearchCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getContentPlanData } from "@/lib/growth-dashboard.functions";
import {
  getWebsiteConnectionStatus,
  listWebsitePublishJobs,
  queueWebsitePage,
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
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
  connection: DeliveryConnection | null;
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
  const [page, setPage] = useState({
    connectionId: "",
    title: "",
    slug: "",
    excerpt: "",
    keyword: "",
    html: "",
    publishMode: "draft" as "draft" | "publish",
  });
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
      ["github", "wordpress", "shopify"].includes(connection.platform),
  ) as DeliveryConnection[];
  const selectedConnection = deliveryConnections.find(
    (connection) => connection.id === page.connectionId,
  );
  const queuePage = useMutation({
    mutationFn: () =>
      queueWebsitePage({
        data: {
          connectionId: page.connectionId,
          title: page.title,
          slug: page.slug,
          html: page.html,
          excerpt: page.excerpt || undefined,
          keyword: page.keyword || undefined,
          publishMode:
            selectedConnection?.platform === "github" ? "pull_request" : page.publishMode,
        },
      }),
    onSuccess: async ({ id, status, error_message: errorMessage }) => {
      if (status === "failed") {
        toast.error(errorMessage ?? "Website delivery failed");
      } else {
        toast.success(`Approved page delivered (${id.slice(0, 8)})`);
        setPage((current) => ({
          ...current,
          title: "",
          slug: "",
          excerpt: "",
          keyword: "",
          html: "",
        }));
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["website-publish-jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["seo-content-plan"] }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });
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
          <MetricPill value={pages.length} label="published" />
          <MetricPill value={pages.filter((page) => page.indexed).length} label="indexed" />
          <Link
            to="/grow"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#18161b] px-4 text-xs font-semibold text-white shadow-sm"
          >
            <SearchCheck className="h-4 w-4" /> Build growth plan
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-2xl border border-[#e4e3e7] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#302d34]">
                Send an approved page
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#85818b]">
                MentionMyApp sends exactly the HTML you approve. GitHub uses a review branch and
                pull request; WordPress and Shopify can save a draft or publish.
              </p>
            </div>
            <Link to="/accounts" className="text-xs font-semibold text-[#5b5bd6]">
              Manage connections →
            </Link>
          </div>
          {deliveryConnections.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold text-[#57535d]">
                Destination
                <select
                  value={page.connectionId}
                  onChange={(event) =>
                    setPage((current) => ({ ...current, connectionId: event.target.value }))
                  }
                  className="rounded-xl border border-[#dedde2] bg-white px-3 py-2.5 text-sm"
                >
                  <option value="">Choose a connection…</option>
                  {deliveryConnections.map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.platform} · {connection.display_name || connection.external_id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[#57535d]">
                Delivery mode
                {selectedConnection?.platform === "github" ? (
                  <input
                    value="Review branch + pull request"
                    disabled
                    className="rounded-xl border border-[#dedde2] bg-[#f7f7f8] px-3 py-2.5 text-sm"
                  />
                ) : (
                  <select
                    value={page.publishMode}
                    onChange={(event) =>
                      setPage((current) => ({
                        ...current,
                        publishMode: event.target.value as "draft" | "publish",
                      }))
                    }
                    className="rounded-xl border border-[#dedde2] bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="draft">Save as draft</option>
                    <option value="publish">Publish now</option>
                  </select>
                )}
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[#57535d]">
                Page title
                <input
                  value={page.title}
                  onChange={(event) =>
                    setPage((current) => ({ ...current, title: event.target.value }))
                  }
                  className="rounded-xl border border-[#dedde2] px-3 py-2.5 text-sm"
                  placeholder="Approved page title"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[#57535d]">
                URL slug
                <input
                  value={page.slug}
                  onChange={(event) =>
                    setPage((current) => ({
                      ...current,
                      slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    }))
                  }
                  className="rounded-xl border border-[#dedde2] px-3 py-2.5 text-sm"
                  placeholder="approved-page-slug"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[#57535d] sm:col-span-2">
                Excerpt (optional)
                <input
                  value={page.excerpt}
                  onChange={(event) =>
                    setPage((current) => ({ ...current, excerpt: event.target.value }))
                  }
                  className="rounded-xl border border-[#dedde2] px-3 py-2.5 text-sm"
                  placeholder="Short description"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[#57535d] sm:col-span-2">
                Target keyword (optional)
                <input
                  value={page.keyword}
                  onChange={(event) =>
                    setPage((current) => ({ ...current, keyword: event.target.value }))
                  }
                  className="rounded-xl border border-[#dedde2] px-3 py-2.5 text-sm"
                  placeholder="Primary query this page answers"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-[#57535d] sm:col-span-2">
                Approved HTML
                <textarea
                  value={page.html}
                  onChange={(event) =>
                    setPage((current) => ({ ...current, html: event.target.value }))
                  }
                  rows={8}
                  className="rounded-xl border border-[#dedde2] px-3 py-2.5 font-mono text-xs"
                  placeholder="<article>…approved page content…</article>"
                />
              </label>
              <button
                type="button"
                disabled={
                  queuePage.isPending ||
                  !page.connectionId ||
                  !page.title.trim() ||
                  !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug) ||
                  !page.html.trim()
                }
                onClick={() => queuePage.mutate()}
                className="rounded-xl bg-[#18161b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40 sm:col-span-2"
              >
                {queuePage.isPending ? "Queueing approved page…" : "Queue approved page"}
              </button>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-[#d8d7dc] p-5 text-sm text-[#77737e]">
              Connect WordPress, Shopify, or a GitHub delivery repository before queueing a page.
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
              ((jobsQuery.data?.jobs ?? []) as unknown as PublishJob[]).slice(0, 8).map((job) => (
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
                    {job.connection?.platform ?? "website"} · /{job.slug}
                  </p>
                  {job.external_url && (
                    <a
                      href={job.external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block font-semibold text-[#5b5bd6]"
                    >
                      Open result →
                    </a>
                  )}
                  {job.error_message && <p className="mt-1 text-red-700">{job.error_message}</p>}
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
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-[#d8d7dc] p-4 text-xs text-[#85818b]">
                No delivery jobs yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#e4e3e7] bg-white">
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
                return (
                  <div
                    key={day.toISOString()}
                    className="min-h-[122px] border-b border-r border-[#efedf1] p-2 last:border-r-0"
                  >
                    <span
                      className={`text-[11px] ${isSameMonth(day, month) ? "text-[#57535d]" : "text-[#bbb8bf]"}`}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="mt-2 space-y-1.5">
                      {dayPages.slice(0, 2).map((page) => (
                        <PageChip key={page.id} page={page} />
                      ))}
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
            {visiblePages.length === 0 && (
              <div className="hidden md:block">
                <EmptyMonth />
              </div>
            )}
          </>
        )}
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
  return (
    <a
      href={page.url}
      target="_blank"
      rel="noreferrer"
      className={`block rounded-lg border px-2.5 py-2 ${page.indexed ? "border-[#d9eddf] bg-[#f3fbf5]" : "border-[#e4e3e7] bg-[#fafafa]"}`}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#57535d]">
        <FileText className="h-3 w-3" /> {page.indexed ? "Indexed" : "Published"}
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
          Queue an approved page above. Published results appear here once delivery succeeds.
        </p>
      </div>
    </div>
  );
}
