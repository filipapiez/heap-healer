// Detects how a connected repository builds pages, and renders a generated page
// into that repository's native file format.
import type { GeneratedPage } from "@/lib/page-content";
import { escapeHtml, renderPageHtml, renderPageMarkdown } from "@/lib/page-content";

export type PublishingConfig = {
  framework:
    | "next-app"
    | "next-pages"
    | "astro"
    | "tanstack-start"
    | "react-router"
    | "markdown"
    | "static-html";
  publish_path: string;
  content_format: "tsx" | "astro" | "mdx" | "md" | "html";
  router_type: "file-based" | "content-collection" | "static";
  sitemap_path: string | null;
};

function has(files: string[], prefix: string) {
  return files.some((file) => file === prefix || file.startsWith(`${prefix}/`));
}

export function detectPublishingConfig(files: string[]): PublishingConfig {
  const sitemap =
    files.find((file) => /(^|\/)sitemap\.xml$/.test(file)) ??
    files.find((file) => /sitemap.*\.(ts|js|mjs)$/.test(file)) ??
    null;

  const contentDir = ["content/blog", "content/pages", "content", "blog", "posts", "src/content"].find(
    (dir) => has(files, dir),
  );
  const markdownFirst =
    Boolean(contentDir) && files.some((file) => file.startsWith(`${contentDir}/`) && /\.mdx?$/.test(file));

  if (files.some((file) => /^next\.config\./.test(file))) {
    if (has(files, "src/app") || has(files, "app")) {
      const base = has(files, "src/app") ? "src/app" : "app";
      return {
        framework: "next-app",
        publish_path: `${base}/{slug}/page.tsx`,
        content_format: "tsx",
        router_type: "file-based",
        sitemap_path: sitemap,
      };
    }
    const base = has(files, "src/pages") ? "src/pages" : "pages";
    return {
      framework: "next-pages",
      publish_path: `${base}/{slug}.tsx`,
      content_format: "tsx",
      router_type: "file-based",
      sitemap_path: sitemap,
    };
  }

  if (files.some((file) => /^astro\.config\./.test(file))) {
    return {
      framework: "astro",
      publish_path: "src/pages/{slug}.astro",
      content_format: "astro",
      router_type: "file-based",
      sitemap_path: sitemap,
    };
  }

  if (markdownFirst && contentDir) {
    const mdx = files.some((file) => file.startsWith(`${contentDir}/`) && file.endsWith(".mdx"));
    return {
      framework: "markdown",
      publish_path: `${contentDir}/{slug}.${mdx ? "mdx" : "md"}`,
      content_format: mdx ? "mdx" : "md",
      router_type: "content-collection",
      sitemap_path: sitemap,
    };
  }

  if (has(files, "src/routes")) {
    return {
      framework: "tanstack-start",
      publish_path: "src/routes/{slug}.tsx",
      content_format: "tsx",
      router_type: "file-based",
      sitemap_path: sitemap,
    };
  }

  if (has(files, "src/pages")) {
    return {
      framework: "react-router",
      publish_path: "src/pages/{slug}.tsx",
      content_format: "tsx",
      router_type: "file-based",
      sitemap_path: sitemap,
    };
  }

  return {
    framework: "static-html",
    publish_path: "{slug}.html",
    content_format: "html",
    router_type: "static",
    sitemap_path: sitemap,
  };
}

export function resolvePagePath(config: PublishingConfig, slug: string) {
  return config.publish_path.replace("{slug}", slug);
}

function componentName(slug: string) {
  const name = slug
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  return /^[A-Za-z]/.test(name) ? `${name}Page` : `Page${name}`;
}

function frontmatter(page: GeneratedPage) {
  const escape = (value: string) => value.replace(/"/g, '\\"');
  return [
    "---",
    `title: "${escape(page.seoTitle)}"`,
    `description: "${escape(page.metaDescription)}"`,
    `slug: "${page.slug}"`,
    `canonical: "${page.canonicalUrl}"`,
    `date: "${new Date().toISOString().slice(0, 10)}"`,
    "robots: \"index,follow\"",
    "---",
    "",
  ].join("\n");
}

/** Renders the generated page into the file body the customer's repo expects. */
export function renderPageFile(config: PublishingConfig, page: GeneratedPage): string {
  const body = renderPageHtml(page);
  const jsonLd = JSON.stringify(page.structuredData);

  if (config.content_format === "md" || config.content_format === "mdx") {
    return `${frontmatter(page)}${renderPageMarkdown(page)}\n`;
  }

  if (config.content_format === "astro") {
    return `---
const canonical = "${page.canonicalUrl}";
const jsonLd = ${jsonLd};
---
<html lang="en">
  <head>
    <title>${escapeHtml(page.seoTitle)}</title>
    <meta name="description" content="${escapeHtml(page.metaDescription)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href={canonical} />
    <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
  </head>
  <body>
${body}
  </body>
</html>
`;
  }

  if (config.content_format === "html") {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(page.seoTitle)}</title>
    <meta name="description" content="${escapeHtml(page.metaDescription)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${page.canonicalUrl}" />
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body>
${body}
  </body>
</html>
`;
  }

  const name = componentName(page.slug);
  const html = body.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

  if (config.framework === "next-app") {
    return `import type { Metadata } from "next";

export const metadata: Metadata = {
  title: ${JSON.stringify(page.seoTitle)},
  description: ${JSON.stringify(page.metaDescription)},
  alternates: { canonical: ${JSON.stringify(page.canonicalUrl)} },
  robots: { index: true, follow: true },
};

const jsonLd = ${jsonLd};

export default function ${name}() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: \`${html}\` }} />
    </>
  );
}
`;
  }

  if (config.framework === "tanstack-start") {
    return `import { createFileRoute } from "@tanstack/react-router";

const jsonLd = ${jsonLd};

export const Route = createFileRoute("/${page.slug}")({
  head: () => ({
    meta: [
      { title: ${JSON.stringify(page.seoTitle)} },
      { name: "description", content: ${JSON.stringify(page.metaDescription)} },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: ${JSON.stringify(page.canonicalUrl)} }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  }),
  component: ${name},
});

function ${name}() {
  return <div dangerouslySetInnerHTML={{ __html: \`${html}\` }} />;
}
`;
  }

  // Next pages router / React Router / Vite pages
  return `const jsonLd = ${jsonLd};

export default function ${name}() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: \`${html}\` }} />
    </>
  );
}
`;
}

/** Adds the canonical URL to an existing XML sitemap without touching other lastmods. */
export function upsertSitemapEntry(xml: string, loc: string, lastmod: string): string | null {
  if (xml.includes(`<loc>${loc}</loc>`)) return null;
  const entry = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>\n`;
  if (!xml.includes("</urlset>")) return null;
  return xml.replace("</urlset>", `${entry}</urlset>`);
}
