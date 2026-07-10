import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/scheduled")({
  head: () => ({ meta: [{ title: "Scheduled — SocialFlow" }] }),
  component: () => (
    <div>
      <PageHeader title="Scheduled posts" />
      <EmptyState title="Nothing scheduled" body="Set a date on the review step of a new post." />
    </div>
  ),
});