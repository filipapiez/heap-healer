import { createFileRoute } from "@tanstack/react-router";
import SeoWizard from "@/components/SeoWizard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SEO Growth Service | 90-Day Guarantee | MentionMyApp" },
      {
        name: "description",
        content:
          "We fix technical SEO and build indexable pages around real search demand. No measurable SEO growth in 90 days? Get every dollar back.",
      },
      { property: "og:title", content: "Fix your SEO — measurable growth in 90 days" },
      {
        property: "og:description",
        content:
          "Technical SEO fixes, new indexable pages, and transparent Search Console reporting — backed by a 90-day guarantee.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mentionmyapp.com/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://mentionmyapp.com/" }],
  }),
  component: SeoWizard,
});
