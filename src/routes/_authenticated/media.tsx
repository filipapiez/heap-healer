import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/media")({
  head: () => ({ meta: [{ title: "Media library — SocialFlow" }] }),
  component: () => (
    <div>
      <PageHeader title="Media library" />
      <EmptyState title="No media yet" body="Uploads from the composer will land in this library. Coming in slice 3." />
    </div>
  ),
});