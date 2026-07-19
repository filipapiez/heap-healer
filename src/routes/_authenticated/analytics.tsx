import { createFileRoute } from "@tanstack/react-router";
import SeoDashboard from "@/components/SeoDashboard";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — MentionMyApp" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return <SeoDashboard />;
}
