import { createFileRoute } from "@tanstack/react-router";
import GrowthReport from "@/components/GrowthReport";

export const Route = createFileRoute("/report/$token")({
  head: () => ({ meta: [{ title: "SEO Growth Report — MentionMyApp" }] }),
  component: ReportPage,
});

function ReportPage() {
  const { token } = Route.useParams();
  return <GrowthReport token={token} />;
}
