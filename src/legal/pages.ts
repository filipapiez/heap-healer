import { SITE_NAME, SITE_URL } from "@/seo/pages";

export type TrustPageKey = "about" | "privacy" | "terms" | "contact" | "how-it-works" | "data-deletion";

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
      "How MentionMyApp collects, uses, and protects your information — including connected social accounts, Google user data, Meta platform data, and your rights.",
    eyebrow: "Privacy",
    summary:
      "Effective July 11, 2026. This policy is provided by MentionMyApp (operated by Visionary Pixel, LLC). It explains what information we collect when you use the Service, how we use it, and the choices you have.",
    sections: [
      {
        heading: "Information we collect",
        paragraphs: [
          "Account information — your name, email address, and password (stored as a secure hash), or your Google sign-in identity if you use Google to sign in to MentionMyApp.",
          "Connected social accounts — when you connect a social media account through that platform's official authorization, we receive and store the platform's account identifier, your display name and avatar, and an access token that lets us publish and read engagement on your behalf. Access tokens are encrypted at rest.",
          "Content you create — videos, images, logos, captions, and posts you upload or compose, plus publishing results (post links, statuses, errors) and engagement data (comments, likes, metrics) retrieved from your connected platforms.",
          "Usage and technical data — log data such as IP address, browser type, pages viewed, and actions taken, used for security and to improve the Service.",
          "Payment information — handled entirely by our payment processor (Stripe). We never receive or store full card numbers.",
          "What we never collect: your social media passwords. Connections are made only through each platform's official sign-in (OAuth or, for Bluesky, a revocable app password you can withdraw at any time). We have no ability to see or store the password to any of your social accounts.",
        ],
      },
      {
        heading: "How we use information",
        paragraphs: [
          "We use information to operate the Service — publish your content to the platforms you select, retrieve your posts' performance and comments, and show them in your dashboard.",
          "We also use it to provide support, secure the Service, prevent abuse, and comply with law, and to send service-related emails (receipts, security notices, important product changes). Marketing emails are optional and include an unsubscribe link.",
          "We do not sell your personal information. We do not use your content or your connected accounts' data for advertising.",
        ],
      },
      {
        heading: "Google user data (Limited Use disclosure)",
        paragraphs: [
          "MentionMyApp's use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. Google account data (such as your YouTube channel identity and upload capability) is used only to provide the features you request — connecting your channel and publishing videos you compose — and is never used for advertising, never sold, and never transferred except as necessary to provide those features, for security, or to comply with law.",
          "The Service uses YouTube API Services; by connecting YouTube you also agree to the YouTube Terms of Service and the Google Privacy Policy. You can revoke MentionMyApp's access at any time from your Google security settings at https://security.google.com/settings/security/permissions.",
        ],
      },
      {
        heading: "Meta and other platform data",
        paragraphs: [
          "When you connect Facebook, Instagram, or Threads, we access only the permissions you grant on Meta's consent screen (such as listing your Pages, publishing to your Page or Instagram professional account, and reading engagement on content we publish).",
          "Data received from Meta and other platforms (TikTok, Pinterest, LinkedIn, Reddit, X, Bluesky, Google Business Profile) is used solely to provide the Service's publishing and engagement features, is retained only as long as needed for those features or until you disconnect the account, and is deleted as described in our Data Deletion Instructions. You can revoke access at any time from each platform's security settings or by disconnecting the account in MentionMyApp.",
        ],
      },
      {
        heading: "Sharing and service providers",
        paragraphs: [
          "We share data only with service providers that help us run the Service, under contracts limiting their use of it: cloud hosting and database infrastructure, media storage, payment processing (Stripe), and the social platforms' own APIs when publishing or retrieving engagement at your direction.",
          "We may disclose information if required by law or to protect the rights, safety, or property of users or the Service.",
        ],
      },
      {
        heading: "Data retention and deletion",
        paragraphs: [
          "We keep your data while your account is active. You can delete your account at any time in Settings, or by emailing privacy@mentionmyapp.com.",
          "Deletion removes your account, workspaces, media, drafts, and connected-account records including access tokens within 30 days, except records we must keep for legal, billing, or security purposes. Content already published to social platforms remains on those platforms under your control there. Full details are on the Data Deletion Instructions page.",
        ],
      },
      {
        heading: "Security",
        paragraphs: [
          "We use industry-standard measures including encryption in transit (TLS), encryption of social access tokens at rest, workspace-level access isolation enforced at the database layer, and least-privilege access for our systems.",
          "No method of storage or transmission is 100% secure, but we work to protect your information and will notify affected users of any breach as required by law.",
        ],
      },
      {
        heading: "Your rights, children, and changes",
        paragraphs: [
          "Depending on where you live, you may have rights to access, correct, export, or delete your personal information, and to object to or restrict certain processing. Contact privacy@mentionmyapp.com to exercise them. We do not discriminate against users who exercise privacy rights.",
          "The Service is not directed to anyone under 18, and we do not knowingly collect personal information from anyone under 18. If you believe someone under 18 has provided us personal information, contact us and we will delete it.",
          "We may update this policy. If changes are material we will notify you by email or in the Service before they take effect. The effective date above always shows the current version's date.",
          "MentionMyApp (operated by Visionary Pixel, LLC) · Illinois, USA · privacy@mentionmyapp.com",
        ],
      },
    ],
  },
  {
    key: "terms",
    path: "/terms",
    title: "Terms of Service",
    description:
      "Terms for using MentionMyApp — the Service, workspaces, connected social accounts, content, billing, the 90-Day Ranking Guarantee, and dispute resolution.",
    eyebrow: "Terms",
    summary:
      "Effective July 11, 2026. MentionMyApp is operated by Visionary Pixel, LLC, an Illinois limited liability company (\"we,\" \"us\"). By creating an account or using the Service you agree to these Terms.",
    sections: [
      {
        heading: "The Service",
        paragraphs: [
          "MentionMyApp lets you compose content once and publish it to social media platforms you connect, schedule posts, view engagement (comments, messages, metrics) across your connected accounts, and run SEO audits of your website. Features may change as we improve the Service.",
        ],
      },
      {
        heading: "Your account and workspaces",
        paragraphs: [
          "You must be at least 18 and provide accurate information. You're responsible for activity under your account and for keeping your credentials secure.",
          "Workspaces isolate brands or clients; you're responsible for who you add to your workspaces and the roles you grant them.",
        ],
      },
      {
        heading: "Connecting social accounts",
        paragraphs: [
          "You connect platforms through their official authorization flows and must only connect accounts you own or are authorized to manage.",
          "Your use of each connected platform remains subject to that platform's own terms and policies (including, where applicable, the YouTube Terms of Service and Meta Platform Terms). We publish only what you compose and approve.",
          "Platforms may change or revoke API access, impose limits (for example, Instagram's daily publishing limits), or remove content under their own rules. We are not responsible for platform-side changes, outages, or moderation decisions.",
        ],
      },
      {
        heading: "Your content",
        paragraphs: [
          "You own the content you upload and compose. You grant us a limited license to host, process (including rendering watermarks), and transmit your content to the platforms you select, solely to operate the Service.",
          "You represent that you have the rights to the content you publish — including music, footage, and logos — and that your content and its distribution comply with applicable law and platform rules.",
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: [
          "You agree not to use the Service to: send spam or engage in coordinated inauthentic behavior; infringe intellectual property; post unlawful, deceptive, or harmful content; attempt to access other customers' data; probe or disrupt the Service; or resell the Service without our written agreement.",
          "We may suspend accounts that violate these Terms or put the Service or other users at risk.",
        ],
      },
      {
        heading: "Plans, billing, and cancellation",
        paragraphs: [
          "Paid plans bill in advance on a recurring basis through our payment processor until cancelled. You can cancel anytime in Settings; cancellation stops future charges and the plan runs through the paid period.",
          "Prices and plan limits may change with notice before your next billing cycle. Taxes may apply.",
        ],
      },
      {
        heading: "The 90-Day Ranking Guarantee",
        paragraphs: [
          "The promise: if your website's Google ranking hasn't improved after 90 days of using MentionMyApp on a paid plan, we'll refund the MentionMyApp subscription fees you paid for that 90-day period — and everything already created stays yours: every post published, every backlink earned, every page indexed.",
          "How it's measured: \"Improved\" means your site's average position in Google Search Console for the connected domain is better (a lower number) when comparing the 28-day period ending on day 90 to the 28-day period ending on day 1 of your paid subscription. The guarantee applies to one website domain per workspace, designated when the subscription starts, with Google Search Console access available to verify.",
          "Qualifying use: at least 8 posts published per calendar month through MentionMyApp during the 90 days, to at least 3 connected platforms, each including a link to the designated domain.",
          "To claim: email support@mentionmyapp.com within 14 days after day 90 with your Search Console comparison. Approved refunds are issued to the original payment method within 10 business days.",
          "The guarantee covers MentionMyApp subscription fees only; it doesn't cover third-party costs, and it doesn't apply where posting activity was primarily removed by platforms for policy violations. One claim per customer.",
        ],
      },
      {
        heading: "Disclaimers and limitation of liability",
        paragraphs: [
          "Except for the 90-Day Ranking Guarantee, the Service is provided \"as is\" without warranties of any kind, express or implied. We don't warrant uninterrupted or error-free operation, and — beyond that specific refund promise — we make no guarantee of specific search rankings, traffic, engagement, follower growth, or revenue, which depend on factors outside our control.",
          "To the maximum extent permitted by law, we will not be liable for indirect, incidental, special, consequential, or punitive damages, or lost profits, revenues, or data. Our total liability for any claim relating to the Service is limited to the amounts you paid us in the 12 months before the claim.",
        ],
      },
      {
        heading: "Termination, changes, and contact",
        paragraphs: [
          "You may stop using the Service and delete your account at any time (see our Data Deletion Instructions). We may suspend or terminate accounts for violation of these Terms, with notice where practicable. Sections that by their nature should survive termination survive.",
          "We may update these Terms; material changes will be notified by email or in the Service at least 14 days before taking effect. Continued use after the effective date constitutes acceptance.",
          "These Terms are governed by the laws of the State of Illinois, USA, without regard to conflict-of-law rules. Disputes will be resolved in the state or federal courts located in Cook County, Illinois, and both parties consent to their jurisdiction.",
          "MentionMyApp · Illinois, USA · support@mentionmyapp.com",
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
  {
    key: "data-deletion",
    path: "/data-deletion",
    title: "Data Deletion Instructions",
    description:
      "How to disconnect a connected social account, delete your MentionMyApp account and data, and what we retain for legal or security reasons.",
    eyebrow: "Data deletion",
    summary:
      "This page explains how to disconnect platforms and delete your data from MentionMyApp, what gets deleted, what we may retain, and how Facebook/Instagram deletion requests are handled.",
    sections: [
      {
        heading: "Option 1 — Disconnect a single social account",
        paragraphs: [
          "Sign in to MentionMyApp and open Connected Accounts, then click Disconnect next to the account.",
          "Disconnecting revokes our access and deletes the stored access token for that account. Engagement data already retrieved for your dashboard is deleted with your account, or sooner on request.",
          "You can also revoke MentionMyApp's access directly from the platform's own settings at any time (for example: Facebook/Instagram → Settings → Apps and Websites; Google → Security → Third-party access; Bluesky → App Passwords).",
        ],
      },
      {
        heading: "Option 2 — Delete your entire account and data",
        paragraphs: [
          "Sign in to MentionMyApp and open Settings, then choose Delete account and confirm.",
          "Or email privacy@mentionmyapp.com from your account email with the subject \"Delete my data\" — no account access required. We verify the request and confirm completion by email.",
        ],
      },
      {
        heading: "What gets deleted and what we may retain",
        paragraphs: [
          "Within 30 days of your request we delete the items listed below.",
          "What we may retain: billing records and other information we're legally required to keep, and minimal logs needed for security and fraud prevention, retained no longer than necessary.",
        ],
        bullets: [
          "Your account and profile information",
          "All workspaces, posts, drafts, schedules, and engagement records",
          "All uploaded media (videos, logos) and rendered files",
          "All connected-account records, including encrypted access tokens (revoked and destroyed)",
        ],
      },
      {
        heading: "Content already published to social platforms",
        paragraphs: [
          "Posts that MentionMyApp published to your social accounts live on those platforms under your ownership and are not affected by deleting your MentionMyApp data. Remove them on each platform directly if you wish.",
        ],
      },
      {
        heading: "Facebook / Instagram data deletion requests",
        paragraphs: [
          "If you remove MentionMyApp from your Facebook or Instagram settings, Meta sends us a data deletion request and we delete the data associated with that connection as described above. You can also request deletion using either option on this page.",
        ],
      },
      {
        heading: "Questions",
        paragraphs: [
          "Email privacy@mentionmyapp.com. See also our Privacy Policy and Terms of Service.",
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
