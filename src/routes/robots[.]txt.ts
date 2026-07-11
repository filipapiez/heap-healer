import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/seo/pages";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`,
          {
            headers: {
              "content-type": "text/plain; charset=utf-8",
              "cache-control": "public, max-age=3600",
            },
          },
        ),
    },
  },
});
