import { SITE_NAME, SITE_URL } from "@/seo/pages";

export type TrustPageKey =
  "about" | "privacy" | "terms" | "contact" | "how-it-works" | "data-deletion";

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
      "Learn how MentionMyApp connects technical SEO, website content, backlinks, Search Console and AI visibility.",
    eyebrow: "Company",
    summary:
      "MentionMyApp helps teams turn scattered SEO work into a measurable website-growth system.",
    sections: [
      {
        heading: "What MentionMyApp is",
        paragraphs: [
          "MentionMyApp is built for people who need to understand why a website is not earning enough organic traffic. It shows what is working, what is broken, what should be fixed first and how performance changes after the work ships.",
          "The product combines technical crawl checks, website content planning, Search Console reporting, backlink verification and AI-visibility signals. The focus is the customer’s website and the authority it earns across search and answer engines.",
        ],
      },
      {
        heading: "How the product thinks",
        paragraphs: [
          "A useful audit separates technical blockers from content gaps. A fake URL returning 200 is not the same problem as a weak service page, and a missing canonical is not the same problem as a lack of external authority.",
          "The fix order is deliberate: clean the crawl surface, strengthen high-intent pages, publish content that deserves indexing, earn verifiable references, then measure the result.",
        ],
        bullets: [
          "Technical issues are separated from content and trust work.",
          "Search Console supplies verified performance.",
          "Website publishing connections are explicit and reviewable.",
          "Reports are clear enough to hand to a developer or SEO specialist.",
        ],
      },
      {
        heading: "What we will not claim",
        paragraphs: [
          "MentionMyApp does not pretend every page deserves indexing, every backlink is valuable or an audit alone guarantees rankings. It distinguishes verified results from recommendations and incomplete setup.",
          "The standard is simple: show what is good, show what is bad, explain the next action and never present sample data as a customer result.",
        ],
      },
    ],
  },
  {
    key: "privacy",
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "How MentionMyApp protects account, website, Search Console and publishing-connection data.",
    eyebrow: "Privacy",
    summary:
      "Effective July 18, 2026. MentionMyApp is operated by Visionary Pixel, LLC. This policy explains the information used to deliver the Service.",
    sections: [
      {
        heading: "Information we collect",
        paragraphs: [
          "Account information includes your name, email address and authentication identity. Payment information is handled by our payment processor; we do not store full card numbers.",
          "Website information may include the domain you submit, public crawl results, Search Console performance, repository metadata you authorize, CMS connection details and website publishing results.",
          "Content assets may include logos, images, screenshots, article copy and other files you upload. We also collect ordinary security and usage logs such as IP address, browser type, pages viewed and actions taken.",
        ],
      },
      {
        heading: "How we use information",
        paragraphs: [
          "We use information to authenticate users, isolate workspaces, audit websites, synchronize approved search metrics, operate content and backlink workflows, publish approved website changes and show verified results.",
          "We also use information to provide support, secure the Service, prevent abuse and comply with law. We do not sell personal information or use customer content for advertising.",
        ],
      },
      {
        heading: "Google user data",
        paragraphs: [
          "MentionMyApp uses read-only Google Search Console authorization to retrieve approved properties and performance data. Our use and transfer of Google API data follows the Google API Services User Data Policy, including Limited Use requirements.",
          "Google data is used only for requested search reporting, is not sold or used for advertising and can be revoked from Google account security settings or by requesting disconnection.",
        ],
      },
      {
        heading: "Website connections and service providers",
        paragraphs: [
          "When you connect a CMS, store or repository, we store the minimum identifiers and encrypted credentials or tokens needed for the approved workflow. Credentials are not returned to the browser after storage.",
          "We share data only with providers needed to operate the Service, such as cloud hosting, database infrastructure, private file storage, payment processing, search-data providers and the website platform you direct us to update.",
        ],
      },
      {
        heading: "Retention, deletion and security",
        paragraphs: [
          "We keep customer data while an account is active. You may request deletion from Settings or by emailing privacy@mentionmyapp.com. Customer records are deleted within 30 days except information required for legal, billing or security purposes.",
          "We use TLS, encrypted credentials, workspace-level isolation, signed file URLs and least-privilege access. No method is completely secure, but we work to protect customer information and provide notices required by law.",
        ],
      },
      {
        heading: "Your rights and contact",
        paragraphs: [
          "Depending on where you live, you may have rights to access, correct, export or delete personal information. Contact privacy@mentionmyapp.com to exercise those rights.",
          "The Service is not directed to anyone under 18. MentionMyApp is operated by Visionary Pixel, LLC in Illinois, USA.",
        ],
      },
    ],
  },
  {
    key: "terms",
    path: "/terms",
    title: "Terms of Service",
    description:
      "Terms for using MentionMyApp website audits, analytics, integrations and publishing tools.",
    eyebrow: "Terms",
    summary:
      "Effective July 18, 2026. MentionMyApp is operated by Visionary Pixel, LLC. By using the Service you agree to these Terms.",
    sections: [
      {
        heading: "The Service",
        paragraphs: [
          "MentionMyApp provides website audits, SEO and AI-visibility reporting, content-planning tools, backlink workflows, Search Console analytics and approved website publishing through supported connections. Features may change as the Service improves.",
        ],
      },
      {
        heading: "Accounts and website connections",
        paragraphs: [
          "You must be at least 18, provide accurate information and protect your credentials. Workspaces isolate brands or clients, and you are responsible for their members and permissions.",
          "You may connect only websites, stores, repositories and search properties that you own or are authorized to manage. Third-party services remain subject to their own terms and availability.",
        ],
      },
      {
        heading: "Your content",
        paragraphs: [
          "You own the content and assets you upload. You grant us a limited license to host, process and transmit them solely to operate the Service and complete website changes you approve.",
          "You represent that you have the rights to the copy, images, logos and other materials you provide and that their use complies with applicable law.",
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: [
          "You may not use the Service to publish unlawful or deceptive material, infringe intellectual property, create spam or manipulative search pages, access another customer’s data, disrupt the Service or resell it without written permission.",
          "We may suspend accounts that violate these Terms or put customers, third parties or the Service at risk.",
        ],
      },
      {
        heading: "Plans, billing and the ranking guarantee",
        paragraphs: [
          "Paid plans bill in advance until cancelled. Cancellation stops future charges and access continues through the paid period. Prices, taxes and plan limits may change with notice.",
          "If a qualifying website has no measurable organic-search growth after 90 days on a covered paid plan, we will refund the MentionMyApp subscription fees paid for that period. Growth is measured using verified Google Search Console clicks or impressions for the latest 28-day period against the saved day-one 28-day baseline.",
          "Qualifying use requires continuous Search Console access, complete audit inputs, an active supported website workflow and completion of the agreed content and technical work. Claims must be submitted to support@mentionmyapp.com within 14 days after day 90. The guarantee excludes third-party costs and is limited to one claim per customer.",
        ],
      },
      {
        heading: "Disclaimers and contact",
        paragraphs: [
          "Except for the written guarantee above, the Service is provided as is. We do not guarantee specific rankings, indexing, traffic or revenue because those outcomes depend on systems and work outside our control.",
          "To the maximum extent allowed by law, our liability is limited to amounts paid in the 12 months before the claim. Illinois law governs these Terms. Contact support@mentionmyapp.com with questions.",
        ],
      },
    ],
  },
  {
    key: "contact",
    path: "/contact",
    title: "Contact MentionMyApp",
    description:
      "Contact MentionMyApp about audits, analytics, website integrations, billing and corrections.",
    eyebrow: "Support",
    summary:
      "Send the affected website, workspace and exact issue so support can identify the right fix.",
    sections: [
      {
        heading: "What to include",
        paragraphs: [
          "The fastest requests include the website URL, workspace email, relevant dashboard page or audit, screenshots and the exact behavior observed.",
          "For an SEO finding, include the finding and affected URL. For a connection issue, identify the Search Console property, CMS, store or repository without sending passwords or secret keys.",
        ],
      },
      {
        heading: "Common support topics",
        paragraphs: [
          "Support can help with audit inputs, repository selection, Search Console synchronization, missing metrics, website publishing, content assets, workspace access, billing and report corrections.",
          "Support cannot guarantee indexing or rankings, but it can verify whether MentionMyApp is collecting the right inputs and reporting the next action accurately.",
        ],
      },
      {
        heading: "Correction and security requests",
        paragraphs: [
          "If a report appears wrong, send the affected URL and why the result is inaccurate. For urgent security concerns, revoke the affected connection and contact support from the workspace email.",
        ],
        bullets: [
          "Include the audited website URL.",
          "Include the repository or Search Console property when relevant.",
          "Include the exact error message.",
          "Never email credentials, tokens or private keys.",
        ],
      },
    ],
  },
  {
    key: "how-it-works",
    path: "/how-it-works",
    title: "How MentionMyApp Works",
    description:
      "How MentionMyApp audits websites, measures search performance and creates a growth plan.",
    eyebrow: "Methodology",
    summary:
      "MentionMyApp combines crawl checks, website content, authority, Search Console and AI visibility into one measurable loop.",
    sections: [
      {
        heading: "The audit flow",
        paragraphs: [
          "A customer starts with a website URL and may connect a repository and Search Console property. The audit checks crawl behavior, redirects, HTTPS, metadata, canonicals, sitemaps, schema, trust pages, content depth and AI-discovery files.",
          "Findings are organized so technical blockers, on-page work, trust gaps and AEO/GEO recommendations remain distinct.",
        ],
      },
      {
        heading: "Content, authority and measurement",
        paragraphs: [
          "After technical blockers are identified, the content plan tracks website pages and whether they are indexed. Backlink workflows only count a placement when its live URL is verified.",
          "Search Console supplies clicks and impressions, while approved authority and AI-visibility sources add context without replacing verified search performance.",
        ],
      },
      {
        heading: "What the report does not claim",
        paragraphs: [
          "MentionMyApp does not promise every page will rank or be indexed. It does not invent metrics for disconnected providers, and it does not pretend content volume repairs a broken crawl foundation.",
        ],
        bullets: [
          "Crawl and status-code issues come before content scale.",
          "Trust and source proof help people and AI systems understand the business.",
          "Only verified placements count as live backlinks.",
          "Recommendations are prioritized so the next step is visible.",
        ],
      },
      {
        heading: "The improvement loop",
        paragraphs: [
          "The first report establishes a baseline. After fixes and website pages ship, teams watch indexed pages, impressions, clicks, authority and conversions, then improve the pages already showing demand.",
          "The loop is simple: audit, fix, publish to the website, measure and improve.",
        ],
      },
    ],
  },
  {
    key: "data-deletion",
    path: "/data-deletion",
    title: "Data Deletion Instructions",
    description:
      "How to disconnect website integrations and delete your MentionMyApp account and data.",
    eyebrow: "Data deletion",
    summary:
      "Disconnect an individual website or search integration, or request deletion of your entire account.",
    sections: [
      {
        heading: "Disconnect an integration",
        paragraphs: [
          "Sign in, open Connections and remove the website, repository or search connection. You can also revoke authorization directly from that provider’s security settings.",
          "Disconnecting removes active access. Historical audit and publishing records are deleted with the account or sooner on verified request.",
        ],
      },
      {
        heading: "Delete your account",
        paragraphs: [
          "Open Settings and choose Delete account when that control is available, or email privacy@mentionmyapp.com from the account email with the subject Delete my data.",
          "We verify the request and confirm completion by email.",
        ],
      },
      {
        heading: "What gets deleted",
        paragraphs: [
          "Within 30 days we delete the customer records below. We may retain billing records required by law and minimal security or fraud-prevention logs for no longer than necessary.",
        ],
        bullets: [
          "Account, profile and workspace information",
          "Audit history, analytics mappings and saved content-plan records",
          "Uploaded content assets and rendered files",
          "Website, repository and search-connection records, including encrypted credentials",
        ],
      },
      {
        heading: "Published website content",
        paragraphs: [
          "Deleting MentionMyApp data does not remove pages already published to a website you control. Remove those pages through the website or CMS if desired.",
        ],
      },
      {
        heading: "Questions",
        paragraphs: [
          "Email privacy@mentionmyapp.com and review the Privacy Policy and Terms of Service.",
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
