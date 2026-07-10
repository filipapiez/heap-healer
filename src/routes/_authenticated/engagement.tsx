import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/engagement")({
  head: () => ({ meta: [{ title: "Engagement — SocialFlow" }] }),
  component: () => (
    <div>
      <PageHeader title="Engagement" />
      <EmptyState title="No metrics yet" body="Overview, comments, and DMs across every connected account. Ships in slice 4." />
    </div>
  ),
});