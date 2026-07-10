import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { getAdminStatus } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — SocialFlow" }] }),
  component: AdminPage,
});

function AdminPage() {
  const q = useQuery({ queryKey: ["admin-status"], queryFn: () => getAdminStatus() });
  const s = q.data;

  return (
    <div>
      <PageHeader title="Admin" subtitle="Configuration and workspace health." />

      <section className="mb-6">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Integration
        </h2>
        <ul className="space-y-2">
          <StatusRow label="Zernio API credentials" ok={s?.zernioConfigured} />
          <StatusRow label="Webhook signing secret" ok={s?.webhookSecretConfigured} />
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Workspace at a glance
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div className="card p-5">
            <div className="font-display text-3xl font-bold">{s?.accountsByPlatform.reduce((n, r) => n + r.count, 0) ?? 0}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/50">Connected accounts</div>
          </div>
          <div className="card p-5">
            <div className="font-display text-3xl font-bold">{s?.scheduledCount ?? 0}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/50">Scheduled posts</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Accounts by platform
        </h2>
        {q.isLoading ? (
          <div className="text-sm text-[var(--color-ink-700)]/60">Loading…</div>
        ) : (s?.accountsByPlatform ?? []).length === 0 ? (
          <div className="text-sm text-[var(--color-ink-700)]/60">No accounts connected yet.</div>
        ) : (
          <ul className="space-y-2">
            {s!.accountsByPlatform.map((row) => (
              <li key={row.platform} className="card flex items-center justify-between p-3 text-sm">
                <span className="font-medium capitalize">{row.platform.replace("_", " ")}</span>
                <span className="text-[var(--color-ink-700)]/60">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatusRow({ label, ok }: { label: string; ok?: boolean }) {
  return (
    <li className="card flex items-center justify-between p-3 text-sm">
      <span>{label}</span>
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
        {ok ? "configured" : "missing"}
      </span>
    </li>
  );
}