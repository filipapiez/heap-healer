import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/seo-audit")({
  head: () => ({ meta: [{ title: "SEO Audit — MentionMyApp" }] }),
  component: SeoAudit,
});

function SeoAudit() {
  return (
    <div>
      <PageHeader title="SEO Audit" subtitle="Coming soon" />
      <div className="card p-10 text-center">
        <h2 className="font-display text-lg font-semibold">SEO audit coming soon</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-700)]/60">
          Paste a URL and get a scored report with fixes written for you.
        </p>
      </div>
    </div>
  );
}