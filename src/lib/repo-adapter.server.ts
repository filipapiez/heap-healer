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

/** Files that may hold a React Router <Routes> table, in lookup order. */
export const REACT_ROUTER_TABLE_CANDIDATES = [
  "src/App.tsx",
  "src/App.jsx",
  "src/routes.tsx",
  "src/router.tsx",
  "src/main.tsx",
];

/**
 * React Router has no file-based routing: a page file in src/pages is invisible
 * until it is imported and given a <Route>. Registers every slug that is missing.
 * Returns the updated source, or null when nothing changed / no table found.
 */
export function registerReactRouterRoutes(
  source: string,
  tablePath: string,
  pagesDir: string,
  slugs: string[],
): string | null {
  const closing = source.lastIndexOf("</Routes>");
  if (closing === -1) return null;

  const tableDir = tablePath.split("/").slice(0, -1).join("/");
  let rel = pagesDir.startsWith(`${tableDir}/`) ? `./${pagesDir.slice(tableDir.length + 1)}` : null;
  if (!rel) {
    const up = tableDir.split("/").filter(Boolean).map(() => "..").join("/");
    rel = `${up}/${pagesDir}`;
  }

  let out = source;
  const imports: string[] = [];
  const routes: string[] = [];
  for (const slug of [...new Set(slugs)]) {
    if (new RegExp(`path=["']/${slug.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}["']`).test(out)) continue;
    const name = `Mma${componentName(slug)}`;
    imports.push(`import ${name} from "${rel}/${slug}";`);
    routes.push(`<Route path="/${slug}" element={<${name} />} />`);
  }
  if (!routes.length) return null;

  // Insert routes before a catch-all route if present, else before </Routes>.
  const catchAll = out.search(/<Route\s+path=["']\*["']/);
  const insertAt = catchAll !== -1 && catchAll < out.lastIndexOf("</Routes>") ? catchAll : out.lastIndexOf("</Routes>");
  out = `${out.slice(0, insertAt)}${routes.join("\n          ")}\n          ${out.slice(insertAt)}`;

  // Insert imports after the last top-level import statement.
  const importRe = /^import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm;
  let lastEnd = 0;
  for (const match of out.matchAll(importRe)) lastEnd = (match.index ?? 0) + match[0].length;
  out = `${out.slice(0, lastEnd)}\n${imports.join("\n")}${out.slice(lastEnd)}`;
  return out;
}

/** Adds the canonical URL to an existing XML sitemap without touching other lastmods. */
export function upsertSitemapEntry(xml: string, loc: string, lastmod: string): string | null {
  if (xml.includes(`<loc>${loc}</loc>`)) return null;
  const entry = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>\n`;
  if (!xml.includes("</urlset>")) return null;
  return xml.replace("</urlset>", `${entry}</urlset>`);
}
