import { createFileRoute } from "@tanstack/react-router";
import { SEO_LAST_UPDATED, seoPages, SITE_URL } from "@/seo/pages";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = [
          { loc: SITE_URL, priority: "1.0" },
          { loc: `${SITE_URL}/resources`, priority: "0.9" },
          ...seoPages.map((page) => ({ loc: page.canonicalUrl, priority: "0.7" })),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${SEO_LAST_UPDATED}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
