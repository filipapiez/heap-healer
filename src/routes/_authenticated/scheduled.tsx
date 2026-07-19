import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Sparkles,
} from "lucide-react";
import { listPosts, cancelScheduled } from "@/lib/posts.functions";

export const Route = createFileRoute("/_authenticated/scheduled")({
  head: () => ({ meta: [{ title: "Content plan — MentionMyApp" }] }),
  component: ContentPlanPage,
});

type PlannedPost = {
  id: string;
  caption: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
  post_targets?: Array<{ platform: string | null }> | null;
};

const STATUS_STYLE: Record<string, string> = {
  published: "bg-[#e9f8f0] text-[#2f704c]",
  partial: "bg-[#fff4dc] text-[#8a6418]",
  scheduled: "bg-[#efefff] text-[#5558d8]",
  publishing: "bg-[#eaf5ff] text-[#326b96]",
  failed: "bg-[#fff0f0] text-[#a54343]",
  cancelled: "bg-[#f0f0f2] text-[#77737e]",
  draft: "bg-[#f1f1f3] text-[#65616b]",
};

function ContentPlanPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const postsQuery = useQuery({
    queryKey: ["posts", "all"],
    queryFn: () => listPosts({ data: { scope: "all" } }),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => cancelScheduled({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const posts = useMemo(
    () => (postsQuery.data?.items ?? []) as PlannedPost[],
    [postsQuery.data?.items],
  );
  const published = posts.filter((post) => ["published", "partial"].includes(post.status)).length;
  const queued = posts.filter((post) =>
    ["scheduled", "draft", "publishing"].includes(post.status),
  ).length;
  const calendarStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const postsByDay = useMemo(() => {
    const grouped = new Map<string, PlannedPost[]>();
    for (const post of posts) {
      const date = post.scheduled_at || post.published_at || post.created_at;
      const key = format(new Date(date), "yyyy-MM-dd");
      grouped.set(key, [...(grouped.get(key) ?? []), post]);
    }
    return grouped;
  }, [posts]);
  const visibleAgenda = posts
    .filter((post) => {
      const date = post.scheduled_at || post.published_at || post.created_at;
      return isSameMonth(new Date(date), month);
    })
    .sort((a, b) =>
      (a.scheduled_at || a.published_at || a.created_at).localeCompare(
        b.scheduled_at || b.published_at || b.created_at,
      ),
    );

  return (
    <div className="mx-auto max-w-[1120px]">
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#dde4f3] bg-white px-4 py-3 text-xs text-[#71809b]">
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#6366e8]" /> Your publishing queue updates as posts
          are created and scheduled
        </span>
        <span className="hidden rounded-full border border-[#e5e4e8] px-3 py-1.5 font-semibold text-[#57535d] sm:inline-flex">
          Content engine · Live
        </span>
      </div>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-.03em] text-[#201d24]">
            Content plan
          </h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-[#85818b]">
            <span>Plan, schedule and review every MentionMyApp post.</span>
            <span className="rounded-full border border-[#d9eee3] bg-[#f8fffb] px-2 py-1 text-[#397355]">
              {published} published
            </span>
            <span className="rounded-full border border-[#ebe6bd] bg-[#fffef6] px-2 py-1 text-[#82712d]">
              {queued} queued
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/new-post"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dfdde2] bg-white px-3 text-xs font-semibold text-[#302d34] shadow-sm hover:bg-[#fafafa]"
          >
            <Plus className="h-4 w-4" /> Create content
          </Link>
          <div className="flex h-9 items-center rounded-lg border border-[#dfdde2] bg-white">
            <button
              onClick={() => setMonth((value) => subMonths(value, 1))}
              className="grid h-full w-9 place-items-center text-[#65616b] hover:bg-[#f7f7f8]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[88px] text-center text-xs font-semibold text-[#302d34]">
              {format(month, "MMM yyyy")}
            </span>
            <button
              onClick={() => setMonth((value) => addMonths(value, 1))}
              className="grid h-full w-9 place-items-center text-[#65616b] hover:bg-[#f7f7f8]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {postsQuery.isLoading ? (
        <div className="grid min-h-[420px] place-items-center rounded-2xl border border-[#e4e3e7] bg-white text-sm text-[#85818b]">
          Loading your content plan…
        </div>
      ) : (
        <>
          <section className="hidden overflow-hidden rounded-2xl border border-[#e4e3e7] bg-white md:block">
            <div className="grid grid-cols-7 border-b border-[#ecebef] bg-[#fbfbfc]">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[.08em] text-[#77737e]"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const dayPosts = postsByDay.get(key) ?? [];
                return (
                  <div
                    key={key}
                    className={`min-h-[150px] border-b border-r border-[#ecebef] p-3 ${isSameMonth(day, month) ? "bg-white" : "bg-[#fbfbfc]"}`}
                  >
                    <div
                      className={`text-xs ${
                        isSameDay(day, new Date())
                          ? "grid h-6 w-6 place-items-center rounded-full bg-[#f26b38] font-bold text-white"
                          : isSameMonth(day, month)
                            ? "text-[#57535d]"
                            : "text-[#c2bfc6]"
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {dayPosts.slice(0, 3).map((post) => (
                        <CalendarPost
                          key={post.id}
                          post={post}
                          onCancel={() => cancel.mutate(post.id)}
                        />
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="px-2 text-[10px] font-semibold text-[#77737e]">
                          +{dayPosts.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-3 md:hidden">
            {visibleAgenda.length ? (
              visibleAgenda.map((post) => (
                <article key={post.id} className="rounded-2xl border border-[#e4e3e7] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-[#85818b]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {format(
                          new Date(post.scheduled_at || post.published_at || post.created_at),
                          "EEE, MMM d · h:mm a",
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[#302d34]">
                        {post.caption || "Untitled post"}
                      </p>
                    </div>
                    <StatusPill status={post.status} />
                  </div>
                  {post.status === "scheduled" && (
                    <button
                      onClick={() =>
                        confirm("Cancel this scheduled post?") && cancel.mutate(post.id)
                      }
                      className="mt-3 text-xs font-semibold text-[#a54343]"
                    >
                      Cancel schedule
                    </button>
                  )}
                </article>
              ))
            ) : (
              <EmptyPlan />
            )}
          </section>

          {posts.length === 0 && (
            <div className="hidden md:block">
              <EmptyPlan />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CalendarPost({ post, onCancel }: { post: PlannedPost; onCancel: () => void }) {
  return (
    <div className="group rounded-lg border border-[#e9e8ec] bg-white px-2 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-1">
        <StatusPill status={post.status} compact />
        {post.status === "scheduled" && (
          <button
            onClick={() => confirm("Cancel this scheduled post?") && onCancel()}
            className="invisible text-[9px] text-[#a54343] group-hover:visible"
          >
            Cancel
          </button>
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-[10px] font-medium leading-4 text-[#3d3942]">
        {post.caption || "Untitled post"}
      </p>
      {(post.post_targets?.length ?? 0) > 0 && (
        <div className="mt-1 text-[9px] text-[#96929b]">
          {post
            .post_targets!.map((target) => target.platform)
            .filter(Boolean)
            .join(" · ")}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status, compact = false }: { status: string; compact?: boolean }) {
  const Icon = ["published", "partial"].includes(status) ? CheckCircle2 : Clock3;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold capitalize ${STATUS_STYLE[status] ?? STATUS_STYLE.draft} ${
        compact ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-1 text-[10px]"
      }`}
    >
      <Icon className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} /> {status.replace("_", " ")}
    </span>
  );
}

function EmptyPlan() {
  return (
    <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-[#dddbe1] bg-white p-8 text-center">
      <div>
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#efefff] text-[#5b5bd6]">
          <CalendarDays className="h-5 w-5" />
        </span>
        <strong className="mt-3 block text-sm text-[#302d34]">Your content plan is empty</strong>
        <p className="mt-1 text-xs text-[#85818b]">
          Create or schedule a post to place it on the calendar.
        </p>
        <Link to="/new-post" className="mt-3 inline-flex text-xs font-semibold text-[#5558d8]">
          Create content →
        </Link>
      </div>
    </div>
  );
}
