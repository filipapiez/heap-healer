import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — SocialFlow" }] }),
  component: () => (
    <div>
      <PageHeader title="Admin — configuration" />
      <EmptyState title="Config status" body="Zernio keys, webhook status, and provider capabilities land here in slice 2." />
    </div>
  ),
});