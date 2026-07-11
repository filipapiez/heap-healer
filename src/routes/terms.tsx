import { createFileRoute } from "@tanstack/react-router";

import { PublicInfoPage } from "@/components/PublicInfoPage";
import { getTrustPage, SITE_NAME, SITE_URL } from "@/legal/pages";

const page = getTrustPage("terms")!;

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `${page.title} - ${SITE_NAME}` },
      { name: "description", content: page.description },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}${page.path}` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}${page.path}` }],
  }),
  component: () => <PublicInfoPage page={page} />,
});
