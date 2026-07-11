export const SITE_NAME = "MentionMyApp";
export const SITE_DOMAIN = "MentionMyApp.com";
export const SITE_URL = "https://mentionmyapp.com";
export const SEO_PAGE_COUNT = 1000;
export const SEO_LAST_UPDATED = "2026-07-10";

type Platform = {
  slug: string;
  name: string;
  audienceSignal: string;
  editorialRisk: string;
  proofStyle: string;
};

type Audience = {
  slug: string;
  name: string;
  buyingMoment: string;
  pain: string;
  proof: string;
};

type Intent = {
  slug: string;
  label: string;
  h1Prefix: string;
  searchIntent: string;
  articleAngle: string;
};

type Competitor = {
  name: string;
  strength: string;
  gap: string;
};

export type SeoPage = {
  index: number;
  slug: string;
  title: string;
  description: string;
  canonicalUrl: string;
  platform: Platform;
  audience: Audience;
  intent: Intent;
  primaryCompetitor: Competitor;
  secondaryCompetitors: Competitor[];
  keyword: string;
};

export type SeoSection = {
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

const platforms: Platform[] = [
  {
    slug: "linkedin",
    name: "LinkedIn",
    audienceSignal: "operator credibility, hiring momentum, founder expertise, and practical proof",
    editorialRisk: "generic thought leadership that sounds polished but says nothing specific",
    proofStyle: "screenshots, shipped examples, customer language, and a clear point of view",
  },
  {
    slug: "reddit",
    name: "Reddit",
    audienceSignal: "specific pain, transparent tradeoffs, useful replies, and community fit",
    editorialRisk: "drive-by promotion, vague launch posts, and comments that ignore the room",
    proofStyle:
      "context-rich posts, honest lessons, comparison notes, and helpful follow-up answers",
  },
  {
    slug: "forbes",
    name: "Forbes",
    audienceSignal:
      "credible founder story, market timing, expert commentary, and category relevance",
    editorialRisk: "claiming authority before the story has evidence or a broader business hook",
    proofStyle:
      "data points, customer outcomes, original analysis, and quotable executive perspective",
  },
  {
    slug: "yahoo-finance",
    name: "Yahoo Finance",
    audienceSignal:
      "business impact, funding context, market traction, partnerships, and financial relevance",
    editorialRisk:
      "publishing a thin company announcement without news value or investor-facing clarity",
    proofStyle:
      "milestones, revenue context, growth metrics, launch dates, and sober market framing",
  },
  {
    slug: "techcrunch",
    name: "TechCrunch",
    audienceSignal:
      "venture-scale novelty, technical differentiation, funding, and fast-moving markets",
    editorialRisk: "pitching a feature release as if it were a category shift",
    proofStyle: "founder background, market contrast, product screenshots, and user traction",
  },
  {
    slug: "product-hunt",
    name: "Product Hunt",
    audienceSignal:
      "launch energy, maker clarity, early adopter fit, and an obvious first use case",
    editorialRisk: "launching without a crisp demo, maker story, or post-launch follow-up plan",
    proofStyle: "short demos, maker notes, changelog proof, and prompt replies",
  },
  {
    slug: "hacker-news",
    name: "Hacker News",
    audienceSignal: "technical novelty, implementation depth, open tradeoffs, and founder candor",
    editorialRisk:
      "marketing copy that hides the engineering decisions readers actually care about",
    proofStyle: "architecture notes, benchmarks, failure modes, and clear technical constraints",
  },
  {
    slug: "quora",
    name: "Quora",
    audienceSignal: "search-aligned answers, durable explanation, and topic authority",
    editorialRisk: "answers that read like ads instead of useful expertise",
    proofStyle: "step-by-step responses, examples, screenshots, and balanced recommendations",
  },
  {
    slug: "x-twitter",
    name: "X",
    audienceSignal: "timely commentary, founder voice, memorable framing, and distribution loops",
    editorialRisk: "threads that overpromise, chase trends, or lack a concrete takeaway",
    proofStyle: "before-and-after examples, concise lessons, metrics, and repeatable frameworks",
  },
  {
    slug: "tiktok",
    name: "TikTok",
    audienceSignal: "clear hooks, fast proof, visible product moments, and creator-native pacing",
    editorialRisk: "corporate explainer videos that ignore how discovery actually works",
    proofStyle: "screen recordings, creator walkthroughs, use-case demos, and outcome clips",
  },
  {
    slug: "youtube",
    name: "YouTube",
    audienceSignal:
      "searchable tutorials, product walkthroughs, founder explainers, and durable education",
    editorialRisk: "videos with broad titles, weak chapters, and no reason to keep watching",
    proofStyle: "structured demos, chaptered guides, real workflows, and comparison walkthroughs",
  },
  {
    slug: "instagram",
    name: "Instagram",
    audienceSignal:
      "visual proof, creator trust, product transformation, and consistent brand memory",
    editorialRisk: "aesthetic posts that never make the app's practical value obvious",
    proofStyle: "reels, carousel breakdowns, founder clips, and customer visuals",
  },
  {
    slug: "facebook",
    name: "Facebook",
    audienceSignal:
      "community trust, local or niche group relevance, and useful conversation starters",
    editorialRisk: "broadcasting announcements into groups that expect discussion",
    proofStyle: "group-specific context, founder replies, practical examples, and case notes",
  },
  {
    slug: "substack",
    name: "Substack",
    audienceSignal: "thoughtful narrative, category insight, and a reason to subscribe for updates",
    editorialRisk: "newsletter posts that are too promotional to be saved or forwarded",
    proofStyle: "founder essays, field notes, teardown posts, and reader-friendly frameworks",
  },
  {
    slug: "medium",
    name: "Medium",
    audienceSignal: "evergreen education, personal experience, and clear search-friendly structure",
    editorialRisk: "generic how-to content that repeats what every competitor already says",
    proofStyle: "original examples, workflow screenshots, and specific lessons learned",
  },
  {
    slug: "indie-hackers",
    name: "Indie Hackers",
    audienceSignal:
      "transparent building lessons, revenue experiments, and founder-to-founder usefulness",
    editorialRisk: "growth claims without numbers, failures, or concrete process detail",
    proofStyle: "monthly updates, experiment logs, honest retrospectives, and revenue context",
  },
  {
    slug: "google-news",
    name: "Google News",
    audienceSignal:
      "timely announcements, entity clarity, authoritative source pages, and clean metadata",
    editorialRisk: "publishing a page that looks like news but lacks a factual event",
    proofStyle: "dates, quotes, product facts, structured data, and a clear company boilerplate",
  },
  {
    slug: "apple-app-store",
    name: "the Apple App Store",
    audienceSignal: "ratings, screenshots, category language, and conversion-focused release notes",
    editorialRisk: "optimizing only keywords while ignoring trust, visuals, and review quality",
    proofStyle: "feature screenshots, update notes, rating snippets, and use-case clarity",
  },
  {
    slug: "g2",
    name: "G2",
    audienceSignal: "verified reviews, category fit, comparison intent, and buyer-ready proof",
    editorialRisk: "treating review presence as a badge instead of a conversion asset",
    proofStyle: "review themes, implementation notes, competitor contrast, and buyer FAQs",
  },
  {
    slug: "capterra",
    name: "Capterra",
    audienceSignal: "software category intent, buyer checklists, pricing clarity, and use-case fit",
    editorialRisk: "listing features without explaining who should choose the product and why",
    proofStyle: "category pages, review takeaways, pricing context, and implementation examples",
  },
];

const audiences: Audience[] = [
  {
    slug: "saas-founders",
    name: "SaaS founders",
    buyingMoment: "launching a new feature, raising a round, or trying to prove category demand",
    pain: "they need attention without turning every post into a sales pitch",
    proof: "MRR movement, shipped features, customer quotes, and clear product positioning",
  },
  {
    slug: "mobile-app-teams",
    name: "mobile app teams",
    buyingMoment: "preparing an App Store update, retention push, or cross-channel launch",
    pain: "they need downloads from people who understand the use case before they install",
    proof: "ratings, screenshots, retention notes, release updates, and user stories",
  },
  {
    slug: "ai-startups",
    name: "AI startups",
    buyingMoment: "turning a demo into trust while the market is crowded with similar claims",
    pain: "they need to explain what the model or workflow changes in plain language",
    proof: "benchmarks, workflow examples, privacy posture, and before-and-after output",
  },
  {
    slug: "b2b-saas",
    name: "B2B SaaS teams",
    buyingMoment: "entering a category where buyers compare tools before booking a demo",
    pain: "they need credibility before sales ever joins the conversation",
    proof: "integration lists, security notes, customer outcomes, and buyer objections",
  },
  {
    slug: "consumer-apps",
    name: "consumer app marketers",
    buyingMoment: "looking for repeatable discovery outside paid acquisition spikes",
    pain: "they need memorable stories that travel beyond one ad campaign",
    proof: "creator examples, retention hooks, app screenshots, and audience language",
  },
  {
    slug: "developer-tools",
    name: "developer tool teams",
    buyingMoment: "earning trust from technical users who test claims quickly",
    pain: "they need attention that survives scrutiny from engineers and power users",
    proof: "docs, API examples, benchmarks, GitHub activity, and implementation notes",
  },
  {
    slug: "fintech-apps",
    name: "fintech app teams",
    buyingMoment: "building trust in a market where compliance, clarity, and confidence matter",
    pain: "they need credibility without making unsupported financial promises",
    proof: "security posture, transparent fees, customer education, and risk-aware messaging",
  },
  {
    slug: "healthtech-apps",
    name: "healthtech app teams",
    buyingMoment: "explaining sensitive outcomes with care, accuracy, and trust",
    pain: "they need visibility without sounding casual about regulated or personal topics",
    proof: "clinical context, privacy language, user safeguards, and careful disclaimers",
  },
  {
    slug: "productivity-apps",
    name: "productivity app teams",
    buyingMoment: "showing why another workflow tool deserves a place in someone's day",
    pain: "they need practical proof that the product saves time instead of adding process",
    proof: "workflow clips, time-saved examples, templates, and habit-building cues",
  },
  {
    slug: "ecommerce-apps",
    name: "ecommerce app teams",
    buyingMoment: "connecting product value to revenue, retention, or merchant operations",
    pain: "they need buyer intent from merchants who are evaluating stack changes",
    proof: "store examples, revenue lift notes, integration details, and merchant quotes",
  },
];

const intents: Intent[] = [
  {
    slug: "get-mentioned-on",
    label: "get mentioned on",
    h1Prefix: "How to get mentioned on",
    searchIntent:
      "founders searching for credible ways to earn a mention without pretending it is guaranteed",
    articleAngle: "earned mention planning",
  },
  {
    slug: "launch-playbook-for",
    label: "launch playbook for",
    h1Prefix: "Launch playbook for",
    searchIntent: "teams planning a launch page, outreach sequence, and channel-specific proof",
    articleAngle: "launch execution",
  },
  {
    slug: "organic-growth-on",
    label: "organic growth on",
    h1Prefix: "Organic growth on",
    searchIntent: "marketers comparing sustainable discovery with paid acquisition",
    articleAngle: "organic acquisition",
  },
  {
    slug: "pr-outreach-for",
    label: "PR outreach for",
    h1Prefix: "PR outreach for",
    searchIntent: "operators preparing pitches, founder commentary, and source assets",
    articleAngle: "outreach readiness",
  },
  {
    slug: "alternatives-to-ads-on",
    label: "alternatives to ads on",
    h1Prefix: "Alternatives to ads on",
    searchIntent: "teams trying to reduce acquisition risk with mention-led distribution",
    articleAngle: "paid acquisition alternatives",
  },
];

const competitors: Competitor[] = [
  {
    name: "Buffer",
    strength: "simple social publishing, analytics, collaboration, and a creator-friendly workflow",
    gap: "mention-led search pages, publication-specific positioning, and indexed channel playbooks",
  },
  {
    name: "Hootsuite",
    strength: "broad scheduling, analytics, inbox, social listening, and enterprise integrations",
    gap: "lighter founder-led mention planning for teams that need search pages before a big suite",
  },
  {
    name: "Sprout Social",
    strength: "enterprise social management, engagement, analytics, and social intelligence",
    gap: "fast public content operations for small teams that need long-tail discovery pages",
  },
  {
    name: "Later",
    strength: "visual planning, social scheduling, creator workflows, and link-in-bio execution",
    gap: "cross-channel earned mention strategy beyond visual calendar management",
  },
  {
    name: "SocialPilot",
    strength: "agency-friendly scheduling, approvals, and multi-account publishing",
    gap: "publication-aware resource pages that answer search intent before a buyer signs in",
  },
  {
    name: "Metricool",
    strength: "social analytics, planning, reporting, and ad performance visibility",
    gap: "SEO-first mention pages that convert platform research into founder-ready copy",
  },
  {
    name: "Planable",
    strength: "content collaboration, approval workflows, and calendar review",
    gap: "public, indexable comparison and mention assets rather than only internal planning",
  },
  {
    name: "Loomly",
    strength: "content calendars, post ideas, approval flows, and scheduling",
    gap: "search-targeted launch narratives for founders who need mentions, not just calendar slots",
  },
  {
    name: "Sendible",
    strength: "agency social media management, scheduling, reporting, and client workflows",
    gap: "app-specific mention pages that speak to product category and acquisition intent",
  },
  {
    name: "Agorapulse",
    strength: "social inbox, publishing, monitoring, and ROI-focused reporting",
    gap: "long-tail public pages built around earned attention, channel fit, and founder proof",
  },
];

function createSeoPages(): SeoPage[] {
  const pages: SeoPage[] = [];

  for (const intent of intents) {
    for (const platform of platforms) {
      for (const audience of audiences) {
        const index = pages.length;
        const primaryCompetitor = competitors[index % competitors.length];
        const secondaryCompetitors = [
          competitors[(index + 3) % competitors.length],
          competitors[(index + 7) % competitors.length],
        ];
        const slug = `${intent.slug}-${platform.slug}-${audience.slug}`;
        const title = `${intent.h1Prefix} ${platform.name}: ${audience.name} guide`;
        const keyword = `${intent.label} ${platform.name} for ${audience.name}`;
        const description = [
          `${SITE_NAME} guide to ${keyword}.`,
          `Build an indexable page, a stronger pitch, and a cleaner competitor angle against ${primaryCompetitor.name}.`,
        ].join(" ");

        pages.push({
          index,
          slug,
          title,
          description,
          canonicalUrl: `${SITE_URL}/resources/${slug}`,
          platform,
          audience,
          intent,
          primaryCompetitor,
          secondaryCompetitors,
          keyword,
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
    return total + words(section.heading) + paragraphWords + bulletWords;
  }, 0);
  const faqWords = article.faqs.reduce(
    (total, faq) => total + words(faq.question) + words(faq.answer),
    0,
  );
  return words(article.summary) + sectionWords + faqWords;
}

function competitorNames(page: SeoPage) {
  return [page.primaryCompetitor, ...page.secondaryCompetitors].map(
    (competitor) => competitor.name,
  );
}

export function buildSeoArticle(page: SeoPage): SeoArticle {
  const { platform, audience, intent, primaryCompetitor } = page;
  const otherCompetitors = competitorNames(page).slice(1).join(" and ");
  const shortKeyword = `${platform.name} for ${audience.name}`;

  const summary = `${page.title} is a practical ${intent.articleAngle} plan for teams that want credible visibility on ${platform.name}. It explains what to publish, what to avoid, how to frame proof, and how ${SITE_NAME} should position the page against tools such as ${primaryCompetitor.name}.`;

  const sections: SeoSection[] = [
    {
      heading: `Search intent for ${shortKeyword}`,
      paragraphs: [
        `Someone searching for ${page.keyword} is not asking for a generic social media calendar. They are usually trying to decide whether ${platform.name} can create trust before a demo, install, signup, or pitch reply. For ${audience.name}, the useful page answers the actual job: what story earns attention, what proof makes the claim believable, and what next step turns attention into measurable demand.`,
        `The page should make the intent obvious in the first screen. Use the exact channel language, mention ${audience.buyingMoment}, and state the constraint that makes the work hard: ${audience.pain}. That gives the reader a reason to stay, and it gives search engines a clear entity relationship between ${SITE_NAME}, ${platform.name}, the audience, and the outcome.`,
      ],
      bullets: [
        `Primary keyword: ${page.keyword}.`,
        `Audience trigger: ${audience.buyingMoment}.`,
        `Channel signal: ${platform.audienceSignal}.`,
      ],
    },
    {
      heading: "The golden template",
      paragraphs: [
        `The golden template starts with a direct answer, then moves into proof, channel fit, competitor contrast, execution steps, examples, and FAQs. Every section should be useful even if a reader lands from search with no context. That means the page cannot be a thin doorway page. It needs a point of view about ${platform.name}, a concrete path for ${audience.name}, and a sober explanation of what ${SITE_NAME} can and cannot control.`,
        `A strong page also avoids pretending that mentions are guaranteed. Forbes, Yahoo Finance, Reddit, LinkedIn, and other venues have their own editorial or community rules. The honest promise is preparation: better positioning, better source material, better distribution, and better follow-up. That is still valuable because most teams lose before outreach begins. They pitch a feature, not a story; they publish a page, not a reason to care.`,
      ],
      bullets: [
        "Answer the searcher first, before describing the product.",
        "Name the channel risk clearly so the page feels credible.",
        "Add a comparison section so competitor searches have a useful landing point.",
        "End with a checklist and FAQs that match buyer objections.",
      ],
    },
    {
      heading: `Why ${platform.name} is different`,
      paragraphs: [
        `${platform.name} rewards a different kind of proof than a normal product landing page. The reader is looking for ${platform.audienceSignal}. If the page ignores that signal, the copy may look polished while still failing the channel. ${audience.name} should build the page around evidence that feels native to ${platform.name}, then connect that evidence back to a single product value proposition.`,
        `The common mistake is ${platform.editorialRisk}. That mistake is expensive because it trains both readers and algorithms to ignore the brand. A better ${SITE_NAME} page treats ${platform.name} as a distribution environment with its own expectations. It gives founders, marketers, and operators a page they can reference during outreach, social replies, community posts, and sales conversations.`,
      ],
    },
    {
      heading: `Positioning for ${audience.name}`,
      paragraphs: [
        `${audience.name} do not need more vague visibility. They need attention that connects to the buying moment: ${audience.buyingMoment}. The positioning should name the shift in the market, the old way people solved the problem, the cost of waiting, and the small proof point that makes the new approach feel believable. That is how an earned mention becomes a business asset instead of a temporary spike.`,
        `The best proof for this audience is ${audience.proof}. Each proof point should be written so it can travel. A reporter can quote it, a Reddit commenter can challenge it, a LinkedIn reader can save it, and a buyer can repeat it internally. ${SITE_NAME} pages should be built with those second-order uses in mind because mentions rarely convert from one isolated impression.`,
      ],
    },
    {
      heading: `Competitor comparison: ${SITE_NAME} vs ${primaryCompetitor.name}`,
      paragraphs: [
        `${primaryCompetitor.name} is strong at ${primaryCompetitor.strength}. That makes it a real competitor in the broader social media and content operations category. The comparison should acknowledge that strength directly, because serious buyers can tell when a page is dodging the obvious. A fair comparison earns trust faster than a one-sided takedown.`,
        `${SITE_NAME} should differentiate around ${primaryCompetitor.gap}. In practical terms, that means building public, indexable resources for searches like ${page.keyword}, then connecting those resources to a repeatable publishing and mention workflow. The pitch is not that every team should replace its calendar. The pitch is that teams need pages that make earned attention easier to understand, evaluate, and act on.`,
      ],
      bullets: [
        `${primaryCompetitor.name} angle: ${primaryCompetitor.strength}.`,
        `${SITE_NAME} angle: ${primaryCompetitor.gap}.`,
        `Also compare against ${otherCompetitors} when buyers want a broader shortlist.`,
      ],
    },
    {
      heading: "URL strategy",
      paragraphs: [
        `The URL should be readable, specific, and honest. A slug such as /resources/${page.slug} tells the reader exactly what the page covers without pretending to be ${platform.name} or any publication. It also gives the sitemap a clean set of long-tail URLs. That matters because search crawlers discover intent clusters more reliably when the information architecture is stable and internally linked.`,
        `Use publication and platform names in URLs only as nominative references. A page can explain how to prepare for a Yahoo Finance mention, a Forbes pitch, a Reddit launch, or a LinkedIn founder post. It should not imply endorsement, partnership, paid placement, or guaranteed coverage. That distinction protects the brand while still capturing the search language people actually use.`,
      ],
    },
    {
      heading: "Page structure that can rank",
      paragraphs: [
        `A page built to compete should include an H1 that matches intent, a short summary, a table of contents, scannable sections, original examples, FAQs, canonical metadata, and structured data. The copy should be long enough to satisfy a serious searcher but not padded with filler. For this page family, the target band is 2,500 to 3,500 words so each URL can cover search intent, execution, comparison, and objections in one place.`,
        `Length alone will not outrank competitors. The reason the format can compete is that it focuses on overlooked long-tail searches. Large tools often rank for broad terms such as social media management, scheduling, analytics, or content calendar software. ${SITE_NAME} can win narrower searches by answering channel-specific questions for ${audience.name}, then linking those answers into a coherent resource hub.`,
      ],
    },
    {
      heading: `Content plan for ${platform.name}`,
      paragraphs: [
        `Start with a plain-language narrative: who the app helps, what changed in the market, and why ${platform.name} is the right place to tell the story. Then add the evidence that fits ${platform.proofStyle}. This gives the page something more useful than a list of features. It becomes a source document that can power social posts, outreach emails, founder replies, community comments, and sales follow-up.`,
        `For ${audience.name}, the first article should not try to say everything. It should make one argument well: the app deserves attention because it solves a specific problem at a specific moment. The supporting sections can then show how to adapt that argument across ${platform.name}, search snippets, outreach copy, and comparison pages. That is the difference between content production and content leverage.`,
      ],
      bullets: [
        `Lead with the ${audience.name} problem, not the feature list.`,
        `Use ${platform.proofStyle} as the evidence layer.`,
        `Connect every CTA to one measurable next step.`,
      ],
    },
    {
      heading: "Outreach assets",
      paragraphs: [
        `A mention-ready page should make outreach easier for the person receiving the pitch. Include a concise company description, founder quote, product facts, launch timing, screenshots, and the most useful data point. If the target is a community or social platform, include context that helps moderators and readers understand why the post belongs there. If the target is media, include facts that reduce follow-up friction.`,
        `The page should also prepare for objections. Some readers will ask whether this is just another scheduler, whether the team has proof, whether the audience is real, or whether the story is newsworthy. Answer those objections in public. When the page handles doubt with specifics, the outreach email can be shorter and more human because the proof already exists in one reliable place.`,
      ],
    },
    {
      heading: "Internal linking plan",
      paragraphs: [
        `A thousand pages only help if they behave like a library, not a pile. Link every resource page back to the resource index, the homepage, and related pages for the same platform or audience. The related links should use descriptive anchor text such as ${platform.name} launch playbook for ${audience.name} or PR outreach for ${audience.name}. That gives crawlers a map and gives readers a path to keep learning.`,
        `The hub page should group URLs by platform, audience, and intent. That structure makes it easier to submit a sitemap, inspect crawl behavior, and decide which clusters deserve deeper editorial work. If search data later shows that ${platform.name} pages convert better than other clusters, the team can add original screenshots, case studies, and examples to those pages first.`,
      ],
    },
    {
      heading: "Measurement",
      paragraphs: [
        `Measure the page as a search asset and as a mention asset. Search metrics include impressions, indexed status, average position, clicks, and queries. Mention metrics include reply rate, saves, shares, referral traffic, branded search lift, and demo or signup contribution. A page that ranks but never supports outreach is incomplete. A page that earns replies but never gets indexed is also leaving value behind.`,
        `For ${audience.name}, useful reporting should connect ${platform.name} activity to a pipeline moment. Did the page help a founder get a reply, help a buyer understand the category, or give a customer a reason to share the app? These questions matter more than vanity traffic because mention-led growth depends on compounding trust across many small interactions.`,
      ],
      bullets: [
        "Track indexation and sitemap discovery.",
        "Track query clusters by platform and audience.",
        "Track assisted conversions from resource pages.",
        "Track outreach reply quality, not only reply volume.",
      ],
    },
    {
      heading: "Editorial safeguards",
      paragraphs: [
        `The fastest way to damage a mention strategy is to overclaim. Do not promise coverage on ${platform.name}. Do not imply that ${SITE_NAME} is endorsed by a platform, publication, or competitor. Do not invent quotes, awards, logos, placements, or financial outcomes. The page can still be persuasive by showing process, preparation, examples, and decision criteria. Credibility is an SEO advantage when competitors rely on hype.`,
        `This matters especially for searches involving Forbes, Yahoo Finance, review sites, and social communities. Readers know the difference between a preparation guide and a fake authority page. The safe approach is also the stronger approach: use the names people search for, explain how to prepare, and keep the claims grounded in what the product and team can actually do.`,
      ],
    },
    {
      heading: "Execution checklist",
      paragraphs: [
        `Before publishing a ${shortKeyword} page, review it like a buyer, a search crawler, and a skeptical editor. The buyer wants clarity. The crawler wants structure. The editor wants evidence. If the page satisfies all three, it has a better chance of becoming an asset that supports organic search, social distribution, and outreach at the same time.`,
        `After publishing, do not leave the URL alone for months. Add examples as campaigns ship, update claims as the product changes, and link to new related pages. Programmatic SEO works best when the template creates a strong first version and the team improves the winners with original evidence. That is how the library avoids becoming stale.`,
      ],
      bullets: [
        "Confirm the title and description match the slug.",
        "Confirm the canonical URL uses MentionMyApp.com.",
        "Confirm the page answers one clear search intent.",
        "Confirm competitor names are used fairly and accurately.",
        "Confirm the CTA points to a real next step.",
      ],
    },
    {
      heading: "Example brief",
      paragraphs: [
        `Brief title: ${page.title}. Primary reader: ${audience.name}. Channel: ${platform.name}. Core promise: prepare a credible mention campaign with public proof, channel-native copy, and a comparison angle against ${primaryCompetitor.name}. Required proof: ${audience.proof}. Required caution: avoid ${platform.editorialRisk}.`,
        `Opening thesis: ${audience.name} can earn better attention on ${platform.name} when they stop asking for generic exposure and start publishing proof that fits the channel. The page should help them understand what to say, why it matters now, and how to turn a mention into a repeatable acquisition asset for ${SITE_NAME}.`,
      ],
    },
    {
      heading: "How to improve this page over time",
      paragraphs: [
        `The first version should be complete enough to index, but the winning version should become more specific. Add screenshots from real campaigns, anonymized outreach examples, search query learnings, and summaries of what changed after publication. Add a comparison table when buyers ask about ${primaryCompetitor.name}. Add a short video when the workflow is easier to understand visually.`,
        `The update cadence can be simple: inspect Search Console monthly, improve pages with impressions but low clicks, expand pages with conversions, and prune pages that never earn discovery. The 1,000-page inventory creates coverage, but editorial attention should follow evidence. That balance gives ${SITE_NAME} a durable SEO system instead of a one-time content dump.`,
      ],
    },
    {
      heading: "Distribution workflow",
      paragraphs: [
        `Publishing the page is only the midpoint. The next step is to turn the article into channel-native assets: a founder post for ${platform.name}, a short outreach email, a comparison snippet for buyers evaluating ${primaryCompetitor.name}, and a saved answer for repeated questions. Each asset should point back to the canonical URL so attention consolidates instead of scattering across disconnected posts.`,
        `The workflow should feel repeatable for ${audience.name}. Start with the resource page, pull out three proof points, adapt those proof points to the channel format, publish the strongest one first, and use replies to improve the page. This loop makes the page more useful every time the team learns what readers question, save, share, or ignore.`,
        `The best signal is not just traffic. It is whether the page helps a team explain the product faster the next time a prospect, journalist, community member, or partner asks why the app matters now. When the same URL can support search, outreach, social replies, and sales follow-up, it becomes a compounding distribution asset rather than another isolated blog post.`,
      ],
      bullets: [
        `Repurpose the page into a ${platform.name} post, an outreach note, and a buyer-facing comparison answer.`,
        `Route every mention back to ${page.canonicalUrl}.`,
        `Use replies and search queries to decide which sections need more proof.`,
      ],
    },
  ];

  const faqs: SeoFaq[] = [
    {
      question: `Can ${SITE_NAME} guarantee a mention on ${platform.name}?`,
      answer: `No. The realistic goal is to prepare a stronger page, pitch, and proof package for ${audience.name}. Platforms, publications, communities, and journalists make their own decisions. ${SITE_NAME} should help teams improve clarity and follow-through without implying guaranteed placement.`,
    },
    {
      question: `Why include competitors such as ${primaryCompetitor.name}?`,
      answer: `Competitor names reflect how buyers research the market. A fair comparison helps readers understand whether they need broad scheduling and analytics, mention-led SEO pages, or both. The page should acknowledge competitor strengths while explaining the specific ${SITE_NAME} angle.`,
    },
    {
      question: `Is a long page necessary for ${page.keyword}?`,
      answer: `The target range of 2,500 to 3,500 words gives the page room to answer intent, explain channel risk, compare alternatives, and provide a checklist. The length should serve the reader. Padding, duplication, and fake authority signals make the page weaker, not stronger.`,
    },
    {
      question: `How should this URL be used in outreach?`,
      answer: `Use it as the source page behind a concise pitch. The email or social message can stay short because the URL already contains the story, proof, comparison, and FAQs. That makes follow-up easier and gives the recipient a stable reference point.`,
    },
  ];

  const articleWithoutCount = { summary, sections, faqs };

  return {
    ...articleWithoutCount,
    wordCount: countArticleWords(articleWithoutCount),
  };
}

export function relatedSeoPages(page: SeoPage, limit = 6) {
  const samePlatform = seoPages.filter(
    (candidate) => candidate.slug !== page.slug && candidate.platform.slug === page.platform.slug,
  );
  const sameAudience = seoPages.filter(
    (candidate) => candidate.slug !== page.slug && candidate.audience.slug === page.audience.slug,
  );
  const combined = [
    ...samePlatform.slice(0, Math.ceil(limit / 2)),
    ...sameAudience.slice(0, limit),
  ];
  const unique = new Map(combined.map((candidate) => [candidate.slug, candidate]));
  return [...unique.values()].slice(0, limit);
}

export function pagesByPlatform() {
  return platforms.map((platform) => ({
    platform,
    pages: seoPages.filter((page) => page.platform.slug === platform.slug),
  }));
}

if (seoPages.length !== SEO_PAGE_COUNT) {
  throw new Error(`Expected ${SEO_PAGE_COUNT} SEO pages, generated ${seoPages.length}`);
}
