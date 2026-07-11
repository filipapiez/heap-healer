export const SITE_NAME = "MentionMyApp";
export const SITE_DOMAIN = "MentionMyApp.com";
export const SITE_URL = "https://mentionmyapp.com";
export const SEO_PAGE_COUNT = 1000;
export const SEO_LAST_UPDATED = "2026-07-10";

type Builder = {
  slug: string;
  name: string;
  stackSignal: string;
  commonFailure: string;
  fixFocus: string;
};

type Vertical = {
  slug: string;
  name: string;
  buyerMoment: string;
  trustSignal: string;
  localSignal: string;
  contentNeed: string;
};

type Intent = {
  slug: string;
  label: string;
  titleNoun: string;
  h1Prefix: string;
  searchIntent: string;
  outcome: string;
  auditFocus: string;
};

export type SeoPage = {
  index: number;
  slug: string;
  title: string;
  description: string;
  canonicalUrl: string;
  builder: Builder;
  vertical: Vertical;
  intent: Intent;
  keyword: string;
  estimatedScore: number;
};

export type SeoSection = {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type SeoFaq = {
  question: string;
  answer: string;
};

export type SeoArticle = {
  summary: string;
  sections: SeoSection[];
  faqs: SeoFaq[];
  wordCount: number;
};

const builders: Builder[] = [
  {
    slug: "lovable",
    name: "Lovable",
    stackSignal: "AI-generated React apps, SPA routing, app shells, and fast visual iteration",
    commonFailure: "soft 404s, duplicate app shells, thin metadata, and auth routes that look indexable",
    fixFocus: "hard indexability rules, route-level metadata, canonical discipline, and a sitemap that only includes pages worth indexing",
  },
  {
    slug: "vercel",
    name: "Vercel",
    stackSignal: "Next.js, React, edge deployments, serverless functions, and fast preview URLs",
    commonFailure: "preview-domain leakage, duplicate host versions, missing noindex rules, and programmatic pages without enough unique value",
    fixFocus: "production-domain canonicals, clean redirects, metadata templates, and server-rendered pages for important search paths",
  },
  {
    slug: "webflow",
    name: "Webflow",
    stackSignal: "visual CMS pages, marketing sites, collections, and designer-owned landing pages",
    commonFailure: "beautiful pages with weak heading hierarchy, bloated scripts, duplicate collection templates, and missing service intent",
    fixFocus: "collection-level SEO templates, internal links, schema, service pages, and conversion proof above the fold",
  },
  {
    slug: "wordpress",
    name: "WordPress",
    stackSignal: "themes, plugins, content-heavy sites, local service pages, and blog archives",
    commonFailure: "plugin conflicts, tag/archive bloat, slow pages, duplicate URLs, and old content competing with new landing pages",
    fixFocus: "index pruning, Core Web Vitals, structured data, canonical cleanup, and better topical clusters",
  },
  {
    slug: "shopify",
    name: "Shopify",
    stackSignal: "collections, products, variants, ecommerce filters, reviews, and merchandising pages",
    commonFailure: "thin collection copy, duplicate product variants, faceted URL bloat, and missing comparison/category content",
    fixFocus: "collection intent, canonical filters, product schema, review proof, and category pages that answer buying questions",
  },
  {
    slug: "framer",
    name: "Framer",
    stackSignal: "polished visual landing pages, animation, templates, and startup marketing sites",
    commonFailure: "thin body copy, vague H1s, missing trust pages, and one-page sites trying to rank for too many queries",
    fixFocus: "clear search pages, crawlable copy, canonical setup, trust pages, and use-case pages that go beyond the homepage",
  },
  {
    slug: "wix",
    name: "Wix",
    stackSignal: "small business websites, local pages, visual builders, and owner-managed content",
    commonFailure: "weak local intent, inconsistent page titles, missing GBP alignment, and service pages with little unique proof",
    fixFocus: "local landing pages, GBP consistency, service schema, trust signals, and practical internal linking",
  },
  {
    slug: "squarespace",
    name: "Squarespace",
    stackSignal: "portfolio sites, service businesses, creative brands, and brochure-style pages",
    commonFailure: "pretty pages with vague copy, missing service depth, weak local signals, and no content moat",
    fixFocus: "service-specific URLs, better copy depth, local trust, image alt text, and FAQ sections that match search behavior",
  },
  {
    slug: "react",
    name: "React",
    stackSignal: "custom SPAs, dashboards, client-side routing, component systems, and authenticated apps",
    commonFailure: "Google seeing the same shell on many URLs, client-only metadata, blank initial HTML, and crawl traps",
    fixFocus: "SSR or prerendering, route-aware metadata, noindex boundaries, real 404s, and clear public/app separation",
  },
  {
    slug: "nextjs",
    name: "Next.js",
    stackSignal: "server rendering, app router pages, API routes, and scalable programmatic SEO",
    commonFailure: "dynamic pages with duplicate templates, stale sitemaps, bad canonicals, and no quality threshold for generated URLs",
    fixFocus: "indexable server pages, unique content modules, sitemap partitioning, schema, and canonical rules by route type",
  },
];

const verticals: Vertical[] = [
  {
    slug: "saas-startups",
    name: "SaaS startups",
    buyerMoment: "trying to turn a launch, feature release, or funding story into search demand",
    trustSignal: "clear product positioning, security basics, founder proof, comparison pages, and customer outcomes",
    localSignal: "usually lighter than product/entity signals unless the product serves a local market",
    contentNeed: "use-case pages, competitor pages, integration pages, docs, and proof-led blog posts",
  },
  {
    slug: "ai-tools",
    name: "AI tools",
    buyerMoment: "needing to prove the product is more than a generic wrapper or vague automation claim",
    trustSignal: "workflow examples, data/privacy notes, before-and-after output, citations, and methodology",
    localSignal: "less important than entity clarity, source mentions, and AI answer readiness",
    contentNeed: "AEO/GEO pages, comparison pages, prompts/workflows, methodology, and transparent limitations",
  },
  {
    slug: "mobile-apps",
    name: "mobile apps",
    buyerMoment: "trying to convert searchers into installs before paid acquisition gets too expensive",
    trustSignal: "ratings, screenshots, use cases, release notes, privacy policy, and support pages",
    localSignal: "important when the app serves cities, venues, services, or local communities",
    contentNeed: "feature pages, app store support pages, comparisons, problem pages, and review-led content",
  },
  {
    slug: "local-service-businesses",
    name: "local service businesses",
    buyerMoment: "needing calls, quote requests, reviews, and map-pack visibility in a specific service area",
    trustSignal: "reviews, service proof, license/insurance notes, photos, team pages, and clear contact paths",
    localSignal: "GBP consistency, service-area pages, NAP accuracy, review velocity, and local citations",
    contentNeed: "service pages, city pages, pricing explainers, FAQs, before/after examples, and review responses",
  },
  {
    slug: "roofers",
    name: "roofers",
    buyerMoment: "homeowners comparing emergency repair, replacement, inspection, and storm-damage options",
    trustSignal: "project photos, service area, warranties, insurance help, reviews, and crew credibility",
    localSignal: "GBP services, photos, review recency, service areas, and neighborhood landing pages",
    contentNeed: "roof repair pages, replacement guides, storm pages, financing pages, and city-level service URLs",
  },
  {
    slug: "dentists",
    name: "dentists",
    buyerMoment: "patients comparing nearby providers, insurance fit, emergency care, and cosmetic treatments",
    trustSignal: "provider bios, reviews, accepted insurance, treatment pages, safety standards, and appointment clarity",
    localSignal: "GBP categories, reviews, service listings, location pages, photos, and local medical trust signals",
    contentNeed: "treatment pages, insurance pages, emergency pages, location pages, and patient FAQs",
  },
  {
    slug: "restaurants",
    name: "restaurants",
    buyerMoment: "diners looking for a nearby place, menu proof, hours, photos, and reservation confidence",
    trustSignal: "menu pages, photos, reviews, hours, location details, dietary notes, and reservation links",
    localSignal: "GBP photos, menu sync, review replies, opening hours, posts, and map-pack consistency",
    contentNeed: "menu pages, event pages, neighborhood pages, catering pages, and best-of local pages",
  },
  {
    slug: "gyms",
    name: "gyms",
    buyerMoment: "people comparing memberships, trainers, class schedules, location, and motivation fit",
    trustSignal: "class pages, trainer bios, photos, reviews, pricing clarity, and transformation proof",
    localSignal: "GBP reviews, photos, services, class posts, local landing pages, and consistent hours",
    contentNeed: "class pages, trainer pages, pricing pages, beginner guides, and neighborhood workout pages",
  },
  {
    slug: "med-spas",
    name: "med spas",
    buyerMoment: "clients comparing treatments, safety, provider credibility, pricing, and before/after proof",
    trustSignal: "treatment pages, provider credentials, before/after galleries, reviews, and safety language",
    localSignal: "GBP services, treatment photos, location trust, review replies, and category consistency",
    contentNeed: "treatment pages, contraindication FAQs, provider bios, pricing ranges, and local service pages",
  },
  {
    slug: "law-firms",
    name: "law firms",
    buyerMoment: "people comparing legal help during a stressful, high-intent decision",
    trustSignal: "practice-area pages, attorney bios, case context, disclaimers, reviews, and consultation paths",
    localSignal: "GBP categories, practice area alignment, reviews, office pages, and local citations",
    contentNeed: "practice-area pages, city pages, FAQ pages, attorney pages, and case-type explainers",
  },
  {
    slug: "real-estate-agents",
    name: "real estate agents",
    buyerMoment: "buyers and sellers comparing local expertise, listings, neighborhoods, and trust",
    trustSignal: "neighborhood knowledge, reviews, transaction proof, listings, bios, and market updates",
    localSignal: "GBP reviews, office/service-area consistency, local photos, and neighborhood page depth",
    contentNeed: "neighborhood pages, seller guides, buyer guides, market reports, and listing explainers",
  },
  {
    slug: "ecommerce-stores",
    name: "ecommerce stores",
    buyerMoment: "shoppers comparing product categories, brands, reviews, shipping, and alternatives",
    trustSignal: "reviews, product schema, shipping/returns clarity, collection copy, and comparison content",
    localSignal: "important when stores have pickup, showrooms, or local inventory",
    contentNeed: "collection pages, product guides, comparison pages, gift guides, and buying guides",
  },
  {
    slug: "shopify-brands",
    name: "Shopify brands",
    buyerMoment: "trying to grow organic revenue without relying only on paid social or marketplaces",
    trustSignal: "collection depth, reviews, product schema, return policy, delivery proof, and category authority",
    localSignal: "depends on retail locations, local pickup, and region-specific delivery",
    contentNeed: "collection hubs, comparison pages, product education, gift guides, and review-led content",
  },
  {
    slug: "agencies",
    name: "agencies",
    buyerMoment: "needing a repeatable audit, reporting, and fulfillment process for clients",
    trustSignal: "case studies, process pages, deliverables, pricing clarity, reviews, and reporting examples",
    localSignal: "important for local agencies selling city-specific marketing services",
    contentNeed: "service pages, industry pages, case studies, audit templates, and comparison pages",
  },
  {
    slug: "coaches",
    name: "coaches",
    buyerMoment: "prospects comparing expertise, proof, fit, pricing, and transformation claims",
    trustSignal: "bio proof, testimonials, program pages, FAQs, outcomes, and ethical disclaimers",
    localSignal: "important for in-person coaches, gyms, clinics, and local workshops",
    contentNeed: "program pages, niche pages, testimonials, method pages, and answer-led blog posts",
  },
  {
    slug: "contractors",
    name: "contractors",
    buyerMoment: "property owners comparing price, availability, trust, examples, and service area",
    trustSignal: "project photos, reviews, licensing, insurance, warranties, and fast contact options",
    localSignal: "GBP services, service areas, photos, review responses, and city pages",
    contentNeed: "service pages, project pages, city pages, cost guides, and maintenance FAQs",
  },
  {
    slug: "clinics",
    name: "clinics",
    buyerMoment: "patients comparing treatment availability, safety, location, insurance, and provider trust",
    trustSignal: "provider bios, treatment pages, reviews, insurance details, accessibility, and compliance language",
    localSignal: "GBP categories, services, reviews, hours, appointment links, and local healthcare citations",
    contentNeed: "condition pages, treatment pages, provider pages, location pages, and patient FAQs",
  },
  {
    slug: "salons",
    name: "salons",
    buyerMoment: "clients comparing nearby stylists, services, prices, photos, availability, and reviews",
    trustSignal: "service pages, stylist bios, before/after photos, reviews, booking links, and price ranges",
    localSignal: "GBP photos, service menu, review replies, local categories, and opening hours",
    contentNeed: "service pages, stylist pages, gallery pages, neighborhood pages, and trend guides",
  },
  {
    slug: "travel-businesses",
    name: "travel businesses",
    buyerMoment: "travelers comparing itineraries, local expertise, safety, reviews, and booking confidence",
    trustSignal: "itinerary pages, destination proof, reviews, policies, photos, and local expertise",
    localSignal: "GBP matters for tour operators, agencies, attractions, and local travel services",
    contentNeed: "destination pages, itinerary pages, travel guides, comparison pages, and seasonal content",
  },
  {
    slug: "home-services",
    name: "home services",
    buyerMoment: "homeowners searching for urgent help, quote confidence, service proof, and nearby availability",
    trustSignal: "reviews, before/after photos, service guarantees, technician proof, and easy contact paths",
    localSignal: "GBP categories, service areas, reviews, photos, posts, and citation consistency",
    contentNeed: "service pages, emergency pages, cost guides, city pages, and maintenance explainers",
  },
];

const intents: Intent[] = [
  {
    slug: "seo-audit",
    label: "SEO audit",
    titleNoun: "SEO Audit",
    h1Prefix: "SEO audit for",
    searchIntent: "someone wants a plain-English report showing what is broken, what is working, and what it will cost to fix",
    outcome: "a prioritized technical and content roadmap that can be handed to a developer, agency, or founder",
    auditFocus: "metadata, canonicals, headings, trust pages, internal links, sitemap quality, soft 404s, and search-intent coverage",
  },
  {
    slug: "indexing-fix",
    label: "indexing fix",
    titleNoun: "Indexing Fix",
    h1Prefix: "Indexing fix for",
    searchIntent: "someone has pages that are discovered but not indexed, crawled but ignored, or shown as duplicate/soft 404",
    outcome: "a cleaner sitemap, real status codes, noindex boundaries, canonical cleanup, and pages that deserve indexing",
    auditFocus: "robots, sitemap URLs, app shells, route status codes, duplicate hosts, noindex tags, canonical targets, and thin pages",
  },
  {
    slug: "google-business-profile-audit",
    label: "Google Business Profile audit",
    titleNoun: "Google Business Profile Audit",
    h1Prefix: "Google Business Profile audit for",
    searchIntent: "someone wants better local visibility from GBP, reviews, posts, calls, directions, and map-pack trust",
    outcome: "a GBP-to-website alignment plan that improves local proof and connects profile activity to crawlable pages",
    auditFocus: "GBP categories, reviews, posts, services, profile links, local pages, NAP consistency, and service-area proof",
  },
  {
    slug: "ai-visibility-audit",
    label: "AI visibility audit",
    titleNoun: "AI Visibility Audit",
    h1Prefix: "AI visibility audit for",
    searchIntent: "someone wants to know whether ChatGPT, Gemini, Claude, Perplexity, and AI search systems can understand the brand",
    outcome: "clear entity signals, citation-friendly pages, structured data, source pages, FAQs, and answer-ready summaries",
    auditFocus: "schema, llms.txt, source clarity, methodology pages, FAQs, comparison pages, author/entity signals, and citations",
  },
  {
    slug: "technical-seo-cleanup",
    label: "technical SEO cleanup",
    titleNoun: "Technical SEO Cleanup",
    h1Prefix: "Technical SEO cleanup for",
    searchIntent: "someone knows the site has messy implementation details and wants the obvious problems fixed before content work",
    outcome: "a stable technical foundation with fewer crawl traps, cleaner page templates, and better search quality signals",
    auditFocus: "server responses, redirects, page speed, duplicate URLs, metadata templates, structured data, crawl depth, and route hygiene",
  },
];

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => (word.length <= 3 ? word : `${word[0]?.toUpperCase()}${word.slice(1)}`))
    .join(" ");
}

function createSeoPages(): SeoPage[] {
  const pages: SeoPage[] = [];

  for (const intent of intents) {
    for (const builder of builders) {
      for (const vertical of verticals) {
        const index = pages.length;
        const slug = `${builder.slug}-${intent.slug}-for-${vertical.slug}`;
        const title = `${builder.name} ${intent.titleNoun} for ${titleCase(vertical.name)}`;
        const keyword = `${builder.name} ${intent.label} for ${vertical.name}`;
        const estimatedScore = 3 + ((index * 7) % 58) / 10;
        const description = [
          `${SITE_NAME} guide to ${keyword}.`,
          `Use the golden audit template to find indexing issues, GBP gaps, AEO/GEO weaknesses, and fixes that matter for ${vertical.name}.`,
        ].join(" ");

        pages.push({
          index,
          slug,
          title,
          description,
          canonicalUrl: `${SITE_URL}/resources/${slug}`,
          builder,
          vertical,
          intent,
          keyword,
          estimatedScore: Number(estimatedScore.toFixed(1)),
        });
      }
    }
  }

  return pages;
}

export const seoPages = createSeoPages();
export const seoPageBySlug = new Map(seoPages.map((page) => [page.slug, page]));

export function getSeoPage(slug: string) {
  return seoPageBySlug.get(slug);
}

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function countArticleWords(article: Omit<SeoArticle, "wordCount">) {
  const sectionWords = article.sections.reduce((total, section) => {
    const paragraphWords = section.paragraphs.reduce((sum, paragraph) => sum + words(paragraph), 0);
    const bulletWords = (section.bullets ?? []).reduce((sum, bullet) => sum + words(bullet), 0);
    return total + words(section.heading) + words(section.eyebrow) + paragraphWords + bulletWords;
  }, 0);
  const faqWords = article.faqs.reduce(
    (total, faq) => total + words(faq.question) + words(faq.answer),
    0,
  );
  return words(article.summary) + sectionWords + faqWords;
}

export function buildSeoArticle(page: SeoPage): SeoArticle {
  const { builder, vertical, intent } = page;
  const product = SITE_NAME;
  const shortTarget = `${builder.name} ${intent.label} for ${vertical.name}`;

  const summary = `${page.title} is a long-form golden-template guide for teams that need more than a surface-level SEO score. It explains the search intent, the technical failure patterns that show up on ${builder.name} sites, the local and AI visibility signals ${vertical.name} need, and the exact order of fixes that should happen before anyone buys more content or ads.`;

  const sections: SeoSection[] = [
    {
      eyebrow: "Step 1",
      heading: `Direct answer for ${shortTarget}`,
      paragraphs: [
        `A proper ${intent.label} should tell ${vertical.name} what is broken, what is already working, and which fixes deserve attention first. The goal is not to produce a pretty PDF full of generic advice. The goal is to turn a messy website into a short operational plan: which pages should be indexed, which URLs should be removed or noindexed, which page templates need better metadata, and which trust signals are missing from the path between search result and conversion.`,
        `For ${builder.name} sites, that matters because the stack itself creates recognizable patterns. The good news is speed: teams can launch, iterate, and redesign quickly. The bad news is that fast builds often ship with ${builder.commonFailure}. A golden-template audit looks past the visual design and checks whether Google, AI search systems, and local discovery surfaces can understand the site without guessing. If they cannot, more content will only multiply the same weakness.`,
      ],
      bullets: [
        `Primary target keyword: ${page.keyword}.`,
        `Audience: ${vertical.name}.`,
        `Core outcome: ${intent.outcome}.`,
        `Stack risk: ${builder.commonFailure}.`,
      ],
    },
    {
      eyebrow: "Step 2",
      heading: "What the searcher actually wants",
      paragraphs: [
        `The searcher behind this page is usually not looking for a textbook explanation of SEO. They are trying to solve a practical problem. Maybe Search Console says pages are discovered but not indexed. Maybe the homepage ranks for the brand but no service page ranks for buyer intent. Maybe a Google Business Profile gets impressions but not calls. Maybe an AI answer mentions competitors and ignores the brand. In each case, the searcher wants a diagnosis they can act on immediately.`,
        `The page should therefore answer the decision before it sells the product. Explain what a serious audit should include, why ${builder.name} changes the checklist, and how ${vertical.name} should judge whether the fix is worth paying for. The reader should leave with a clear sense of whether they have a technical problem, a content-depth problem, a local trust problem, an entity problem, or all of them at once.`,
      ],
      bullets: [
        "Name the likely symptom in the first screen.",
        "Explain the business impact before listing technical terms.",
        "Separate must-fix crawl issues from nice-to-have content improvements.",
        "Give the reader a cost range and a practical order of operations.",
      ],
    },
    {
      eyebrow: "Step 3",
      heading: `Why ${builder.name} changes the audit`,
      paragraphs: [
        `${builder.name} is useful because it helps teams ship. That speed is exactly why audits need to be stricter. Pages can look finished while the underlying SEO surface is still shallow. A crawler may see the same shell across routes, a sitemap may include pages that should never be indexed, and a beautiful section may have no crawlable copy that explains the offer. The stack does not make SEO impossible, but it changes what should be checked first.`,
        `The golden template starts with ${builder.stackSignal}, then checks the risk that usually follows: ${builder.commonFailure}. The fix is not to rebuild everything from scratch. The fix is ${builder.fixFocus}. When that foundation is in place, content has a chance to rank because each page is connected to a real URL, a real intent, and a real quality threshold.`,
      ],
    },
    {
      eyebrow: "Step 4",
      heading: `The ${vertical.name} trust layer`,
      paragraphs: [
        `${vertical.name} need trust before they need scale. The exact proof depends on the market, but the pattern is consistent: the page must show why the business is real, why the offer is credible, and why the visitor should choose this provider instead of returning to search. For this audience, the buying moment is ${vertical.buyerMoment}. A generic homepage rarely covers that moment with enough specificity to rank or convert.`,
        `The audit should look for ${vertical.trustSignal}. If those signals are missing, the site may still get impressions, but the click will be fragile. Google can see weak engagement, AI systems have fewer facts to cite, and visitors have fewer reasons to believe the brand. Trust content is not fluff. It is part of the ranking and conversion system because it makes the business easier to evaluate.`,
      ],
      bullets: [
        `Buyer moment: ${vertical.buyerMoment}.`,
        `Trust proof: ${vertical.trustSignal}.`,
        `Content need: ${vertical.contentNeed}.`,
      ],
    },
    {
      eyebrow: "Step 5",
      heading: "Technical crawl and status-code checks",
      paragraphs: [
        `The first hard check is whether the website returns the right status for the right URL. A real page should return 200. A missing page should return 404. A moved page should redirect once to the final canonical version. This sounds basic, but many modern sites fail here. Random fake URLs return the homepage with a 200 status. App routes return public shells. HTTP, HTTPS, www, and non-www versions compete with each other. Those mistakes create noise before content quality is even considered.`,
        `For ${shortTarget}, the audit should test fake URLs, host variants, sitemap URLs, app and login paths, canonical targets, robots directives, and noindex boundaries. If the site is using ${builder.name}, pay special attention to public route behavior. The visual router can make every path appear valid to a browser while search systems treat those paths as duplicates, soft 404s, or low-value pages. Fix that before building hundreds of new URLs.`,
      ],
      bullets: [
        "Check www/non-www and HTTP/HTTPS consolidation.",
        "Check random fake URLs for hard 404 behavior.",
        "Check app, login, dashboard, account, and admin routes.",
        "Check whether sitemap URLs resolve cleanly without redirects.",
      ],
    },
    {
      eyebrow: "Step 6",
      heading: "Indexing and sitemap quality",
      paragraphs: [
        `A sitemap is not a wishlist. It should only list URLs that deserve discovery and indexing. For ${vertical.name}, that means pages with a clear purpose: service pages, location pages, treatment pages, product category pages, comparison pages, methodology pages, or specific problem pages. If the sitemap is tiny, Google may not discover enough surface area. If the sitemap is huge and low quality, Google may crawl more but trust less.`,
        `The audit should sample sitemap URLs and ask four questions. Do they return 200? Are they canonical to themselves? Do they have unique titles and descriptions? Do they contain enough crawlable text to satisfy intent? If the answer is no, the fix is not simply resubmitting the sitemap. The fix is to remove junk, strengthen weak pages, and submit a smaller set of URLs that can survive manual inspection.`,
      ],
      bullets: [
        "Remove auth, dashboard, payment, and duplicate utility URLs from sitemaps.",
        "Keep only canonical, indexable, useful pages.",
        "Sample sitemap pages for missing titles, noindex tags, and duplicate content.",
        "Use Search Console to compare submitted, discovered, indexed, and excluded URLs.",
      ],
    },
    {
      eyebrow: "Step 7",
      heading: "On-page quality and the first-screen test",
      paragraphs: [
        `The first screen should make the page topic obvious. A visitor should know what the business does, who it helps, where it operates if location matters, and what action to take. Search systems need the same clarity. A vague H1, a short meta description, missing H2 structure, and low word count are not small details when every competitor is also fighting for attention. They are signs that the page may not deserve to rank yet.`,
        `For ${shortTarget}, inspect title length, meta description length, H1 specificity, H2 structure, image alt text, internal links, and body copy depth. A strong page does not need to be bloated, but it should have enough substance to answer the query. For ${vertical.name}, that usually means a clear offer, proof, FAQs, trust sections, and links to related service or support pages.`,
      ],
      bullets: [
        "Use one specific H1, not a generic welcome line.",
        "Write a meta description that explains the offer and audience.",
        "Use H2s for problems, proof, process, pricing, and FAQs.",
        "Add internal links to pages that help the visitor decide.",
      ],
    },
    {
      eyebrow: "Step 8",
      heading: "Google Business Profile and local proof",
      paragraphs: [
        `For many ${vertical.name}, Google Business Profile is not optional. It is where calls, directions, reviews, photos, services, and local trust signals collect. The website and GBP should reinforce each other. If the profile says one thing and the website says another, local visibility weakens. If the website has no service pages that match the profile, the business gives Google fewer reasons to connect map intent with organic intent.`,
        `The local layer should check ${vertical.localSignal}. The audit should also inspect whether the website links to the profile, whether profile services match crawlable pages, whether reviews are answered, whether posts are active, and whether photos prove the business is alive. GBP metrics such as views, calls, directions, website clicks, reviews, and unanswered questions should sit next to technical SEO metrics because local discovery is not only a website problem.`,
      ],
      bullets: [
        "Map GBP services to real website pages.",
        "Track calls, website clicks, direction requests, reviews, and profile views.",
        "Use posts and photos to keep the profile active.",
        "Answer reviews and questions with language that reinforces services and location.",
      ],
    },
    {
      eyebrow: "Step 9",
      heading: "AEO and GEO readiness",
      paragraphs: [
        `Search is no longer only ten blue links. AI answers, summary engines, and recommendation systems need entity clarity. They need to know what the business is, who it serves, what evidence supports it, and what sources confirm it. AEO and GEO do not replace SEO, but they expose weak SEO faster. If a site has no methodology page, no FAQs, no structured data, no source pages, and no clear comparisons, AI systems have little to cite.`,
        `For ${vertical.name}, the audit should check Organization, LocalBusiness, Product, Service, FAQ, Article, and Review schema where appropriate. It should also look for llms.txt or a similar AI context file, but that file is only a supplement. The stronger signal is crawlable, factual content that answers real questions. The golden template builds those answers into every important page so AI systems do not have to infer the basics.`,
      ],
      bullets: [
        "Add structured data that matches the actual business model.",
        "Create FAQs that answer buying objections, not filler questions.",
        "Publish methodology, process, pricing, or comparison pages where useful.",
        "Make the brand/entity easy to summarize in one paragraph.",
      ],
    },
    {
      eyebrow: "Step 10",
      heading: "Content depth and internal linking",
      paragraphs: [
        `Content depth does not mean publishing random blog posts. It means building pages that match the decisions people make before contacting, buying, booking, or installing. For ${vertical.name}, the content plan should prioritize ${vertical.contentNeed}. Each page should answer a specific query and link to the next logical step. If the homepage is the only meaningful URL, the site is asking one page to rank for every intent, which rarely works.`,
        `Internal links are how the site explains its own importance. A page about ${page.keyword} should link to the audit tool, GBP connection flow, examples, related pages, and any service pages that support the claim. Related pages should link back using descriptive anchors. This helps crawlers discover the structure and helps users move through the decision without bouncing back to Google.`,
      ],
      bullets: [
        "Build service, use-case, problem, comparison, and FAQ pages.",
        "Link related pages together by intent and audience.",
        "Use descriptive anchors instead of generic “learn more” links everywhere.",
        "Improve pages with impressions but low CTR before writing unrelated posts.",
      ],
    },
    {
      eyebrow: "Step 11",
      heading: "The golden audit template",
      paragraphs: [
        `The golden template is simple but strict: direct answer, search intent, stack diagnosis, trust layer, technical crawl checks, indexing plan, on-page fixes, GBP proof, AEO/GEO readiness, content plan, implementation roadmap, cost range, measurement plan, and FAQs. Each section exists because it answers a real objection. If a page cannot fill one of those sections with useful detail, the business probably needs more proof before scaling SEO.`,
        `This template also keeps the report honest. It separates what is actually broken from what would be nice to have. It does not pretend that a tool can guarantee rankings. It shows the customer why they may need a developer, an SEO specialist, a content person, or a GBP operator. That is why it works well for sales: it makes the problem visible without hiding the effort required to fix it.`,
      ],
      bullets: [
        "Start with the blunt diagnosis.",
        "Show what is good before listing what is broken.",
        "Group fixes by technical, content, local, and AI visibility.",
        "End with priority, owner, and estimated cost.",
      ],
    },
    {
      eyebrow: "Step 12",
      heading: "Implementation roadmap",
      paragraphs: [
        `The first week should focus on crawl hygiene: redirects, canonicals, fake URL behavior, robots, sitemap cleanup, noindex boundaries, and app route separation. The second phase should improve the highest-intent pages: homepage, service pages, pricing, about, contact, privacy, terms, FAQs, and any local or product category pages. The third phase should expand content only after the technical foundation is stable.`,
        `For ${builder.name}, implementation should be practical. Some fixes belong in hosting, some in route configuration, some in metadata templates, and some in content. If the platform cannot return true 404s or server-rendered metadata, the plan should say so. Pretending a limitation does not exist wastes money. The roadmap should recommend the cleanest fix available on the current stack, then explain when moving hosting or framework is worth it.`,
      ],
      bullets: [
        "Week 1: crawl, status, canonical, sitemap, robots, and noindex cleanup.",
        "Week 2: homepage, trust pages, service pages, GBP alignment, and schema.",
        "Week 3: content clusters, internal links, FAQs, and comparison pages.",
        "Month 2+: improve pages with impressions, conversions, or local proof gaps.",
      ],
    },
    {
      eyebrow: "Step 13",
      heading: "Cost and owner clarity",
      paragraphs: [
        `A useful audit should say who needs to do the work. Some fixes are developer tasks: routing, status codes, sitemap generation, metadata components, and server rendering. Some are SEO tasks: query mapping, title rewrites, internal links, schema, and Search Console validation. Some are operator tasks: GBP posts, review replies, photos, service updates, and proof collection. Blending all of that into one vague recommendation makes the report harder to act on.`,
        `For a typical ${shortTarget}, a small cleanup may cost a few hundred dollars. A deeper technical and content pass may cost $800 to $2,500. A full local/AEO/GEO system with content, GBP operations, and developer fixes can cost more. The important part is not the exact price. The important part is sequencing. Do not buy 50 blog posts while fake URLs return 200, trust pages are missing, and the sitemap is full of junk.`,
      ],
      bullets: [
        "Assign every fix to developer, SEO, content, GBP, or founder/operator.",
        "Fix crawl/indexing issues before scaling content.",
        "Pay for quality cleanup before paying for volume.",
        "Keep a visible cost range so the customer understands the work.",
      ],
    },
    {
      eyebrow: "Step 14",
      heading: "Measurement and reporting",
      paragraphs: [
        `The report should not end when fixes are shipped. It should define what to watch next: indexed pages, impressions, clicks, average position, CTR, brand queries, non-brand queries, local actions, GBP calls, direction requests, website clicks, reviews, and conversions. Without measurement, the team cannot tell whether the fix improved visibility or only made the site feel cleaner.`,
        `For ${vertical.name}, reporting should connect technical health with business outcomes. If GBP impressions rise but calls do not, the profile may need better photos, reviews, services, or offers. If impressions rise but CTR stays weak, titles and meta descriptions may need stronger positioning. If pages are indexed but do not rank, the content may need more proof, links, or specificity. Measurement turns the audit into a loop.`,
      ],
      bullets: [
        "Track Search Console coverage, impressions, clicks, CTR, and query changes.",
        "Track GBP views, calls, directions, website clicks, reviews, and unanswered questions.",
        "Track which fixes were shipped and when.",
        "Review winners monthly and add proof to pages already getting impressions.",
      ],
    },
    {
      eyebrow: "Step 15",
      heading: "Final checklist",
      paragraphs: [
        `Before publishing or sending the audit, read it like the customer. Does it explain the problem in plain language? Does it show enough good things to feel fair? Does it list enough bad things to be useful? Does it separate technical fixes from content work? Does it mention GBP and AI visibility when they matter? Does it give a cost range and an order of operations? If not, it is not the golden template yet.`,
        `The final version should feel specific to ${builder.name}, specific to ${vertical.name}, and specific to ${intent.searchIntent}. That specificity is what makes the URL worth indexing. It is also what makes the page useful as a sales asset. The customer should be able to read it, recognize their situation, and understand why fixing the foundation now is cheaper than guessing for another six months.`,
      ],
      bullets: [
        "Confirm one specific URL, one specific audience, and one specific audit intent.",
        "Confirm the article is long enough to answer objections without filler.",
        "Confirm the visual report image matches the page topic.",
        "Confirm the CTA points to the live SEO audit tool.",
      ],
    },
  ];

  const faqs: SeoFaq[] = [
    {
      question: `What should a ${shortTarget} include?`,
      answer: `It should include technical crawl checks, metadata review, sitemap sampling, fake URL testing, canonical validation, trust-page review, internal link review, GBP alignment, structured data checks, AEO/GEO readiness, content-depth analysis, priority fixes, and a cost range. The point is to turn scattered SEO advice into a concrete action plan.`,
    },
    {
      question: `Why does ${builder.name} need a specific audit?`,
      answer: `${builder.name} sites tend to have their own failure patterns: ${builder.commonFailure}. A generic audit may mention titles and descriptions, but it can miss route behavior, app-shell duplication, sitemap quality, and stack limitations. The audit has to match how the site is actually built.`,
    },
    {
      question: `How long should this page be to rank?`,
      answer: `The target range is 2,500 to 3,500 words because the page needs to answer search intent, explain the stack, cover technical SEO, discuss GBP and AI visibility, show a roadmap, and answer objections. The length should serve the reader. Thin doorway pages are not the goal.`,
    },
    {
      question: `Should ${vertical.name} focus on blogs or technical SEO first?`,
      answer: `If the site has soft 404s, missing trust pages, broken canonicals, app routes in the sitemap, or poor GBP alignment, technical and trust cleanup should come first. Blogs help after the site can be crawled, trusted, and internally linked properly. Otherwise new content inherits the same weakness.`,
    },
    {
      question: `How does Google Business Profile fit into the audit?`,
      answer: `GBP matters because local visibility is driven by more than website pages. Reviews, services, profile views, calls, directions, posts, photos, and review replies all affect how a business is evaluated. The website should reinforce those profile signals with matching service pages and local proof.`,
    },
    {
      question: `Can an audit guarantee rankings?`,
      answer: `No. A serious audit can identify blockers, prioritize fixes, and improve the odds that search systems understand the site. Rankings still depend on competition, authority, content quality, local proof, user behavior, and execution. The honest promise is clarity and prioritization, not guaranteed placement.`,
    },
  ];

  const articleWithoutCount = { summary, sections, faqs };

  return {
    ...articleWithoutCount,
    wordCount: countArticleWords(articleWithoutCount),
  };
}

export function relatedSeoPages(page: SeoPage, limit = 6) {
  const sameBuilder = seoPages.filter(
    (candidate) => candidate.slug !== page.slug && candidate.builder.slug === page.builder.slug,
  );
  const sameVertical = seoPages.filter(
    (candidate) => candidate.slug !== page.slug && candidate.vertical.slug === page.vertical.slug,
  );
  const sameIntent = seoPages.filter(
    (candidate) => candidate.slug !== page.slug && candidate.intent.slug === page.intent.slug,
  );
  const combined = [
    ...sameBuilder.slice(0, 2),
    ...sameVertical.slice(0, 2),
    ...sameIntent.slice(0, 4),
  ];
  const unique = new Map(combined.map((candidate) => [candidate.slug, candidate]));
  return [...unique.values()].slice(0, limit);
}

export function pagesByIntent() {
  return intents.map((intent) => ({
    intent,
    pages: seoPages.filter((page) => page.intent.slug === intent.slug),
  }));
}

export function pagesByBuilder() {
  return builders.map((builder) => ({
    builder,
    pages: seoPages.filter((page) => page.builder.slug === builder.slug),
  }));
}

export function featuredSeoPages() {
  const slugs = [
    "lovable-seo-audit-for-saas-startups",
    "vercel-indexing-fix-for-ai-tools",
    "wix-google-business-profile-audit-for-roofers",
    "shopify-technical-seo-cleanup-for-ecommerce-stores",
    "react-ai-visibility-audit-for-mobile-apps",
    "wordpress-seo-audit-for-law-firms",
  ];
  return slugs.map((slug) => getSeoPage(slug)).filter((page): page is SeoPage => Boolean(page));
}

if (seoPages.length !== SEO_PAGE_COUNT) {
  throw new Error(`Expected ${SEO_PAGE_COUNT} SEO pages, generated ${seoPages.length}`);
}
