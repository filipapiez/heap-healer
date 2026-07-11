import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { listPosts, cancelScheduled } from "@/lib/posts.functions";

export const Route = createFileRoute("/_authenticated/scheduled")({
  head: () => ({ meta: [{ title: "Scheduled — MentionMyApp" }] }),
  component: ScheduledPage,
});

function ScheduledPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["posts", "scheduled"],
    queryFn: () => listPosts({ data: { scope: "scheduled" } }),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => cancelScheduled({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });
  const items = q.data?.items ?? [];

  return (
    <div>
      <PageHeader title="Scheduled posts" subtitle="Waiting to publish at their scheduled time." />
      {q.isLoading ? (
        <div className="text-sm text-[var(--color-ink-700)]/60">Loading…</div>
      ) : items.length === 0 ? (
        <EmptyState title="Nothing scheduled" body="Pick a date on the composer to schedule a post." />
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id} className="card flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p.caption || "(no caption)"}</div>
                <div className="text-xs text-[var(--color-ink-700)]/60">
                  {p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : ""}
                </div>
              </div>
              <button
                onClick={() => confirm("Cancel this scheduled post?") && cancel.mutate(p.id)}
                className="btn-ghost !py-1 !text-xs"
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}