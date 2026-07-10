import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/new-post")({
  head: () => ({ meta: [{ title: "New post — SocialFlow" }] }),
  component: () => (
    <div>
      <PageHeader title="New post" />
      <EmptyState title="Composer coming in slice 3" body="Upload → watermark → compose → per-platform overrides → publish or schedule." />
    </div>
  ),
});