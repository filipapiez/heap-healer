import { SITE_NAME, SITE_URL } from "@/seo/pages";

export type TrustPageKey = "about" | "privacy" | "terms" | "contact" | "how-it-works";

export type TrustSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type TrustPage = {
  key: TrustPageKey;
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  summary: string;
  sections: TrustSection[];
};

export const TRUST_PAGES: TrustPage[] = [
  {
    key: "about",
    path: "/about",
    title: "About MentionMyApp",
    description:
      "Learn what MentionMyApp does, who it helps, and how its SEO audit workflow connects content, Google Business Profile activity, source signals, and technical fixes.",
    eyebrow: "Company",
    summary:
      "MentionMyApp helps founders, local businesses, agencies, and software teams turn scattered marketing work into a clearer SEO and AI-visibility system. The product combines publishing, engagement tracking, Google Business Profile workflows, GitHub/source checks, and plain-English audit reports.",
    sections: [
      {
        heading: "What MentionMyApp is",
        paragraphs: [
          "MentionMyApp is built for people who need to understand why a site is not earning enough organic traffic. It is not only a scorecard. The product is designed to show what is working, what is broken, what should be fixed first, and which owner should handle each fix.",
          "The app looks at the website, optional GitHub source signals, Google Business Profile context, social posting activity, and content depth. That mix matters because modern visibility is not only about titles and descriptions. Search engines, local results, and AI answer systems all need clear proof that the business is real, active, specific, and useful.",
        ],
      },
      {
        heading: "Who it is for",
        paragraphs: [
          "The first audience is founders and operators who have built a useful product or local service but cannot explain why Google is not rewarding it. The second audience is agencies and consultants who need a faster way to produce a blunt, customer-friendly report without hiding behind jargon.",
          "MentionMyApp is especially useful when a site was built quickly in a visual builder, AI app builder, React app, ecommerce platform, or CMS. Those stacks can be excellent, but they often ship with thin pages, weak trust signals, duplicate routes, missing local proof, and sitemaps that do not reflect the pages customers actually need.",
        ],
      },
      {
        heading: "How the product thinks",
        paragraphs: [
          "A good audit should separate technical blockers from content gaps. A fake URL returning 200 is not the same problem as a weak service page. A missing privacy page is not the same problem as poor GBP review velocity. MentionMyApp groups findings so the customer can see the difference.",
          "The goal is not to scare people with a giant list. The goal is to give them a fix order. Clean the crawl surface first, strengthen trust pages next, connect local and source proof, then expand content around pages that deserve to rank.",
        ],
        bullets: [
          "Technical issues are grouped separately from content and trust work.",
          "Google Business Profile context is treated as part of local SEO, not an afterthought.",
          "GitHub/source signals are used only when a public repo helps prove entity context.",
          "Reports are written so a founder can send them to a developer or SEO specialist.",
        ],
      },
      {
        heading: "Why this exists now",
        paragraphs: [
          "A lot of websites look better than they perform. Founders can ship a polished homepage in a weekend, but the site may still have no real service pages, no trust pages, no local proof, no source context, weak metadata, and route behavior that creates duplicate or low-value URLs. MentionMyApp exists because those problems are hard to explain quickly without a structured report.",
          "The product is built around the idea that SEO, AEO, GEO, GBP, and content distribution are now connected. A brand that posts consistently but has no crawlable pages wastes effort. A site with clean pages but no mentions, reviews, or source proof still looks thin. A local business with a strong profile but weak service pages leaves rankings on the table. The audit tries to put those pieces into one practical view.",
        ],
      },
      {
        heading: "What we will not claim",
        paragraphs: [
          "MentionMyApp should not tell customers that an audit guarantees rankings. It should not pretend every generated page deserves indexing. It should not hide platform limitations from visual builders, app builders, or hosting providers. The report is useful because it is willing to say when the fix requires a developer, a better content plan, GBP work, or a hosting change.",
          "The standard is simple: tell the customer what is good, tell them what is bad, show the cost and owner of the fix, and avoid vague advice that cannot be acted on. That is the difference between a real audit and a decorative score.",
        ],
      },
    ],
  },
  {
    key: "privacy",
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "Privacy overview for MentionMyApp, including account data, website audit inputs, GitHub URLs, Google Business Profile connections, and support requests.",
    eyebrow: "Privacy",
    summary:
      "MentionMyApp handles account, audit, publishing, and integration data so users can run reports and manage marketing workflows. This page explains the practical categories of information involved and how users should think about them.",
    sections: [
      {
        heading: "Information used by the product",
        paragraphs: [
          "When someone uses MentionMyApp, they may provide an email address, workspace details, website URL, GitHub URL, Google Business Profile URL, connected social accounts, uploaded media, post drafts, captions, and support messages. These inputs are needed to run the product and produce useful reports.",
          "Audit inputs can reveal sensitive business context. A website URL may expose pages, technology, metadata, and public trust gaps. A GitHub URL may expose public repository information. A GBP URL may expose local presence, reviews, and profile activity. Users should only submit information they are comfortable using for the requested workflow.",
        ],
      },
      {
        heading: "Connected accounts",
        paragraphs: [
          "MentionMyApp uses official connection flows where available. The product should not ask users to hand over platform passwords. Connected accounts are used to publish content, retrieve engagement data, or show local SEO context depending on the integration selected by the user.",
          "If a user disconnects an account, future sync and publishing actions for that account should stop. Some historical records may remain where they are needed for reporting, security, billing, compliance, or audit logs.",
        ],
      },
      {
        heading: "How data supports SEO audits",
        paragraphs: [
          "The SEO audit workflow uses public crawl data, submitted URLs, optional repository information, and optional Google Business Profile context to produce findings. The report may include technical issues, missing pages, metadata problems, source signals, local proof gaps, and prioritized fixes.",
          "MentionMyApp should not invent private metrics. If Google Business Profile metrics are not connected, the report should say they are unavailable instead of guessing. That honesty matters because customers need to trust the output before acting on it.",
        ],
        bullets: [
          "Website URLs are used to crawl public pages and technical signals.",
          "GitHub URLs are optional and used for public source/entity context.",
          "GBP data requires either a provided profile URL or connected account access.",
          "Support requests may be used to investigate bugs or clarify reports.",
        ],
      },
      {
        heading: "Third-party services",
        paragraphs: [
          "MentionMyApp may rely on infrastructure, authentication, database, storage, analytics, email, platform API, and payment providers to operate the product. Those services may process limited data needed for login, storage, delivery, security, billing, or integration workflows.",
          "Connected platforms also have their own privacy rules. When a user connects a social account or Google Business Profile, the platform may show its own permissions screen and terms. Users should review those screens carefully because they define what the platform allows MentionMyApp to access.",
        ],
      },
      {
        heading: "User controls and safe submissions",
        paragraphs: [
          "Users should avoid placing unnecessary private information inside website audit fields, GitHub URL fields, GBP URL fields, captions, media names, or support messages. The product works best with business URLs, public source links, and account connections that are actually needed for the workflow.",
          "If a user needs account help, privacy review, export, deletion, or correction, they should contact support with the workspace email and the specific request. Some records may need to remain for security, billing, fraud prevention, legal compliance, or backup integrity, but unnecessary data should not be collected just because it is easy to collect.",
        ],
      },
    ],
  },
  {
    key: "terms",
    path: "/terms",
    title: "Terms of Service",
    description:
      "Terms for using MentionMyApp, including audits, connected accounts, publishing workflows, reports, integrations, and responsible use.",
    eyebrow: "Terms",
    summary:
      "MentionMyApp provides software for publishing, engagement management, SEO audits, and visibility reporting. These terms explain the boundaries of the service and the user's responsibility for the sites, accounts, and content they submit.",
    sections: [
      {
        heading: "Use of the service",
        paragraphs: [
          "Users are responsible for the websites, repositories, business profiles, accounts, media, and content they submit to MentionMyApp. They should only connect accounts they own or are authorized to manage, and they should follow the rules of each platform where content is published.",
          "SEO audits are diagnostic reports. They can identify likely blockers, missing trust signals, content gaps, technical risks, and local visibility issues. They do not guarantee rankings, traffic, revenue, approvals, indexation, or specific placement in AI-generated answers.",
        ],
      },
      {
        heading: "Reports and recommendations",
        paragraphs: [
          "Reports are meant to support decision-making. A customer may still need a developer, SEO specialist, content editor, local SEO operator, or legal advisor before implementing every recommendation. MentionMyApp does not replace professional judgment for regulated industries, legal claims, health claims, financial claims, or platform compliance.",
          "The quality of a report depends on available inputs. A crawl can only inspect reachable pages. GitHub checks can only inspect public repository data. Google Business Profile details depend on what is provided or connected. If access is incomplete, the report should reflect that limitation.",
        ],
      },
      {
        heading: "Connected accounts and content",
        paragraphs: [
          "Users are responsible for reviewing content before publishing. MentionMyApp may help format, schedule, distribute, or summarize posts, but the user remains responsible for claims, media rights, comments, replies, and compliance with platform terms.",
          "The service may change integrations as platform APIs, authentication rules, or provider access changes. Some features may require active connections, paid accounts, or third-party availability.",
        ],
        bullets: [
          "Do not connect accounts without permission.",
          "Do not submit private repositories unless the product explicitly supports that workflow.",
          "Verify audit recommendations before changing production systems.",
          "Treat SEO reports as prioritization, not guaranteed ranking promises.",
        ],
      },
      {
        heading: "Platform and integration limits",
        paragraphs: [
          "MentionMyApp depends on third-party platforms for account connections, posting, profile data, comments, reviews, and metrics. Those platforms can change APIs, rate limits, permissions, review rules, branding rules, or access without notice. When that happens, some features may be delayed, limited, changed, or temporarily unavailable.",
          "Users should not use the product to spam platforms, scrape data without permission, impersonate others, publish misleading claims, or bypass platform rules. SEO and distribution work should make a business easier to evaluate, not create fake authority.",
        ],
      },
      {
        heading: "Billing, changes, and responsibility",
        paragraphs: [
          "Paid features, limits, trials, refunds, and billing terms may vary by plan or offer. Users are responsible for reviewing plan details before subscribing and for canceling services they no longer want. MentionMyApp may update features or pricing as the product changes.",
          "Users remain responsible for implementing recommendations safely. A report may suggest redirect, canonical, indexation, schema, content, or GBP changes, but production changes should be reviewed before launch. A rushed fix can create new crawl or conversion problems if no one checks it.",
        ],
      },
    ],
  },
  {
    key: "contact",
    path: "/contact",
    title: "Contact MentionMyApp",
    description:
      "Contact MentionMyApp for support, audit questions, billing, integration problems, Google Business Profile setup, and report corrections.",
    eyebrow: "Support",
    summary:
      "Use this page to understand what to send when you need help with audits, account connections, publishing, billing, Google Business Profile setup, or report corrections.",
    sections: [
      {
        heading: "What to include",
        paragraphs: [
          "The fastest support requests include the website URL, workspace email, the page or audit report involved, screenshots where relevant, and the exact behavior observed. If the issue involves Google Business Profile, include the GBP or Maps URL and whether the account is connected inside the app.",
          "If the question is about a specific SEO finding, include the finding text and the affected URL. That lets support tell whether the issue is a crawl result, a missing input, a platform limitation, or a recommendation that needs clearer wording.",
        ],
      },
      {
        heading: "Common support topics",
        paragraphs: [
          "MentionMyApp support may help with audit inputs, GitHub URL parsing, Google Business Profile connection flow, missing metrics, post publishing errors, media uploads, workspace access, billing questions, and report copy that needs to be corrected or clarified.",
          "Support cannot guarantee Google indexation, platform approval, social reach, or ranking improvements. It can help identify whether the product is collecting the right inputs and whether the report is giving a useful next step.",
        ],
      },
      {
        heading: "Correction requests",
        paragraphs: [
          "If a report says something that looks wrong, send the affected URL and the reason you think the finding is inaccurate. Good corrections improve the product because they make future reports less generic and more useful.",
          "For urgent account-security issues, disconnect affected integrations where possible and contact support with the workspace email and platform involved.",
        ],
        bullets: [
          "Include the audited website URL.",
          "Include the GitHub or GBP URL if the issue involves those inputs.",
          "Include a screenshot or exact error message.",
          "Separate billing, integration, and audit-quality questions when possible.",
        ],
      },
      {
        heading: "GBP and GitHub questions",
        paragraphs: [
          "For Google Business Profile questions, include whether the profile is connected through the app, whether you only pasted a Maps or GBP URL, and which metrics you expected to see. Profile views, calls, direction requests, review details, posts, and comments may require a connected account before they can be shown.",
          "For GitHub questions, include the full repository URL and whether the repo is public. MentionMyApp can inspect public repository context, descriptions, homepage fields, README availability, stars, and issues, but private source access requires an explicit supported workflow.",
        ],
      },
      {
        heading: "Audit quality feedback",
        paragraphs: [
          "The most useful feedback explains what the report missed. If the audit says a trust page is missing but the site uses a different URL, send the URL. If it flags a fake URL issue incorrectly, send the tested URL and the expected status. If it misunderstands the business, send the page that explains the business better.",
          "Support feedback should make reports more specific, not softer. MentionMyApp is supposed to show a lot of good and bad things in plain language. If something is blunt but accurate, it should stay blunt. If something is inaccurate, it should be fixed.",
        ],
      },
    ],
  },
  {
    key: "how-it-works",
    path: "/how-it-works",
    title: "How MentionMyApp Works",
    description:
      "How MentionMyApp audits websites, checks GitHub/source context, connects Google Business Profile, and turns SEO findings into a practical fix plan.",
    eyebrow: "Methodology",
    summary:
      "MentionMyApp combines crawl checks, content review, local proof, social activity, source context, and AI-visibility signals into one report. The point is to make SEO problems understandable enough to fix.",
    sections: [
      {
        heading: "The audit flow",
        paragraphs: [
          "A user starts with a website URL. They can also add a GitHub repository and Google Business Profile URL, or connect a GBP account for richer local context. The audit then looks for technical problems, content depth, trust pages, sitemap quality, fake URL behavior, metadata, schema, local proof, and source/entity signals.",
          "The output is organized by category so the user can separate crawl blockers from copy problems, local SEO gaps, AEO/GEO gaps, and source credibility issues. That structure matters because the right fix depends on the type of problem.",
        ],
      },
      {
        heading: "Why GitHub and GBP are included",
        paragraphs: [
          "A public GitHub repository can help prove that a product is real, maintained, documented, and tied to the correct domain. It is not required for every business, but for software products it can be useful source context.",
          "Google Business Profile matters for local businesses because calls, directions, reviews, services, posts, photos, and profile views affect how a business is evaluated. A website audit that ignores GBP will miss a major part of local discovery.",
        ],
      },
      {
        heading: "What the report does not claim",
        paragraphs: [
          "MentionMyApp does not promise rankings. It does not claim that every page should be indexed. It does not invent GBP metrics when the profile is not connected. It does not pretend that content volume fixes a broken technical foundation.",
          "The honest promise is a clearer diagnosis and a better fix order. If a site needs a developer, the report should say so. If it needs trust pages before more blog posts, it should say that too.",
        ],
        bullets: [
          "Crawl and status-code issues come before content scale.",
          "Trust pages and source proof help both users and AI systems understand the business.",
          "GBP signals are treated as real local SEO inputs, not vanity metrics.",
          "Recommendations are prioritized so the next step is visible.",
        ],
      },
      {
        heading: "Scoring and prioritization",
        paragraphs: [
          "The score is a shorthand, not the product. A low score should point to specific reasons: crawl problems, missing trust pages, weak metadata, thin content, missing GBP context, no GitHub/source signal, poor schema, or unclear entity language. A higher score should still show the next growth lever.",
          "Priority is based on impact and order. A canonical problem can matter before a blog plan. A missing contact page can matter before another comparison article. A weak GBP profile can matter before polishing meta descriptions for a local business. The report should explain why the order matters.",
        ],
      },
      {
        heading: "The improvement loop",
        paragraphs: [
          "The first report is a baseline. After fixes are shipped, users should watch indexed pages, impressions, clicks, CTR, local actions, profile views, calls, direction requests, comments, reviews, and conversions. If impressions rise but clicks do not, titles and positioning may need work. If pages index but do not rank, proof and authority may be the next problem.",
          "MentionMyApp is meant to help teams stop guessing. Audit, fix, publish, measure, then improve the pages that already show demand. That loop is usually better than buying random content while the site still has unresolved technical and trust problems.",
        ],
      },
    ],
  },
];

export const TRUST_PAGE_REFS = TRUST_PAGES.map((page) => ({
  path: page.path,
  absoluteUrl: `${SITE_URL}${page.path}`,
  title: page.title,
}));

export function getTrustPage(key: TrustPageKey) {
  return TRUST_PAGES.find((page) => page.key === key);
}

export { SITE_NAME, SITE_URL };
