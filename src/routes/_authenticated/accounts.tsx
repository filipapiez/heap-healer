import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({ meta: [{ title: "Connected accounts — SocialFlow" }] }),
  component: () => (
    <div>
      <PageHeader title="Connected accounts" />
      <EmptyState title="Connect a platform" body="YouTube, X, Instagram, Facebook, Pinterest, LinkedIn, TikTok, Threads, Bluesky, Reddit, Google Business — all via Zernio. Wiring up in slice 2." />
    </div>
  ),
});