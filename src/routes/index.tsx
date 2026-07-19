import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SEO Growth Workspace | Verified Reporting | MentionMyApp" },
      {
        name: "description",
        content:
          "Audit technical SEO, publish approved website changes, verify backlinks, and measure organic growth with Google Search Console.",
      },
      { property: "og:title", content: "MentionMyApp — verified SEO growth workflows" },
      {
        property: "og:description",
        content:
          "Technical audits, approved publishing, verified backlinks, and transparent Search Console reporting.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mentionmyapp.com/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://mentionmyapp.com/" }],
  }),
  component: LandingPage,
});
