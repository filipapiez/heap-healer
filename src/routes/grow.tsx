import { createFileRoute } from "@tanstack/react-router";
import SeoWizard from "@/components/SeoWizard";

export const Route = createFileRoute("/grow")({
  head: () => ({
    meta: [
      { title: "Start Your SEO Growth Plan | MentionMyApp" },
      {
        name: "description",
        content:
          "Tell us about your site and get a technical SEO, indexing, and organic growth plan.",
      },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://mentionmyapp.com/" }],
  }),
  component: SeoWizard,
});
