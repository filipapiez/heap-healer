import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { getCurrentWorkspace } from "@/lib/workspace.functions";
import { WatermarkSelector } from "@/components/WatermarkSelector";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — MentionMyApp" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data } = useQuery({ queryKey: ["current-workspace"], queryFn: () => getCurrentWorkspace() });
  return (
    <div>
      <PageHeader title="Settings" />
      <div className="space-y-4">
        <div className="card p-5">
          <div className="text-sm font-semibold">Workspace</div>
          <div className="mt-1 font-display text-lg">{data?.workspace.name ?? "—"}</div>
          <div className="text-xs text-[var(--color-ink-700)]/60">
            slug: {data?.workspace.slug ?? "—"} · your role: {data?.role ?? "—"}
          </div>
        </div>
        <WatermarkSelector />
        <div className="card p-5">
          <div className="text-sm font-semibold">Security</div>
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-ink-700)]/60">
            <li>· Social accounts connect via each platform's official authorization — we never store platform passwords.</li>
            <li>· Platform access tokens are held by the publishing provider, not in this app's database.</li>
            <li>· Media files are served through short-lived signed URLs.</li>
            <li>· Every publish attempt is logged with sanitized metadata for auditing.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}