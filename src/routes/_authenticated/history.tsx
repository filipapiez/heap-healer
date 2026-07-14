import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { listPosts } from "@/lib/posts.functions";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — MentionMyApp" }] }),
  component: HistoryPage,
});

const STATUS_PILL: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800",
  partial: "bg-amber-100 text-amber-800",
  failed: "bg-rose-100 text-rose-800",
  cancelled: "bg-[var(--color-mist-100)] text-[var(--color-ink-700)]",
  action_required: "bg-amber-100 text-amber-800",
  publishing: "bg-sky-100 text-sky-800",
  scheduled: "bg-sky-100 text-sky-800",
  draft: "bg-[var(--color-mist-100)] text-[var(--color-ink-700)]",
};

type PostTarget = {
  platform: string | null;
  status: string | null;
  error_message: string | null;
};

function readableTargetError(platform: string | null, message: string) {
  if (/youtubeSignupRequired/i.test(message)) {
    return "YouTube: the connected Google account needs an active YouTube channel before uploads can be published.";
  }
  if (/Param text must be at most 500 characters/i.test(message)) {
    return "Threads: the caption was longer than Threads allows, so it was shortened for future posts. Retry this post.";
  }
  if (/integration guidelines|content-sharing-guidelines|unaudited_client/i.test(message)) {
    return "TikTok: Direct Post is blocked until TikTok approves this app for Content Posting API direct publishing.";
  }
  return `${platform ?? "Target"}: ${message}`;
}

function targetErrors(post: { post_targets?: PostTarget[] | null }) {
  return (post.post_targets ?? [])
    .filter((target) => target.status === "failed" && target.error_message)
    .map((target) => readableTargetError(target.platform, target.error_message ?? ""));
}

function HistoryPage() {
  const q = useQuery({ queryKey: ["posts", "all"], queryFn: () => listPosts({ data: { scope: "all" } }) });
  const items = q.data?.items ?? [];

  return (
    <div>
      <PageHeader title="Post history" subtitle="Every post you've published, scheduled, or that failed." />
      {q.isLoading ? (
        <div className="text-sm text-[var(--color-ink-700)]/60">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState title="No posts yet" body="Create your first post from the New Post page." />
      ) : (
        <ul className="space-y-2">
          {items.map((p) => {
            const errors = targetErrors(p);
            return (
              <li key={p.id} className="card flex items-start gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm">{p.caption || <span className="text-[var(--color-ink-700)]/50">(no caption)</span>}</div>
                  <div className="mt-1 text-xs text-[var(--color-ink-700)]/60">
                    {p.published_at ? `Published ${new Date(p.published_at).toLocaleString()}` :
                      p.scheduled_at ? `Scheduled ${new Date(p.scheduled_at).toLocaleString()}` :
                      `Created ${new Date(p.created_at).toLocaleString()}`}
                    {p.error_message && ` · ${p.error_message}`}
                  </div>
                  {errors.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-rose-700">
                      {errors.map((message) => <div key={message}>{message}</div>)}
                    </div>
                  )}
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_PILL[p.status] ?? "bg-[var(--color-mist-100)]"}`}>
                  {p.status}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}