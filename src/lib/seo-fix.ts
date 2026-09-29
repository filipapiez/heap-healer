// Shared (client-safe) classifier: audit issue text -> fix type + time estimate.

export type FixPlan =
  | { auto: true; fixType: string; minutes: number; label: string }
  | { auto: false; fixType: string; minutes: number; label: string; steps: string };

const RULES: Array<[RegExp, FixPlan]> = [
  [/not returning a clean 200|homepage response is slow|content type is unusual/i, { auto: false, fixType: "hosting", minutes: 0, label: "Hosting", steps: "This comes from how the site is hosted, not its pages. Check your hosting provider's status and settings." }],
  [/https|host variants|broken host/i, { auto: false, fixType: "domain", minutes: 0, label: "Domain settings", steps: "Set up the redirect in your domain or hosting settings so every version of your address goes to one https:// address." }],
  [/google business|gbp/i, { auto: false, fixType: "gbp", minutes: 0, label: "Google Business", steps: "Create or claim your free Google Business Profile at business.google.com." }],
  [/github/i, { auto: false, fixType: "github", minutes: 0, label: "GitHub", steps: "Connect your website's GitHub on the Accounts page." }],
  [/noindex/i, { auto: true, fixType: "noindex", minutes: 10, label: "Remove noindex" }],
  [/canonical/i, { auto: true, fixType: "canonical", minutes: 10, label: "Canonical tag" }],
  [/robots\.txt/i, { auto: true, fixType: "robots", minutes: 10, label: "robots.txt" }],
  [/sitemap/i, { auto: true, fixType: "sitemap", minutes: 10, label: "Sitemap" }],
  [/lang attribute|viewport/i, { auto: true, fixType: "head", minutes: 10, label: "Page settings" }],
  [/open graph|twitter|title|meta description/i, { auto: true, fixType: "meta", minutes: 10, label: "Preview tags" }],
  [/json-ld|structured data/i, { auto: true, fixType: "schema", minutes: 15, label: "Structured data" }],
  [/llms\.txt/i, { auto: true, fixType: "llms", minutes: 10, label: "llms.txt" }],
  [/alt text/i, { auto: true, fixType: "alt", minutes: 15, label: "Image alt text" }],
  [/heading|h1|h2/i, { auto: true, fixType: "headings", minutes: 15, label: "Headings" }],
  [/faq/i, { auto: true, fixType: "faq", minutes: 25, label: "FAQ page" }],
  [/how-it-works|methodology/i, { auto: true, fixType: "how", minutes: 25, label: "How it works page" }],
  [/trust pages|seo surface/i, { auto: true, fixType: "pages", minutes: 30, label: "Missing pages" }],
  [/soft 404|fake url/i, { auto: true, fixType: "notfound", minutes: 20, label: "Not-found page" }],
  [/internal linking|thin/i, { auto: true, fixType: "content", minutes: 20, label: "Homepage content" }],
];

export function planFix(issue: string): FixPlan {
  for (const [re, plan] of RULES) if (re.test(issue)) return plan;
  return { auto: true, fixType: "generic", minutes: 25, label: "AI fix" };
}

export function formatMinutes(total: number) {
  if (total < 60) return `About ${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `About ${h} h${m ? ` ${m} min` : ""}`;
}
