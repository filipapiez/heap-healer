import type { SeoArticle, SeoFaq, SeoPage, SeoSection } from "./pages";

type StackProfile = {
  diagnosis: string;
  checks: string[];
  failures: string[];
  fixes: string[];
  warning: string;
};

type MarketProfile = {
  situation: string;
  hardTruth: string;
  good: string[];
  bad: string[];
  pages: string[];
  proof: string[];
  local: string[];
  ai: string[];
  metrics: string[];
  costs: string[];
};

type IntentProfile = {
  plainEnglish: string;
  evidence: string[];
  priorities: string[];
  reportStyle: string;
  costNote: string;
};

const stackProfiles: Record<string, StackProfile> = {
  lovable: {
    diagnosis:
      "Lovable can make a site look finished before the public route layer is ready for search. The audit has to compare the browser experience with the first HTML response, route metadata, sitemap rules, and error behavior.",
    checks: [
      "unknown URLs returning the app shell",
      "client-only titles and descriptions",
      "auth or dashboard screens leaking into public links",
      "canonical tags that do not follow the route",
      "thin pages generated from the same prompt",
      "noindex tags injected after the initial response",
    ],
    failures: [
      "a polished hero with almost no crawlable explanation",
      "a fake URL that visually shows 404 but still returns 200",
      "feature pages where only the noun changes",
      "marketing pages mixed with app utility routes",
    ],
    fixes: [
      "tighten public routes",
      "write route-aware metadata",
      "remove app screens from the sitemap",
      "add real proof to money pages",
      "document hosting limits honestly",
    ],
    warning:
      "If the host forces SPA fallback, use route-level noindex as a mitigation, but do not pretend it is the same as a hard 404.",
  },
  vercel: {
    diagnosis:
      "Vercel is strong when production domains, dynamic routes, metadata, and preview deployments are controlled. It becomes messy when generated pages outrun the publishing rules.",
    checks: [
      "preview domains indexed by mistake",
      "apex and www versions competing",
      "dynamic routes accepting junk slugs",
      "sitemaps containing staging URLs",
      "server-rendered pages depending on slow API data",
      "canonical logic left over from an old deployment",
    ],
    failures: [
      "a live page canonicalizing to a preview URL",
      "programmatic pages published before copy is unique",
      "old launch pages still indexable after positioning changed",
      "blank states visible before data loads",
    ],
    fixes: [
      "lock canonicals to production",
      "block preview indexing",
      "validate dynamic slugs",
      "server-render important pages",
      "partition sitemaps by page type",
    ],
    warning:
      "Vercel is not usually the problem; loose deployment hygiene and low-quality dynamic URLs are.",
  },
  webflow: {
    diagnosis:
      "Webflow sites often hide weak search intent behind strong visual design. The audit must test CMS templates, headings, body copy, alt text, and service depth.",
    checks: [
      "CMS templates with duplicate titles",
      "visual sections without explanatory text",
      "old campaign pages still indexable",
      "image-heavy pages missing alt text",
      "third-party scripts slowing every template",
      "service pages buried behind brand language",
    ],
    failures: [
      "a case study that never names the service",
      "a location page with no local proof",
      "a collection item where only the client name changes",
      "a category archive competing with the real landing page",
    ],
    fixes: [
      "write CMS SEO rules",
      "add service intent above the fold",
      "caption visual proof",
      "prune archive bloat",
      "tighten heading hierarchy",
    ],
    warning:
      "A beautiful template does not become an indexable asset until the copy proves a specific search intent.",
  },
  wordpress: {
    diagnosis:
      "WordPress gives enough control to fix SEO well and enough plugin surface to create conflicts, archive bloat, duplicate schema, and slow templates.",
    checks: [
      "tag, author, date, and attachment archives",
      "multiple SEO plugins writing metadata",
      "schema markup that contradicts the page",
      "legacy posts still in XML sitemaps",
      "theme bloat hurting Core Web Vitals",
      "category pages outranking service pages",
    ],
    failures: [
      "attachment pages indexed as standalone URLs",
      "old posts ranking for outdated offers",
      "location pages built from copied blocks",
      "plugin schema listing services not on the page",
    ],
    fixes: [
      "remove archive bloat",
      "standardize one metadata source",
      "merge or refresh legacy posts",
      "speed up active templates",
      "link old traffic into money pages",
    ],
    warning:
      "Most WordPress issues are fixable without rebuilding, but plugin conflict has to be diagnosed before content volume.",
  },
  shopify: {
    diagnosis:
      "Shopify SEO depends on collection depth, variant control, review proof, product schema, and guides that connect research intent to buying intent.",
    checks: [
      "variant and filtered collection duplicates",
      "collections with no buying guidance",
      "copied manufacturer descriptions",
      "sold-out products with no alternative path",
      "review schema disconnected from visible reviews",
      "blog posts that never link into collections",
    ],
    failures: [
      "a collection page that is only a product grid",
      "faceted URLs absorbing crawl budget",
      "supplier copy copied across products",
      "empty seasonal collections left live",
    ],
    fixes: [
      "write category buying guidance",
      "canonicalize filters and variants",
      "add comparison modules",
      "connect guides to collections",
      "surface reviews and returns clearly",
    ],
    warning:
      "Shopify can rank well, but every important collection needs shopper guidance, not just inventory.",
  },
  framer: {
    diagnosis:
      "Framer pages can feel premium while leaving search engines with a thin one-page brochure. The audit has to turn design polish into crawlable specificity.",
    checks: [
      "animated sections replacing copy",
      "one-page structures covering too many intents",
      "missing trust and support pages",
      "image text that should be HTML",
      "CMS entries with repeated layouts",
      "generic startup headlines without category terms",
    ],
    failures: [
      "a clever hero that never names the category",
      "case studies that rely on screenshots only",
      "a launch site with no pricing or use-case depth",
      "template pages with no original proof",
    ],
    fixes: [
      "split intent into focused URLs",
      "write clear category copy",
      "add support and trust pages",
      "turn visuals into searchable claims",
      "build use-case pages before broad blogs",
    ],
    warning:
      "Framer is fine for acquisition pages, but SEO needs more than animation and taste.",
  },
  wix: {
    diagnosis:
      "Wix audits usually have to connect owner-managed pages, GBP services, local proof, reviews, titles, and service-area intent.",
    checks: [
      "homepage-only service targeting",
      "page titles repeating the brand name",
      "GBP services without matching URLs",
      "copied city pages",
      "missing review proof near forms",
      "service photos without useful alt text",
    ],
    failures: [
      "one homepage trying to rank for every service",
      "a GBP service absent from the site",
      "city pages with swapped place names only",
      "a contact page hiding service area details",
    ],
    fixes: [
      "create useful service pages",
      "align GBP categories and services",
      "add local photos and reviews",
      "write city pages only with proof",
      "make phone and booking paths obvious",
    ],
    warning:
      "Wix can support local SEO when the site has real service proof instead of generic small-business filler.",
  },
  squarespace: {
    diagnosis:
      "Squarespace sites often under-rank because the design is clean but the service, location, credentials, and project proof are too light.",
    checks: [
      "portfolio pages without service context",
      "galleries missing captions",
      "brand-heavy navigation hiding services",
      "blog archives competing with sales pages",
      "thin local pages with no testimonials",
      "forms appearing before the offer is explained",
    ],
    failures: [
      "a beautiful homepage that never names the buyer problem",
      "a services page with no dedicated URLs",
      "an about page with personality but no credentials",
      "gallery pages search engines cannot understand",
    ],
    fixes: [
      "add dedicated service URLs",
      "caption project examples",
      "turn testimonials into proof sections",
      "answer pricing and fit questions",
      "connect portfolio pages to services",
    ],
    warning:
      "The platform is rarely the blocker; the missing layer is service structure and proof.",
  },
  react: {
    diagnosis:
      "Custom React apps need strict SEO boundaries because client routing can make many URLs look valid while the server sends the same shell.",
    checks: [
      "client-only metadata",
      "SPA fallback accepting fake URLs",
      "dashboard routes linked publicly",
      "blank initial HTML before API data",
      "route params not validated against content",
      "sitemaps disconnected from real routes",
    ],
    failures: [
      "Google receiving the same head tags on many routes",
      "unknown paths showing a branded 404 with status 200",
      "content existing only after hydration",
      "search pages depending on user state",
    ],
    fixes: [
      "server-render or prerender money pages",
      "validate route params",
      "separate public and app screens",
      "generate metadata from page data",
      "return real status codes where possible",
    ],
    warning:
      "React can rank, but a client-only shell needs deliberate indexing rules before programmatic pages are added.",
  },
  nextjs: {
    diagnosis:
      "Next.js gives strong SEO primitives, so duplicate dynamic templates are easier to ship and harder to excuse.",
    checks: [
      "catch-all routes generating unknown slugs",
      "metadata functions missing canonical cases",
      "stale sitemap entries",
      "ISR pages with old titles",
      "thin programmatic pages sharing article bodies",
      "schema copied across route groups",
    ],
    failures: [
      "a dynamic route returning 200 for a fake slug",
      "a huge sitemap where pages differ by one noun",
      "old canonical logic after a domain migration",
      "AI-generated pages published without a uniqueness test",
    ],
    fixes: [
      "gate dynamic pages behind content records",
      "generate metadata and body from one source",
      "split sitemaps by page type",
      "set a content-quality threshold",
      "test representative URLs before submitting all",
    ],
    warning:
      "Next.js is not an SEO guarantee. Publishing rules decide whether the pages deserve indexing.",
  },
};

const marketProfiles: Record<string, MarketProfile> = {
  "saas-startups": {
    situation:
      "SaaS buyers compare categories, alternatives, integrations, pricing, security, and proof before they book a demo or start a trial.",
    hardTruth:
      "Most SaaS pages sound funded but do not explain the job-to-be-done, switching pain, use-case proof, or why the product should be trusted.",
    good: ["clear category language", "security pages", "comparison pages", "role-specific use cases", "customer outcomes"],
    bad: ["vague automation copy", "missing docs or support pages", "feature pages repeating launch copy", "ignored integration intent", "blog posts disconnected from product pages"],
    pages: ["alternative pages", "role workflow pages", "integration pages", "security explainers", "support-question pages"],
    proof: ["workflow screenshots", "security notes", "docs links", "customer quotes", "founder identity"],
    local: ["avoid fake city pages", "build founder/entity proof", "keep company details consistent", "publish real third-party mentions"],
    ai: ["What does the product replace?", "Who is the best-fit user?", "Which integrations are supported?", "What data does it process?"],
    metrics: ["non-brand impressions", "demo requests", "trial starts", "integration page clicks"],
    costs: ["comparison page count", "docs cleanup", "security review", "technical routing"],
  },
  "ai-tools": {
    situation:
      "AI buyers are skeptical. They need examples, constraints, data privacy answers, and proof that the product is more than a wrapper.",
    hardTruth:
      "The phrase AI-powered is weak unless the page shows inputs, outputs, limitations, and why the workflow beats manual work.",
    good: ["sample outputs", "privacy explanations", "workflow demos", "methodology notes", "source citations"],
    bad: ["generic AI claims", "no data handling details", "prompts hidden behind login", "no manual-versus-automated comparison", "overclaims without proof"],
    pages: ["workflow demos", "AI comparison pages", "prompt libraries", "privacy pages", "limitations pages"],
    proof: ["before-and-after output", "process steps", "privacy language", "case examples", "limitation notes"],
    local: ["build entity citations", "connect founder profiles", "keep directory descriptions consistent", "publish answer-ready summaries"],
    ai: ["Is it safe for private data?", "What task does it automate best?", "How is it different from ChatGPT?", "Can the output be verified?"],
    metrics: ["AI referral mentions", "workflow page CTR", "trial starts", "branded query growth"],
    costs: ["workflow documentation", "privacy review", "example creation", "comparison depth"],
  },
  "mobile-apps": {
    situation:
      "Mobile app SEO has to reduce install hesitation with screenshots, use cases, privacy answers, support pages, and proof the app is alive.",
    hardTruth:
      "A landing page that only says download the app gives searchers almost no reason to choose it over an app store listing.",
    good: ["real screenshots", "release notes", "privacy pages", "use-case URLs", "ratings near install CTAs"],
    bad: ["one public download page", "decorative mockups", "missing support pages", "no problem-specific content", "website copy contradicting app store copy"],
    pages: ["feature pages", "pre-install question pages", "support pages", "comparison pages", "release note pages"],
    proof: ["app screenshots", "ratings", "release notes", "privacy details", "support links"],
    local: ["avoid city pages unless the app has city content", "align app store entity details", "publish regional availability pages", "connect product directories"],
    ai: ["What happens after install?", "Is it iOS or Android?", "What permissions are required?", "Who should not use it?"],
    metrics: ["install clicks", "support visits", "app store CTR", "feature page impressions"],
    costs: ["screenshot production", "support documentation", "feature copy", "app store alignment"],
  },
  "local-service-businesses": {
    situation:
      "Local service SEO is about getting a nearby searcher to trust the company enough to call, request a quote, or check availability.",
    hardTruth:
      "Many local companies have real proof offline, but the website reads like a generic template with no neighborhood or job evidence.",
    good: ["service pages with photos", "reviews tied to jobs", "clear service areas", "GBP services matching pages", "license or guarantee details"],
    bad: ["one homepage for every service", "copied city pages", "reviews missing from the site", "no project examples", "contact paths hiding response time"],
    pages: ["core service pages", "service-area pages", "cost explainers", "before-and-after pages", "emergency pages"],
    proof: ["job photos", "review excerpts", "licenses", "service maps", "team details"],
    local: ["align GBP categories", "add real job photos", "reply to reviews with service context", "link profile services to pages"],
    ai: ["Do they serve my area?", "How fast can they help?", "Are they licensed?", "What should I expect to pay?"],
    metrics: ["calls", "quote requests", "GBP directions", "service page rankings"],
    costs: ["service page volume", "city proof", "review cleanup", "GBP operations"],
  },
  roofers: {
    situation:
      "Roofing search is urgent, local, visual, and trust-heavy because homeowners worry about leaks, storm damage, insurance, and cost.",
    hardTruth:
      "A roofer can have great crews and still lose search if the site does not show projects, warranties, storm help, and service-area proof.",
    good: ["separate repair and replacement pages", "project photos with roof type", "warranty language", "emergency contact paths", "reviews naming roofing jobs"],
    bad: ["quality roofing copy with no roof types", "unanswered insurance questions", "gallery photos without captions", "GBP proof missing from the site", "copied service-area pages"],
    pages: ["roof repair city pages", "storm inspection guides", "replacement cost pages", "material comparison pages", "financing explainers"],
    proof: ["before-and-after roofs", "warranty terms", "insurance help", "crew photos", "permit notes"],
    local: ["post completed roofs to GBP", "tag photos by neighborhood", "reply to reviews with roof service context", "map services to repair and replacement pages"],
    ai: ["Who handles storm damage near me?", "What does roof replacement cost?", "Do they help with insurance?", "What roof types do they install?"],
    metrics: ["roofing calls", "inspection requests", "GBP photo views", "storm page impressions"],
    costs: ["city page count", "photo cleanup", "insurance content", "GBP posts"],
  },
  dentists: {
    situation:
      "Dental SEO is high-trust healthcare SEO where patients compare location, insurance, emergency access, provider credibility, and treatment comfort.",
    hardTruth:
      "A dental site can look professional while failing search because treatment depth, insurance answers, and provider trust are buried.",
    good: ["detailed treatment pages", "provider bios", "insurance information", "reviews near appointment CTAs", "GBP categories matching treatments"],
    bad: ["one services page listing every treatment", "insurance answered only by phone", "generic provider bios", "no emergency page", "stock smiles replacing trust"],
    pages: ["emergency dentist pages", "insurance pages", "treatment process pages", "cosmetic comparison pages", "patient FAQ pages"],
    proof: ["provider credentials", "accepted insurance", "patient reviews", "treatment photos", "safety notes"],
    local: ["sync GBP treatments", "add office and provider photos", "answer reviews carefully", "keep appointment links current"],
    ai: ["Do they take my insurance?", "Can they handle emergencies?", "Who performs treatment?", "What happens at the first visit?"],
    metrics: ["appointment clicks", "insurance page visits", "emergency calls", "GBP direction requests"],
    costs: ["treatment page depth", "provider bios", "compliance review", "insurance content"],
  },
  restaurants: {
    situation:
      "Restaurant discovery is local and visual, but the website still needs crawlable menus, hours, photos, reservation confidence, and dietary clarity.",
    hardTruth:
      "A restaurant can have strong word of mouth and still underperform search when the menu is a PDF and hours differ across profiles.",
    good: ["HTML menu pages", "consistent hours", "real food photos", "dietary details", "GBP menu alignment"],
    bad: ["image-only menus", "no catering or event URLs", "hours mismatch", "reviews absent from the site", "missing cuisine and neighborhood terms"],
    pages: ["cuisine pages", "catering pages", "private event pages", "dietary menu pages", "seasonal menu pages"],
    proof: ["menu text", "food photos", "reservation links", "review snippets", "event details"],
    local: ["sync GBP menu and hours", "post seasonal dishes", "reply with dish context", "add photos matching menu sections"],
    ai: ["What food do they serve?", "Do they take reservations?", "Are there dietary options?", "Is catering available?"],
    metrics: ["reservation clicks", "menu views", "GBP calls", "direction requests"],
    costs: ["menu rebuild", "photo organization", "event copy", "GBP menu cleanup"],
  },
  gyms: {
    situation:
      "Gym SEO has to make membership concrete with classes, trainers, price signals, location, photos, and beginner confidence.",
    hardTruth:
      "A gym loses when it sells motivation but hides schedules, pricing context, trainer proof, and what a first visit feels like.",
    good: ["indexable class pages", "trainer bios", "pricing context", "real facility photos", "reviews naming classes"],
    bad: ["uncrawlable schedule widgets", "no trainer pages", "pricing completely hidden", "stock fitness imagery", "weak parking or access details"],
    pages: ["class pages", "trainer specialty pages", "beginner guides", "membership comparison pages", "neighborhood gym pages"],
    proof: ["trainer bios", "class schedules", "facility photos", "member reviews", "pricing context"],
    local: ["post class updates", "add entrance photos", "reply with class names", "link GBP services to classes"],
    ai: ["Is this gym beginner-friendly?", "What classes are available?", "What does membership cost?", "Are trainers available?"],
    metrics: ["trial pass clicks", "class visits", "membership inquiries", "GBP calls"],
    costs: ["class page count", "trainer bios", "schedule integration", "photo updates"],
  },
  "med-spas": {
    situation:
      "Med spa searchers compare outcomes, safety, provider credibility, pricing ranges, and whether a treatment fits their concern.",
    hardTruth:
      "Luxury design is not enough if treatment details, contraindications, credentials, and before-and-after proof are thin.",
    good: ["detailed treatment pages", "visible credentials", "organized galleries", "safety FAQs", "pricing expectations"],
    bad: ["short treatment blurbs", "uncaptioned before-and-after images", "missing provider credentials", "ignored risks", "GBP services not matching pages"],
    pages: ["treatment candidate pages", "before-and-after galleries", "pricing explainers", "provider pages", "concern-based pages"],
    proof: ["provider credentials", "before-and-after proof", "treatment FAQs", "reviews", "safety notes"],
    local: ["publish treatment photos carefully", "match GBP services", "reply without overclaims", "keep booking links current"],
    ai: ["Is this treatment right for me?", "Who performs it?", "What are the risks?", "How much does it cost?"],
    metrics: ["consultation requests", "treatment impressions", "gallery views", "GBP website clicks"],
    costs: ["medical review", "gallery organization", "provider bios", "treatment depth"],
  },
  "law-firms": {
    situation:
      "Legal SEO needs specificity, trust, jurisdiction, practice-area clarity, and answers to stressful first-call questions.",
    hardTruth:
      "A firm can have strong attorneys and weak search if practice pages hide behind generic consultation copy.",
    good: ["practice pages with real questions", "credentialed attorney bios", "office pages", "ethical disclaimers", "case context"],
    bad: ["repeated intake paragraphs", "resume-style bios", "city pages without jurisdictional proof", "no first-call FAQs", "blogs not linked to practice pages"],
    pages: ["practice guides", "city-practice pages", "attorney bios", "consultation pages", "case-type FAQs"],
    proof: ["attorney credentials", "jurisdiction details", "representative matters", "reviews", "consultation process"],
    local: ["align GBP categories", "keep office addresses consistent", "answer reviews carefully", "link offices to practice pages"],
    ai: ["Do I need a lawyer?", "Who handles this case type?", "What happens during consultation?", "Do they serve my jurisdiction?"],
    metrics: ["consultation starts", "practice page clicks", "call tracking", "local pack impressions"],
    costs: ["practice page depth", "bio work", "legal review", "office structure"],
  },
  "real-estate-agents": {
    situation:
      "Real estate SEO depends on neighborhood knowledge, seller trust, buyer education, listings, market updates, and visible local activity.",
    hardTruth:
      "Agents lose organic traffic when every page says local expert but no page proves knowledge of a neighborhood or transaction scenario.",
    good: ["neighborhood market context", "seller and buyer guides", "listing explainers", "transaction reviews", "local agent bios"],
    bad: ["IDX listings as the only content", "copied neighborhood pages", "thin seller pages", "stale market updates", "reviews far from contact paths"],
    pages: ["neighborhood pages", "seller prep guides", "buyer relocation pages", "listing explainers", "market updates"],
    proof: ["transaction examples", "market data", "neighborhood photos", "reviews", "agent credentials"],
    local: ["keep GBP service areas realistic", "post market updates", "reply with transaction context", "connect local citations"],
    ai: ["Is this agent active locally?", "What is the market doing?", "How do they help sellers?", "Which price range do they know?"],
    metrics: ["seller leads", "neighborhood impressions", "listing clicks", "GBP calls"],
    costs: ["neighborhood pages", "market updates", "listing integration", "review proof"],
  },
  "ecommerce-stores": {
    situation:
      "Ecommerce SEO wins when category pages help shoppers choose, product pages build trust, and guides connect research to buying.",
    hardTruth:
      "Stores publish hundreds of products while collection pages still say almost nothing about fit, shipping, returns, or alternatives.",
    good: ["helpful collection copy", "original product copy", "clear shipping and returns", "comparison guides", "out-of-stock alternatives"],
    bad: ["manufacturer descriptions", "crawlable filter duplicates", "grid-only collections", "gift guides without product links", "missing reviews or schema"],
    pages: ["buying guides", "category comparisons", "gift guides", "brand-versus-brand pages", "shipping trust pages"],
    proof: ["reviews", "shipping policies", "returns clarity", "product photos", "comparison tables"],
    local: ["use pickup pages only when true", "clarify regional shipping", "sync merchant details", "add store pages when physical retail exists"],
    ai: ["Which product fits my use case?", "How fast does it ship?", "Can I return it?", "How does it compare?"],
    metrics: ["collection CTR", "organic revenue", "product impressions", "guide-assisted carts"],
    costs: ["category volume", "product rewrites", "schema cleanup", "guide production"],
  },
  "shopify-brands": {
    situation:
      "Shopify brand SEO is merchandising plus search intent: collections, product proof, reviews, and comparison content have to work together.",
    hardTruth:
      "Many brands rely on paid social because organic pages are thin, filters are messy, and categories do not answer shopper questions.",
    good: ["collection guidance", "visible reviews", "product fit details", "brand proof", "guides linking to collections"],
    bad: ["generic collection copy", "variant URL competition", "sold-out dead ends", "blog traffic disconnected from products", "hidden shipping and returns"],
    pages: ["collection hubs", "product education guides", "comparison pages", "brand proof pages", "review-led guides"],
    proof: ["reviews", "UGC examples", "shipping proof", "returns policy", "category education"],
    local: ["publish retail pages only if true", "align merchant listings", "avoid fake local inventory", "connect marketplace profiles"],
    ai: ["Is this brand trustworthy?", "Which product should I choose?", "What is the return policy?", "How does it compare?"],
    metrics: ["organic revenue", "collection rankings", "review clicks", "guide-assisted conversions"],
    costs: ["collection rewrites", "review implementation", "filter cleanup", "product education"],
  },
  agencies: {
    situation:
      "Agency SEO has to prove process, specialization, outcomes, pricing fit, and deliverable clarity before prospects book a call.",
    hardTruth:
      "Agencies rank poorly when every page sounds like a full-service partner page and none shows a concrete deliverable.",
    good: ["service deliverables", "case-study results", "industry pages", "engagement models", "process pages"],
    bad: ["interchangeable service pages", "portfolio cases with no numbers", "copied industry pages", "no bad-fit explanation", "blogs disconnected from offers"],
    pages: ["service deliverable pages", "industry service pages", "case breakdowns", "audit templates", "pricing explainers"],
    proof: ["case studies", "process screenshots", "client quotes", "sample reports", "team expertise"],
    local: ["build local pages only with local proof", "sync GBP services", "post case wins", "use city pages for real markets"],
    ai: ["What does the agency deliver?", "Who have they helped?", "How much does it cost?", "Are they specialist or generalist?"],
    metrics: ["qualified calls", "case study views", "service page CTR", "proposal requests"],
    costs: ["case study writing", "service clarity", "industry page count", "sales proof"],
  },
  coaches: {
    situation:
      "Coaching SEO is trust-first: the page must show method, audience fit, proof, ethics, and realistic transformation.",
    hardTruth:
      "Coaches lose searchers when the site relies on inspiration without explaining the program, process, boundaries, or evidence.",
    good: ["program structure", "specific testimonials", "method pages", "pricing paths", "ethical disclaimers"],
    bad: ["homepage speaks to everyone", "no curriculum or session structure", "vague testimonials", "no audience-specific pages", "guaranteed-sounding claims"],
    pages: ["program pages", "audience pages", "methodology pages", "testimonial pages", "fit and pricing FAQs"],
    proof: ["program outlines", "testimonials", "credentials", "method explanation", "fit criteria"],
    local: ["use local pages for in-person sessions", "connect workshops to GBP", "keep coach identity consistent", "post real community activity"],
    ai: ["Who is this coaching for?", "What happens in the program?", "What results are realistic?", "How do I know if it fits?"],
    metrics: ["application starts", "program clicks", "consultation bookings", "testimonial engagement"],
    costs: ["program documentation", "testimonial cleanup", "method writing", "compliance review"],
  },
  contractors: {
    situation:
      "Contractor SEO is local proof plus project confidence: property owners want price expectations, examples, availability, and trust.",
    hardTruth:
      "Contractors usually have proof in the field, but the website fails to package it into service pages, project pages, and GBP updates.",
    good: ["service pages with photos", "projects organized by job type", "license and warranty notes", "easy quote paths", "city pages with real work"],
    bad: ["all services on one page", "uncaptioned project photos", "missing license information", "generic service-area pages", "GBP stronger than the website"],
    pages: ["service pages by job type", "project galleries", "cost guides", "maintenance FAQs", "service-area proof pages"],
    proof: ["project photos", "licenses", "insurance", "warranty details", "review snippets"],
    local: ["post completed jobs", "tie reviews to services", "map GBP services to pages", "add city proof where jobs exist"],
    ai: ["Can they do my project?", "Are they licensed?", "What will it cost?", "Do they serve my area?"],
    metrics: ["quote requests", "service rankings", "GBP calls", "gallery clicks"],
    costs: ["photo organization", "city depth", "service copy", "review proof"],
  },
  clinics: {
    situation:
      "Clinic SEO blends healthcare trust, local visibility, treatment clarity, provider credibility, insurance, and appointment convenience.",
    hardTruth:
      "Clinics often have qualified providers but weak visibility because conditions, treatments, insurance, and expectations are not explained.",
    good: ["condition and treatment pages", "provider credentials", "insurance details", "appointment clarity", "accurate healthcare schema"],
    bad: ["short treatment pages", "providers hidden on team page", "missing insurance details", "thin location pages", "medical copy too promotional"],
    pages: ["condition pages", "treatment pages", "provider bios", "insurance pages", "appointment expectation pages"],
    proof: ["provider credentials", "insurance details", "appointment process", "reviews", "accessibility notes"],
    local: ["align GBP healthcare categories", "add clinic photos", "keep appointment links current", "answer reviews carefully"],
    ai: ["Does this clinic treat my condition?", "Who will I see?", "Do they accept insurance?", "What happens first?"],
    metrics: ["appointment requests", "treatment impressions", "provider bio views", "GBP calls"],
    costs: ["medical content review", "bio updates", "insurance pages", "schema accuracy"],
  },
  salons: {
    situation:
      "Salon SEO is visual and local, but search still needs service pages, stylist proof, pricing context, availability, and review trust.",
    hardTruth:
      "A salon can have strong visual proof and still miss organic traffic if services, stylists, prices, and booking details are not crawlable.",
    good: ["service pages", "stylist specialties", "captioned transformations", "pricing ranges", "booking links near intent"],
    bad: ["image-only service menu", "missing stylist pages", "photos without technique context", "GBP menu mismatch", "no neighborhood signals"],
    pages: ["hair color pages", "extension pages", "stylist bios", "gallery pages", "neighborhood salon pages"],
    proof: ["before-and-after photos", "stylist bios", "price ranges", "service menu", "reviews"],
    local: ["sync GBP service menu", "post fresh work", "reply with service context", "keep booking and hours consistent"],
    ai: ["Which stylist handles this?", "What does it cost?", "Can I book online?", "Are there examples?"],
    metrics: ["booking clicks", "service impressions", "GBP website clicks", "gallery engagement"],
    costs: ["photo captions", "service page creation", "stylist bios", "GBP menu cleanup"],
  },
  "travel-businesses": {
    situation:
      "Travel SEO needs destination authority, itinerary proof, safety details, seasonality, policy clarity, and confidence before booking.",
    hardTruth:
      "Travel pages lose when they inspire but do not answer itinerary, safety, cost, cancellation, and local expertise questions.",
    good: ["practical destination detail", "itinerary logistics", "traveler reviews", "clear policies", "updated seasonal content"],
    bad: ["generic destination copy", "no itinerary logistics", "hidden cancellation details", "uncaptioned photos", "guides not linked to bookings"],
    pages: ["destination guides", "itinerary pages", "seasonal planning pages", "safety pages", "tour comparison pages"],
    proof: ["itinerary details", "traveler reviews", "local photos", "policy clarity", "safety notes"],
    local: ["sync GBP for tours", "post seasonal availability", "use destination citations", "reply with tour context"],
    ai: ["Is this trip right for my dates?", "What is included?", "How flexible is it?", "Who is the local expert?"],
    metrics: ["booking inquiries", "destination CTR", "itinerary clicks", "GBP directions"],
    costs: ["destination depth", "itinerary writing", "policy cleanup", "photo organization"],
  },
  "home-services": {
    situation:
      "Home service SEO is urgency plus trust: homeowners need the right service, nearby availability, price expectations, and proof of real work.",
    hardTruth:
      "Home service companies often spend on ads while organic pages stay generic, giving Google little reason to rank them for specific jobs.",
    good: ["emergency and standard services separated", "city pages with proof", "reviews naming job types", "pricing FAQs", "recent GBP posts"],
    bad: ["every service points to one form", "no emergency response page", "doorway-like city pages", "generic service photos", "review proof disconnected from pages"],
    pages: ["emergency pages", "maintenance explainers", "cost guides", "city-service pages", "before-and-after projects"],
    proof: ["job photos", "review snippets", "service guarantees", "technician proof", "availability details"],
    local: ["map GBP services to pages", "post seasonal reminders", "reply with service details", "keep hours accurate"],
    ai: ["Can they come today?", "What service do I need?", "How much should it cost?", "Do they serve my neighborhood?"],
    metrics: ["calls", "quote forms", "emergency impressions", "GBP website clicks"],
    costs: ["service page volume", "city proof", "review organization", "GBP operations"],
  },
};

const intentProfiles: Record<string, IntentProfile> = {
  "seo-audit": {
    plainEnglish:
      "the report must show what is good, what is broken, why it matters, who owns the fix, and what it should cost",
    evidence: ["title and description fit", "heading clarity", "internal link paths", "trust-page coverage", "queries with impressions but weak CTR"],
    priorities: ["fix pages already getting impressions", "rewrite high-intent first screens", "connect proof to conversion paths", "remove pages that dilute quality", "group fixes by owner"],
    reportStyle:
      "This should feel like a working brief with URLs, screenshots, issue severity, suggested copy, implementation owner, and retest notes.",
    costNote:
      "The audit itself can be cheap; the real budget goes into implementation, validation, and rewriting pages that are too thin to rank.",
  },
  "indexing-fix": {
    plainEnglish:
      "Google is not required to index submitted pages, so each URL must prove it is canonical, useful, different, and worth crawling again",
    evidence: ["submitted URLs returning 200", "self-referencing canonicals", "sitemap quality", "real 404 behavior", "unique page bodies"],
    priorities: ["remove junk from the sitemap", "fix soft 404 behavior", "strengthen pages before resubmission", "validate small batches", "watch excluded reasons weekly"],
    reportStyle:
      "Separate discovery, crawl, render, canonical, quality, and indexing problems because each one has a different fix.",
    costNote:
      "Indexing cleanup is often cheaper than content production, unless the platform cannot return the right status codes or route metadata.",
  },
  "google-business-profile-audit": {
    plainEnglish:
      "local visibility depends on the profile and website agreeing about services, proof, location, reviews, and contact paths",
    evidence: ["GBP category fit", "services linked to URLs", "review response quality", "fresh photos and posts", "NAP consistency"],
    priorities: ["clean categories first", "connect services to pages", "add fresh photos", "answer reviews", "track calls and direction requests"],
    reportStyle:
      "Put GBP activity next to website issues so the owner sees why map-pack trust and organic pages are connected.",
    costNote:
      "GBP work is not expensive once, but it needs repetition: posts, photos, review replies, service updates, and monthly checks.",
  },
  "ai-visibility-audit": {
    plainEnglish:
      "AI answer engines need a clear entity, quotable facts, source pages, comparisons, limitations, and structured data",
    evidence: ["Organization or Service schema", "answer-ready FAQs", "comparison pages", "public examples", "consistent external descriptions"],
    priorities: ["define the entity plainly", "publish source pages", "add matching schema", "create comparison content", "earn relevant citations"],
    reportStyle:
      "Show what an AI system can safely say about the brand today and what facts are missing from the public web.",
    costNote:
      "AEO/GEO is not magic markup; budget for clarity, external mentions, schema, and pages that answer questions better than competitors.",
  },
  "technical-seo-cleanup": {
    plainEnglish:
      "technical cleanup prevents every new page from inheriting the same crawl, duplicate, speed, or metadata problem",
    evidence: ["server responses", "redirect maps", "metadata templates", "schema accuracy", "Core Web Vitals"],
    priorities: ["fix status codes and redirects", "clean metadata templates", "remove crawl traps", "improve slow templates", "retest before publishing more"],
    reportStyle:
      "This should read like a developer ticket pack: route, symptom, proof, recommended change, risk, and retest instruction.",
    costNote:
      "Technical cleanup can be a small fix or a migration decision depending on whether the current stack can send the right response.",
  },
};

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function articleWordCount(article: Omit<SeoArticle, "wordCount">) {
  const sectionWords = article.sections.reduce((total, section) => {
    const paragraphWords = section.paragraphs.reduce((sum, paragraph) => sum + countWords(paragraph), 0);
    const bulletWords = (section.bullets ?? []).reduce((sum, bullet) => sum + countWords(bullet), 0);
    return total + countWords(section.heading) + countWords(section.eyebrow) + paragraphWords + bulletWords;
  }, 0);
  const faqWords = article.faqs.reduce(
    (total, faq) => total + countWords(faq.question) + countWords(faq.answer),
    0,
  );
  return countWords(article.summary) + sectionWords + faqWords;
}

function seed(page: SeoPage, salt: number) {
  const source = `${page.slug}:${page.index}:${salt}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 33 + source.charCodeAt(index)) % 2147483647;
  }
  return hash;
}

function take<T>(page: SeoPage, values: T[], count: number, salt: number) {
  const start = seed(page, salt) % values.length;
  return Array.from({ length: count }, (_, offset) => values[(start + offset) % values.length]);
}

function pick<T>(page: SeoPage, values: T[], salt: number) {
  return values[seed(page, salt) % values.length];
}

function join(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function money(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export function buildHighlyUniqueSeoArticle(page: SeoPage, siteName: string): SeoArticle {
  const stack = stackProfiles[page.builder.slug];
  const market = marketProfiles[page.vertical.slug];
  const intent = intentProfiles[page.intent.slug];
  const target = `${page.builder.name} ${page.intent.label} for ${page.vertical.name}`;
  const good = take(page, market.good, 3, 11);
  const bad = take(page, market.bad, 4, 17);
  const pages = take(page, market.pages, 5, 23);
  const proof = take(page, market.proof, 4, 29);
  const local = take(page, market.local, 3, 31);
  const ai = take(page, market.ai, 3, 37);
  const metrics = take(page, market.metrics, 4, 41);
  const costs = take(page, market.costs, 3, 43);
  const checks = take(page, stack.checks, 4, 47);
  const failures = take(page, stack.failures, 3, 53);
  const fixes = take(page, stack.fixes, 4, 59);
  const evidence = take(page, intent.evidence, 4, 61);
  const priorities = take(page, intent.priorities, 4, 67);
  const lightCost = 250 + ((page.index * 37) % 350);
  const seriousCost = 850 + ((page.index * 83) % 900);
  const fullCost = 2200 + ((page.index * 127) % 2100);
  const opener = pick(
    page,
    [
      "This URL should not rank by being broad; it should rank by being specific.",
      "The useful version of this page starts with a direct diagnosis.",
      "This article is built for one searcher with one messy problem.",
      "The page only deserves indexation if it answers the target better than a generic audit checklist.",
      "The goal is not another SEO definition page; the goal is a practical repair brief.",
    ],
    71,
  );
  const warning = pick(
    page,
    [
      "Scaling weak pages makes the quality problem bigger.",
      "A clean-looking page can still be a thin page.",
      "Submitting a sitemap does not force Google to value the URLs inside it.",
      "More content is a bad investment when every page inherits the same technical flaw.",
      "The expensive mistake is paying for volume before fixing proof and crawl behavior.",
    ],
    73,
  );

  const summary = `${opener} ${page.title} explains ${page.intent.searchIntent} for ${page.vertical.name} using ${page.builder.name}. It names the good signals worth keeping, the bad patterns that usually block rankings, the local and AI visibility gaps to close, and a realistic cost order before anyone spends more on content.`;

  const sections: SeoSection[] = [
    {
      eyebrow: "Diagnosis",
      heading: `${page.title}: the direct answer`,
      paragraphs: [
        `${opener} A real ${page.intent.label} should show what is working, what is broken, why it matters, who owns the fix, and what the next dollar should buy. The target keyword is ${page.keyword}, but the practical job is broader: make ${page.builder.name} implementation issues, ${page.vertical.name} trust signals, local visibility, and AI answer readiness obvious in one plan.`,
        `${market.situation} That means the audit cannot stop at title tags. It has to connect ${page.intent.auditFocus} with the way a visitor decides whether to click, call, book, install, buy, or request a demo. ${warning}`,
      ],
      bullets: [
        `Search target: ${page.keyword}.`,
        `Plain-English problem: ${intent.plainEnglish}.`,
        `Business outcome: ${page.intent.outcome}.`,
        `Stack risk: ${page.builder.commonFailure}.`,
      ],
    },
    {
      eyebrow: "Market",
      heading: `What ${page.vertical.name} need before they trust the page`,
      paragraphs: [
        `${page.vertical.name} are usually ${page.vertical.buyerMoment}. The page has to meet that moment with evidence, not filler. For this market, the most useful proof is ${join(proof)}. If those assets are missing, the page may be indexable on paper but weak when a buyer or AI answer engine tries to summarize it.`,
        `${market.hardTruth} The audit should translate that into page-level work: which objections are unanswered, which proof assets are hidden, which internal links are missing, and which pages should be rewritten before new URLs are created.`,
      ],
      bullets: good.map((item) => `Keep and strengthen: ${item}.`),
    },
    {
      eyebrow: "Stack",
      heading: `How ${page.builder.name} changes the fix`,
      paragraphs: [
        `${stack.diagnosis} For ${target}, the first pass should check ${join(checks)}. These are the implementation details that can make a site look fine to the founder while search systems see duplication, soft 404 behavior, or weak page-level signals.`,
        `${stack.warning} The practical fix path is ${join(fixes)}. That keeps the audit honest because it recommends work the current stack can actually support, then names the point where hosting or framework limits become a ranking risk.`,
      ],
      bullets: failures.map((item) => `Watch for: ${item}.`),
    },
    {
      eyebrow: "Good",
      heading: `Good signals this ${page.vertical.name} page can build on`,
      paragraphs: [
        `A useful audit should not pretend everything is broken. For ${page.vertical.name}, positive signals usually include ${join(good)}. Those details prove the page is not just a generated shell and give the SEO work something to amplify instead of replacing everything blindly.`,
        `The next move is placement. Put proof near the decision point, connect it to a crawlable heading, and link it toward the next step. ${siteName} should make those assets visible in the report so the owner knows what to preserve while the weak sections are rebuilt.`,
      ],
      bullets: proof.map((item) => `Use visibly: ${item}.`),
    },
    {
      eyebrow: "Bad",
      heading: `Bad signs that can hold back ${page.keyword}`,
      paragraphs: [
        `The common failures are specific: ${join(bad)}. If two or three of those are present, the page can still look professional while Google treats it as low-value or too similar to neighboring URLs.`,
        `For ${page.intent.label}, this matters because every new page inherits the same weakness. A bigger sitemap does not solve repeated copy, unclear canonicals, weak proof, or route confusion. Fix the pattern first, then scale content that has a reason to exist.`,
      ],
      bullets: bad.map((item) => `Blunt issue: ${item}.`),
    },
    {
      eyebrow: "Crawl",
      heading: `Indexing proof and sitemap quality for ${page.builder.name}`,
      paragraphs: [
        `The crawl test should include known-good URLs, fake URLs, and a sample of sitemap entries. The evidence to collect here is ${join(evidence)}. If a fake URL returns 200, if the canonical points somewhere else, or if sitemap pages are near-duplicates, the problem is index hygiene before it is content strategy.`,
        `${intent.reportStyle} On ${page.builder.name}, the audit also needs to verify whether important signals are in the initial response or only appear after hydration. Google can render JavaScript, but betting every important URL on delayed rendering makes validation slower and messier.`,
      ],
      bullets: checks.map((item) => `Test: ${item}.`),
    },
    {
      eyebrow: "Pages",
      heading: `Specific content assets to build for ${page.vertical.name}`,
      paragraphs: [
        `Do not start with random blog posts. Start with pages that match real decisions: ${join(pages)}. Those URLs give ${page.vertical.name} more chances to rank because each one answers a separate question instead of making the homepage carry every query.`,
        `Each asset needs its own title, H1, examples, proof, FAQ, internal links, and conversion path. If the body copy from ${pages[0]} can be pasted onto ${pages[1]} with almost no edits, the page is not unique enough yet.`,
      ],
      bullets: pages.map((item) => `Build or improve: ${item}.`),
    },
    {
      eyebrow: "GBP",
      heading: `Local and profile signals for ${page.vertical.name}`,
      paragraphs: [
        `The local layer should not be added after the website is finished. For ${page.vertical.name}, the website and GBP should agree on services, proof, contact paths, and service area. The practical moves are ${join(local)}. If the profile is active but the site is thin, local visibility has a ceiling.`,
        `Even when local SEO is not the main channel, profile consistency helps entity confidence. ${page.vertical.localSignal}. The audit should show whether reviews, photos, services, posts, and landing pages tell one believable story.`,
      ],
      bullets: local.map((item) => `Profile move: ${item}.`),
    },
    {
      eyebrow: "AEO/GEO",
      heading: `AI answer readiness for ${page.title}`,
      paragraphs: [
        `AI visibility depends on whether the public web can explain the business without guessing. For this page, the questions to answer are ${join(ai)}. If the site does not answer those questions directly, AI summaries have less material to cite.`,
        `The fix is not only an llms.txt file. Add crawlable FAQs, schema that matches visible content, concise source pages, examples, comparison context, and limitation notes. ${intent.plainEnglish}. That is what makes the page useful for classic search and generated answers.`,
      ],
      bullets: ai.map((item) => `Answer clearly: ${item}`),
    },
    {
      eyebrow: "Roadmap",
      heading: `Priority order for ${target}`,
      paragraphs: [
        `The first phase should handle ${join(priorities.slice(0, 2))}. The second phase should handle ${join(priorities.slice(2))}. This order matters because weak proof, crawl confusion, and duplicated page bodies will not improve just because more URLs were published.`,
        `Split the work by owner. Developers handle route behavior, status codes, redirects, metadata, schema placement, and sitemap generation. SEO/content handles titles, headings, page briefs, internal links, FAQs, and proof placement. Operators handle GBP activity, reviews, photos, examples, and business details.`,
      ],
      bullets: priorities.map((item) => `Priority: ${item}.`),
    },
    {
      eyebrow: "Cost",
      heading: `What this should cost before it becomes expensive`,
      paragraphs: [
        `A light cleanup for this page type is usually around ${money(lightCost)} to ${money(lightCost + 350)} if the work is mostly metadata, sitemap, titles, headings, obvious noindex rules, and small copy edits. A serious implementation pass is closer to ${money(seriousCost)} to ${money(seriousCost + 1200)} when it includes route fixes, page rewrites, schema, internal links, and validation.`,
        `A larger project can move into the ${money(fullCost)} to ${money(fullCost + 2500)} range when the cost drivers include ${join(costs)}. ${intent.costNote} The honest rule is simple: do not spend heavily on content volume until the foundation and top money pages are clean.`,
      ],
      bullets: costs.map((item) => `Cost driver: ${item}.`),
    },
    {
      eyebrow: "Measure",
      heading: `How to know the ${page.intent.label} worked`,
      paragraphs: [
        `The report should define measurement before work starts. For ${page.vertical.name}, the key metrics are ${join(metrics)}. Pair those with Search Console coverage, indexed pages, impressions, CTR, query movement, and conversions so the team can see whether the fixes changed visibility or only made the site feel cleaner.`,
        `The follow-up should happen at 30 and 90 days. Check which URLs gained impressions, which got indexed, which titles still have weak CTR, and which GBP or AI visibility signals moved. Then add proof to pages already getting traction instead of guessing from scratch.`,
      ],
      bullets: metrics.map((item) => `Track: ${item}.`),
    },
    {
      eyebrow: "Standard",
      heading: `The uniqueness standard for /resources/${page.slug}`,
      paragraphs: [
        `This URL deserves to stay in the sitemap only if it remains specific to ${page.builder.name}, specific to ${page.vertical.name}, and specific to ${page.intent.label}. If the copy can be reused on another stack or audience with almost no edits, it should be rewritten until the examples, bad issues, proof, and roadmap are tied to this exact target.`,
        `That is the standard ${siteName} should enforce across the library: unique URL, unique title, unique body, unique examples, unique fix priorities, and a clear reason for search engines to index the page. Anything less becomes programmatic noise, and programmatic noise is exactly what these audits are supposed to call out.`,
      ],
      bullets: [
        `Canonical stays /resources/${page.slug}.`,
        `Keyword stays ${page.keyword}.`,
        `Examples stay tied to ${page.vertical.name}.`,
        `Fixes stay realistic for ${page.builder.name}.`,
      ],
    },
  ];

  const faqs: SeoFaq[] = [
    {
      question: `What makes this ${target} different from a generic audit?`,
      answer: `It combines ${page.builder.name} implementation checks with the trust and content needs of ${page.vertical.name}. The report should inspect ${join(checks.slice(0, 2))}, but it should also look for ${join(proof.slice(0, 2))} and whether the page answers "${ai[0]}".`,
    },
    {
      question: `What is the first fix for ${page.keyword}?`,
      answer: `Start with ${priorities[0]}. Then validate ${evidence[0].toLowerCase()} and remove any sitemap URL that does not deserve indexing. After that, improve the pages with the clearest buyer intent before writing broad blog content.`,
    },
    {
      question: `Which bad sign is most damaging for ${page.vertical.name}?`,
      answer: `${bad[0]} is usually the most damaging because it weakens rankings and conversion at the same time. Search engines see less unique value, while visitors get fewer reasons to trust the business.`,
    },
    {
      question: `Should ${page.vertical.name} write blogs first?`,
      answer: `Usually no. Build or improve ${join(pages.slice(0, 3))} first, then use blog content to support those pages. Blogs work better after the site has clean crawl behavior, real proof, and internal links pointing toward pages that can convert.`,
    },
    {
      question: `How does Google Business Profile fit into this?`,
      answer: `For this market, GBP work should focus on ${join(local)}. The website should support those profile signals with matching pages, visible proof, and clear contact paths. If GBP and the site disagree, local trust gets weaker.`,
    },
    {
      question: `What should the owner budget for this fix?`,
      answer: `A small cleanup can sit around ${money(lightCost)} to ${money(lightCost + 350)}. A deeper technical, content, GBP, and AEO/GEO pass is closer to ${money(seriousCost)} to ${money(seriousCost + 1200)}. If ${join(costs)} are all involved, budget for a larger implementation project.`,
    },
  ];

  const articleWithoutCount = { summary, sections, faqs };

  return {
    ...articleWithoutCount,
    wordCount: articleWordCount(articleWithoutCount),
  };
}
