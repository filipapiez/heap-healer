import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCurrentWorkspace } from "@/lib/workspace.functions";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { getEngagementStats } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Overview — SocialFlow" }] }),
  component: Overview,
});

function Overview() {
  const { data } = useQuery({ queryKey: ["current-workspace"], queryFn: () => getCurrentWorkspace() });
  const stats = useQuery({ queryKey: ["engagement"], queryFn: () => getEngagementStats() });
  const t = stats.data?.totals ?? { scheduled: 0, publishing: 0, published: 0, failed: 0, accounts: 0 };
  const cards = [
    { label: "Scheduled", value: t.scheduled },
    { label: "Publishing", value: t.publishing },
    { label: "Published", value: t.published },
    { label: "Connected accounts", value: t.accounts },
  ];
  return (
    <div>
      <PageHeader
        title={`Overview${data?.workspace ? ` — ${data.workspace.name}` : ""}`}
        actions={<Link to="/new-post" className="btn-primary">＋ New post</Link>}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="font-display text-3xl font-bold">{s.value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/50">{s.label}</div>
          </div>
        ))}
      </div>
      {t.published + t.scheduled + t.publishing === 0 && (
        <EmptyState
          title="No posts yet"
          body="Create your first post — upload a video, add your watermark, and publish everywhere at once."
        />
      )}
    </div>
  );
}