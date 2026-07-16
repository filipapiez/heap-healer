import { createFileRoute } from "@tanstack/react-router";
import SeoDashboard from "@/components/SeoDashboard";

export const Route = createFileRoute("/_authenticated/seo-audit")({
  head: () => ({ meta: [{ title: "SEO Growth — MentionMyApp" }] }),
  component: SeoDashboard,
});
