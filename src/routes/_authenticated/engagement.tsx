import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { getEngagementStats } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/engagement")({
  head: () => ({ meta: [{ title: "Engagement — MentionMyApp" }] }),
  component: EngagementPage,
});

function EngagementPage() {
  const q = useQuery({ queryKey: ["engagement"], queryFn: () => getEngagementStats() });
  const s = q.data;

  const totals = s?.totals ?? { scheduled: 0, publishing: 0, published: 0, failed: 0, accounts: 0 };
  const cards = [
    { label: "Connected accounts", value: totals.accounts },
    { label: "Published", value: totals.published },
    { label: "Scheduled", value: totals.scheduled },
    { label: "Failed", value: totals.failed },
  ];

  return (
    <div>
      <PageHeader title="Engagement" subtitle="How your posts are landing across every connected account." />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="font-display text-3xl font-bold">{c.value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/50">{c.label}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          By platform
        </h2>
        {q.isLoading ? (
          <div className="text-sm text-[var(--color-ink-700)]/60">Loading…</div>
        ) : (s?.byPlatform ?? []).length === 0 ? (
          <EmptyState title="No posts yet" body="Publish a post to see per-platform delivery here." />
        ) : (
          <ul className="space-y-2">
            {s!.byPlatform.map((row) => (
              <li key={row.platform} className="card flex items-center justify-between p-3">
                <div className="text-sm font-medium capitalize">{row.platform.replace("_", " ")}</div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">{row.published} published</span>
                  {row.failed > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-800">{row.failed} failed</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}