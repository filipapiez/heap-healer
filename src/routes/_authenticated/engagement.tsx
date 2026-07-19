import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CircleDashed,
  MessageCircleMore,
  Radio,
  Search,
  Settings2,
  Sparkles,
  Users,
} from "lucide-react";
import { getEngagementStats } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/engagement")({
  head: () => ({ meta: [{ title: "Reddit opportunities — MentionMyApp" }] }),
  component: RedditOpportunitiesPage,
});

function RedditOpportunitiesPage() {
  const engagementQuery = useQuery({
    queryKey: ["engagement"],
    queryFn: () => getEngagementStats(),
  });
  const totals = engagementQuery.data?.totals ?? {
    scheduled: 0,
    publishing: 0,
    published: 0,
    failed: 0,
    accounts: 0,
  };

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e4e3e7] bg-white px-4 py-3 text-xs text-[#85818b]">
        <span className="flex items-center gap-2">
          <CircleDashed className="h-3.5 w-3.5 text-[#96929b]" /> Reddit opportunity monitoring is
          not connected
        </span>
        <span className="rounded-full border border-[#e4e3e7] px-3 py-1.5 font-semibold text-[#65616b]">
          Reddit engine · Pending
        </span>
      </div>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-.03em] text-[#201d24]">
            Reddit opportunities
          </h1>
          <p className="mt-2 text-sm text-[#85818b]">
            Find relevant conversations before generating an authentic, reviewable response.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dfdde2] bg-white px-3 text-xs font-semibold text-[#77737e]"
            disabled
          >
            How it works
          </button>
          <Link
            to="/accounts"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dfdde2] bg-white px-3 text-xs font-semibold text-[#302d34] shadow-sm"
          >
            <Settings2 className="h-4 w-4" /> Connections
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <OpportunityMetric
          icon={MessageCircleMore}
          label="Opportunities"
          value="—"
          detail="Provider not connected"
        />
        <OpportunityMetric
          icon={Search}
          label="Monitored keywords"
          value="—"
          detail="No keywords tracked yet"
        />
        <OpportunityMetric
          icon={Users}
          label="Estimated reach"
          value="—"
          detail="Calculated from verified threads"
        />
      </section>

      <section className="mt-5 rounded-2xl border border-[#e4e3e7] bg-white p-6">
        <div className="flex gap-5 border-b border-[#e7e6ea] text-xs font-semibold">
          <span className="border-b-2 border-[#6366e8] px-2 pb-3 text-[#302d34]">Pending</span>
          <span className="px-2 pb-3 text-[#96929b]">Completed</span>
        </div>
        <div className="grid min-h-[300px] place-items-center text-center">
          <div className="max-w-md">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#efefff] text-[#5b5bd6]">
              <Radio className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-[#27242b]">
              Connect a Reddit discovery provider first
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#85818b]">
              MentionMyApp does not currently collect Reddit threads, votes or reach estimates. This
              state stays empty until a supported provider is connected—no sample opportunities are
              presented as real data.
            </p>
            <Link to="/accounts" className="mt-4 inline-flex text-sm font-semibold text-[#5558d8]">
              Review available connections →
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#e4e3e7] bg-white p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#6366e8]" />
          <h2 className="font-display text-base font-semibold text-[#302d34]">
            Your publishing activity
          </h2>
        </div>
        <p className="mt-1 text-xs text-[#85818b]">
          Real delivery data from MentionMyApp’s connected social accounts.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <PublishingMetric label="Connected accounts" value={totals.accounts} />
          <PublishingMetric label="Published" value={totals.published} />
          <PublishingMetric label="Scheduled" value={totals.scheduled} />
          <PublishingMetric label="Failed" value={totals.failed} warning={totals.failed > 0} />
        </div>

        {(engagementQuery.data?.byPlatform ?? []).length > 0 && (
          <div className="mt-5 overflow-hidden rounded-xl border border-[#e8e7eb]">
            {engagementQuery.data!.byPlatform.map((row) => (
              <div
                key={row.platform}
                className="flex items-center justify-between border-b border-[#efedf1] px-4 py-3 text-sm last:border-0"
              >
                <span className="font-medium capitalize text-[#302d34]">
                  {row.platform.replace("_", " ")}
                </span>
                <div className="flex gap-3 text-xs">
                  <span className="text-[#397355]">{row.published} published</span>
                  {row.failed > 0 && <span className="text-[#a54343]">{row.failed} failed</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OpportunityMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof MessageCircleMore;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-[#e4e3e7] bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-[#57535d]">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[#b1aeb6]" />
      </div>
      <strong className="mt-3 block font-display text-3xl font-semibold text-[#302d34]">
        {value}
      </strong>
      <p className="mt-2 text-[11px] text-[#96929b]">{detail}</p>
    </article>
  );
}

function PublishingMetric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[#fafafa] p-4">
      <BarChart3 className={`h-4 w-4 ${warning ? "text-[#c05b50]" : "text-[#77737e]"}`} />
      <strong className="mt-3 block font-display text-2xl font-semibold text-[#302d34]">
        {value}
      </strong>
      <span className="mt-1 block text-[11px] text-[#85818b]">{label}</span>
    </div>
  );
}
