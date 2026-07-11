import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCurrentWorkspace } from "@/lib/workspace.functions";
import { PageHeader } from "@/components/PageHeader";
import { getEngagementStats } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Overview — MentionMyApp" }] }),
  component: Overview,
});

function Overview() {
  const { data } = useQuery({ queryKey: ["current-workspace"], queryFn: () => getCurrentWorkspace() });
  const stats = useQuery({ queryKey: ["engagement"], queryFn: () => getEngagementStats() });
  const t = stats.data?.totals ?? { scheduled: 0, publishing: 0, published: 0, failed: 0, accounts: 0 };
  const cards = [
    { label: "Scheduled", value: t.scheduled, to: "/scheduled" as const },
    { label: "Publishing", value: t.publishing, to: "/scheduled" as const },
    { label: "Published", value: t.published, to: "/history" as const },
    { label: "Connected accounts", value: t.accounts, to: "/accounts" as const },
  ];
  return (
    <div>
      <PageHeader
        title={`Overview${data?.workspace ? ` — ${data.workspace.name}` : ""}`}
        actions={<Link to="/new-post" className="btn-primary">＋ New post</Link>}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((s) => (
          <Link key={s.label} to={s.to}
            className="card p-5 block transition-colors hover:border-[var(--color-signal-500)]">
            <div className="font-display text-3xl" style={{ fontWeight: 800 }}>{s.value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/50">{s.label}</div>
          </Link>
        ))}
      </div>
      {t.published + t.scheduled + t.publishing === 0 && (
        <div className="card p-10 text-center">
          <h2 className="font-display text-lg font-semibold">No posts yet</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-700)]/60">
            Create your first post — upload a video, add your watermark, and publish everywhere at once.
          </p>
          <Link to="/new-post" className="btn-primary mt-6 inline-flex">Create your first post</Link>
        </div>
      )}
    </div>
  );
}