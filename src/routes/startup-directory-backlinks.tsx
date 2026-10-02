import { createFileRoute } from "@tanstack/react-router";
import { renderPageHtml, type GeneratedPage } from "@/lib/page-content";

const URL = "https://mentionmyapp.com/startup-directory-backlinks";

const page: GeneratedPage = {
  slug: "startup-directory-backlinks",
  pageType: "informational",
  searchIntent: "mixed",
  primaryKeyword: "startup directory backlinks",
  secondaryKeywords: ["startup directory submissions", "submit startup to directories", "free backlinks for startups"],
  semanticKeywords: ["referring domains", "link verification", "launch directories", "domain authority"],
  entities: ["Google Search Console", "Product Hunt", "Dev.to", "Hashnode", "Medium"],
  seoTitle: "Startup Directory Backlinks: Submissions That Go Live",
  metaDescription:
    "How to get startup directory backlinks that actually go live: pick directories that still work, submit with a ready profile, and verify every link yourself.",
  h1: "Startup directory backlinks that actually go live",
  hero: {
    eyebrow: "Backlinks guide",
    heading: "Startup directory backlinks that actually go live",
    description:
      "Directory listings are one of the easiest first backlinks for a new website, if you submit to directories that still work and check that each link really appears.",
  },
  introduction:
    "Startup directory backlinks are links to your website from listing sites where founders publish their product, such as launch boards, tool directories and SaaS catalogues. For a new domain with few referring domains, they are a practical way to give Google more paths to discover your site and to build a basic link profile. The catch is that many directory lists online are out of date: sites shut down, sign-up pages move, and some listings are only marked as submitted without ever being published. This guide covers how to choose directories, how to submit quickly, and how to confirm that each backlink is live.",
  sections: [
    {
      heading: "Why directory backlinks still matter for new websites",
      content:
        "A brand new website usually has no links pointing at it. Search engines discover and evaluate pages partly through links, so a site with zero referring domains can take longer to be crawled and indexed. Directory listings will not make a site rank on their own, but they add relevant, real referring domains, they often send a small amount of targeted visitors, and many of them are indexed quickly. Treat them as a foundation that supports your content and technical SEO, not a replacement for them.",
    },
    {
      heading: "Check that a directory still works before you submit",
      content:
        "Before spending time on a submission, open the directory and confirm three things: the site is still online and maintained, the submission page exists, and recent listings are visible. Directories frequently close or change owner, and a domain that now redirects elsewhere or is listed for sale gives you nothing. Also note which directories require an account, review step or captcha, and which charge for a listing, so you can plan the free ones first and decide separately whether a paid placement is worth it.",
    },
    {
      heading: "Prepare one complete profile and reuse it",
      content:
        "Most directory forms ask for the same details: product name, website address, contact email, a one-line tagline, a longer description, a category, a logo and a pricing model. Writing these once and reusing them keeps your listings consistent and turns each submission into a few minutes of work. Consistent names and descriptions across the web also make it easier for search engines and AI assistants to understand what your product is.",
    },
    {
      heading: "Submit quickly without copying and pasting",
      content:
        "Because directory forms live on other people's websites, nothing can fill them in from the outside. What does help is a browser bookmark that fills the visible fields from your saved profile when you click it on the directory's form. You review the filled fields, solve any captcha, and press submit yourself. Some forms are embedded from third-party form tools inside a separate frame, and those still need to be typed by hand.",
    },
    {
      heading: "Verify every backlink instead of trusting a status",
      content:
        "A submission is not a backlink until the listing is published and the link to your site is on the page. Keep a record of each directory with an honest status: not sent yet, submitted, live or rejected. Re-check submitted listings after a few days by visiting the page and confirming the link is present. Counting only verified links gives you a backlink number you can trust, and it shows which directories are worth recommending again.",
    },
    {
      heading: "Combine directories with article syndication",
      content:
        "Directories are a one-time effort per site. To keep earning links over time, republish your own articles on free publishing platforms such as Dev.to, Hashnode or Medium with a canonical link back to the original page. Each republished article can carry a link to your website while the original keeps the search credit. Together with regular new pages on your own site, this gives you a steady, honest source of new links.",
    },
  ],
  features: [
    {
      name: "Checked directory list",
      description: "Directories that have shut down or moved are removed, and broken sign-up pages point to the directory's main site instead.",
    },
    {
      name: "One-click form filling",
      description: "A bookmark fills each directory form from your business profile, so you only review and press submit.",
    },
    {
      name: "Honest link counts",
      description: "A backlink only counts once you confirm it went out and the link is verified, never because a form was attempted.",
    },
  ],
  faqs: [
    {
      question: "Are startup directory backlinks still worth it?",
      answer:
        "Yes for new websites. They give a site its first real referring domains and help search engines discover it. They work best alongside useful content and a technically healthy site.",
    },
    {
      question: "How many directories should I submit to?",
      answer:
        "Start with the directories that are still active, relevant to your category and free to list. Quality and relevance matter more than volume, so a few dozen working, relevant listings beat hundreds of dead ones.",
    },
    {
      question: "Can directory submissions be fully automated?",
      answer:
        "Not reliably. Many directories need an account, a captcha or a manual review. The practical approach is to prepare your details once and fill each form in one click, then submit it yourself.",
    },
    {
      question: "How do I know if a directory backlink is live?",
      answer:
        "Open the listing page and check that your product appears with a link to your website. Record it as live only after you have seen the link on the page.",
    },
    {
      question: "Do paid directory listings help SEO?",
      answer:
        "Some paid listings send relevant visitors, but paying does not guarantee a ranking benefit. Judge a paid directory by its audience and how well it is maintained, not by promises about rankings.",
    },
  ],
  internalLinks: [
    { anchorText: "How MentionMyApp works", url: "https://mentionmyapp.com/how-it-works" },
    { anchorText: "SEO resources", url: "https://mentionmyapp.com/resources" },
  ],
  cta: {
    heading: "Build backlinks you can verify",
    description: "Get a checked directory queue, one-click form filling and an honest backlink count for your website.",
    buttonText: "Get started",
    buttonUrl: "https://mentionmyapp.com/",
  },
  canonicalUrl: URL,
  structuredData: {},
  breadcrumbs: [
    { name: "Home", url: "https://mentionmyapp.com/" },
    { name: "Resources", url: "https://mentionmyapp.com/resources" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: page.seoTitle,
      description: page.metaDescription,
      author: { "@type": "Organization", name: "MentionMyApp", url: "https://mentionmyapp.com/" },
      publisher: { "@type": "Organization", name: "MentionMyApp", url: "https://mentionmyapp.com/" },
      mainEntityOfPage: { "@type": "WebPage", "@id": URL },
    },
    {
      "@type": "FAQPage",
      mainEntity: page.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

const html = renderPageHtml(page);

export const Route = createFileRoute("/startup-directory-backlinks")({
  head: () => ({
    meta: [
      { title: page.seoTitle },
      { name: "description", content: page.metaDescription },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: page.h1 },
      { property: "og:description", content: page.metaDescription },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  }),
  component: () => <div dangerouslySetInnerHTML={{ __html: html }} />,
});
