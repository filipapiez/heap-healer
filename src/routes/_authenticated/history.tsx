import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — SocialFlow" }] }),
  component: () => (
    <div>
      <PageHeader title="Post history" />
      <EmptyState title="No posts yet" body="Every publish attempt lives here with per-platform status." />
    </div>
  ),
});