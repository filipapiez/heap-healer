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
  publishing: "bg-sky-100 text-sky-800",
  scheduled: "bg-sky-100 text-sky-800",
  draft: "bg-[var(--color-mist-100)] text-[var(--color-ink-700)]",
};

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
          {items.map((p) => (
            <li key={p.id} className="card flex items-start gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm">{p.caption || <span className="text-[var(--color-ink-700)]/50">(no caption)</span>}</div>
                <div className="mt-1 text-xs text-[var(--color-ink-700)]/60">
                  {p.published_at ? `Published ${new Date(p.published_at).toLocaleString()}` :
                    p.scheduled_at ? `Scheduled ${new Date(p.scheduled_at).toLocaleString()}` :
                    `Created ${new Date(p.created_at).toLocaleString()}`}
                  {p.error_message && ` · ${p.error_message}`}
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_PILL[p.status] ?? "bg-[var(--color-mist-100)]"}`}>
                {p.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}