// Curated seed list of SaaS/startup/AI directories.
// Tier 1 = top DA + high traffic. Tier 2 = solid mid. Tier 3 = long-tail but real.
// submission_method: 'api' | 'form' | 'email' | 'manual'
//   - api/form entries with auto_submit_config get attempted server-side.
//   - Everything else falls into the one-click manual queue.
// Add new batches here; the queue job picks them up automatically.

export type SeedDirectory = {
  slug: string;
  name: string;
  homepage_url: string;
  submit_url: string;
  category: string;
  tier: 1 | 2 | 3;
  submission_method: "api" | "form" | "email" | "manual";
  auto_submit_config?: Record<string, unknown> | null;
  domain_authority?: number | null;
  notes?: string | null;
};

export const SEED_DIRECTORIES: SeedDirectory[] = [
  // Tier 1 — top launch / general SaaS
  { slug: "producthunt", name: "Product Hunt", homepage_url: "https://www.producthunt.com", submit_url: "https://www.producthunt.com/posts/new", category: "launch", tier: 1, submission_method: "manual", domain_authority: 91, notes: "Requires scheduled launch. Prep hunter." },
  { slug: "betalist", name: "BetaList", homepage_url: "https://betalist.com", submit_url: "https://betalist.com/submit", category: "launch", tier: 1, submission_method: "manual", domain_authority: 74 },
  { slug: "indiehackers", name: "Indie Hackers Products", homepage_url: "https://www.indiehackers.com", submit_url: "https://www.indiehackers.com/new-product", category: "startup", tier: 1, submission_method: "manual", domain_authority: 78 },
  { slug: "launchingnext", name: "Launching Next", homepage_url: "https://www.launchingnext.com", submit_url: "https://www.launchingnext.com/submit/", category: "launch", tier: 1, submission_method: "manual", domain_authority: 55 },
  { slug: "startupstash", name: "Startup Stash", homepage_url: "https://startupstash.com", submit_url: "https://startupstash.com/add-a-resource/", category: "startup", tier: 1, submission_method: "form", domain_authority: 68 },
  { slug: "saashub", name: "SaaSHub", homepage_url: "https://www.saashub.com", submit_url: "https://www.saashub.com/submit-a-product", category: "saas", tier: 1, submission_method: "manual", domain_authority: 60 },
  { slug: "getapp", name: "GetApp", homepage_url: "https://www.getapp.com", submit_url: "https://vendors.gartnerdigitalmarkets.com/", category: "saas", tier: 1, submission_method: "manual", domain_authority: 88 },
  { slug: "capterra", name: "Capterra", homepage_url: "https://www.capterra.com", submit_url: "https://vendors.gartnerdigitalmarkets.com/", category: "saas", tier: 1, submission_method: "manual", domain_authority: 89 },
  { slug: "g2", name: "G2", homepage_url: "https://www.g2.com", submit_url: "https://sell.g2.com/", category: "saas", tier: 1, submission_method: "manual", domain_authority: 92 },
  { slug: "alternativeto", name: "AlternativeTo", homepage_url: "https://alternativeto.net", submit_url: "https://alternativeto.net/software/new/", category: "saas", tier: 1, submission_method: "manual", domain_authority: 84 },
  { slug: "crunchbase", name: "Crunchbase", homepage_url: "https://www.crunchbase.com", submit_url: "https://www.crunchbase.com/add-new", category: "startup", tier: 1, submission_method: "manual", domain_authority: 92 },
  { slug: "hackernews-show", name: "Hacker News (Show HN)", homepage_url: "https://news.ycombinator.com", submit_url: "https://news.ycombinator.com/submit", category: "launch", tier: 1, submission_method: "manual", domain_authority: 90, notes: "Post as Show HN. Account >30 days old." },
  { slug: "reddit-sideproject", name: "Reddit r/SideProject", homepage_url: "https://www.reddit.com/r/SideProject/", submit_url: "https://www.reddit.com/r/SideProject/submit", category: "launch", tier: 1, submission_method: "manual", domain_authority: 92 },
  { slug: "reddit-saas", name: "Reddit r/SaaS", homepage_url: "https://www.reddit.com/r/SaaS/", submit_url: "https://www.reddit.com/r/SaaS/submit", category: "launch", tier: 1, submission_method: "manual", domain_authority: 92 },

  // Tier 1 — AI directories
  { slug: "futuretools", name: "Future Tools", homepage_url: "https://www.futuretools.io", submit_url: "https://www.futuretools.io/submit-a-tool", category: "ai", tier: 1, submission_method: "form", domain_authority: 62 },
  { slug: "theresanaiforthat", name: "There's an AI for That", homepage_url: "https://theresanaiforthat.com", submit_url: "https://theresanaiforthat.com/submit/", category: "ai", tier: 1, submission_method: "manual", domain_authority: 72 },
  { slug: "toolify", name: "Toolify AI", homepage_url: "https://www.toolify.ai", submit_url: "https://www.toolify.ai/submit", category: "ai", tier: 1, submission_method: "form", domain_authority: 60 },
  { slug: "futurepedia", name: "Futurepedia", homepage_url: "https://www.futurepedia.io", submit_url: "https://www.futurepedia.io/submit-tool", category: "ai", tier: 1, submission_method: "form", domain_authority: 68 },
  { slug: "aitoolhunt", name: "AI Tool Hunt", homepage_url: "https://www.aitoolhunt.com", submit_url: "https://www.aitoolhunt.com/submit-tool", category: "ai", tier: 1, submission_method: "form", domain_authority: 52 },
  { slug: "aitoolsdirectory", name: "AI Tools Directory", homepage_url: "https://aitoolsdirectory.com", submit_url: "https://aitoolsdirectory.com/submit", category: "ai", tier: 1, submission_method: "form", domain_authority: 48 },

  // Tier 2 — general launch / listing
  { slug: "sideprojectors", name: "SideProjectors", homepage_url: "https://www.sideprojectors.com", submit_url: "https://www.sideprojectors.com/project/new", category: "startup", tier: 2, submission_method: "manual", domain_authority: 55 },
  { slug: "startupbase", name: "Startup Base", homepage_url: "https://startupbase.io", submit_url: "https://startupbase.io/submit", category: "startup", tier: 2, submission_method: "form", domain_authority: 45 },
  { slug: "peerlist", name: "Peerlist Launchpad", homepage_url: "https://peerlist.io", submit_url: "https://peerlist.io/launchpad", category: "launch", tier: 2, submission_method: "manual", domain_authority: 58 },
  { slug: "microlaunch", name: "MicroLaunch", homepage_url: "https://microlaunch.net", submit_url: "https://microlaunch.net/submit", category: "launch", tier: 2, submission_method: "form", domain_authority: 40 },
  { slug: "opentools", name: "OpenTools", homepage_url: "https://opentools.ai", submit_url: "https://opentools.ai/submit", category: "ai", tier: 2, submission_method: "form", domain_authority: 50 },
  { slug: "dang", name: "Dang.ai", homepage_url: "https://dang.ai", submit_url: "https://dang.ai/submit", category: "ai", tier: 2, submission_method: "form", domain_authority: 44 },
  { slug: "toolpilot", name: "Tool Pilot", homepage_url: "https://www.toolpilot.ai", submit_url: "https://www.toolpilot.ai/pages/submit-a-tool", category: "ai", tier: 2, submission_method: "form", domain_authority: 43 },
  { slug: "aiscout", name: "AI Scout", homepage_url: "https://aiscout.net", submit_url: "https://aiscout.net/submit-ai/", category: "ai", tier: 2, submission_method: "form", domain_authority: 42 },
  { slug: "aivalley", name: "AI Valley", homepage_url: "https://aivalley.ai", submit_url: "https://aivalley.ai/submit-tool/", category: "ai", tier: 2, submission_method: "form", domain_authority: 41 },
  { slug: "aitools-fyi", name: "AITools.fyi", homepage_url: "https://aitools.fyi", submit_url: "https://aitools.fyi/submit", category: "ai", tier: 2, submission_method: "form", domain_authority: 47 },
  { slug: "aixploria", name: "AIXploria", homepage_url: "https://www.aixploria.com", submit_url: "https://www.aixploria.com/en/ai-tool-add/", category: "ai", tier: 2, submission_method: "form", domain_authority: 48 },
  { slug: "topai", name: "TopAI.tools", homepage_url: "https://topai.tools", submit_url: "https://topai.tools/submit", category: "ai", tier: 2, submission_method: "form", domain_authority: 48 },
  { slug: "eliteai", name: "Elite AI Tools", homepage_url: "https://eliteai.tools", submit_url: "https://eliteai.tools/submit-tool", category: "ai", tier: 2, submission_method: "form", domain_authority: 42 },
  { slug: "aitoptools", name: "AI Top Tools", homepage_url: "https://aitoptools.com", submit_url: "https://aitoptools.com/submit-tool/", category: "ai", tier: 2, submission_method: "form", domain_authority: 45 },

  // Tier 2 — SaaS / no-code / dev
  { slug: "saasworthy", name: "SaaSworthy", homepage_url: "https://www.saasworthy.com", submit_url: "https://www.saasworthy.com/contact-us", category: "saas", tier: 2, submission_method: "manual", domain_authority: 60 },
  { slug: "goodfirms", name: "GoodFirms", homepage_url: "https://www.goodfirms.co", submit_url: "https://www.goodfirms.co/signup", category: "saas", tier: 2, submission_method: "manual", domain_authority: 72 },
  { slug: "crozdesk", name: "Crozdesk", homepage_url: "https://crozdesk.com", submit_url: "https://vendors.crozdesk.com/signup", category: "saas", tier: 2, submission_method: "manual", domain_authority: 60 },
  { slug: "softwaresuggest", name: "SoftwareSuggest", homepage_url: "https://www.softwaresuggest.com", submit_url: "https://www.softwaresuggest.com/vendors/software-listing", category: "saas", tier: 2, submission_method: "manual", domain_authority: 68 },
  { slug: "sourceforge", name: "SourceForge Business", homepage_url: "https://sourceforge.net/software/", submit_url: "https://sourceforge.net/software/vendors/", category: "saas", tier: 2, submission_method: "manual", domain_authority: 92 },
  { slug: "trustradius", name: "TrustRadius", homepage_url: "https://www.trustradius.com", submit_url: "https://www.trustradius.com/vendor/why-trustradius", category: "saas", tier: 2, submission_method: "manual", domain_authority: 84 },
  { slug: "startupranking", name: "Startup Ranking", homepage_url: "https://www.startupranking.com", submit_url: "https://www.startupranking.com/register", category: "startup", tier: 2, submission_method: "manual", domain_authority: 55 },
  { slug: "f6s", name: "F6S", homepage_url: "https://www.f6s.com", submit_url: "https://www.f6s.com/company/signup", category: "startup", tier: 2, submission_method: "manual", domain_authority: 76 },
  { slug: "nocodelist", name: "No Code List", homepage_url: "https://nocodelist.co", submit_url: "https://nocodelist.co/submit-a-tool", category: "nocode", tier: 2, submission_method: "manual", domain_authority: 45 },
  { slug: "nocodefounders", name: "No Code Founders", homepage_url: "https://nocodefounders.com", submit_url: "https://nocodefounders.com/submit", category: "nocode", tier: 3, submission_method: "form", domain_authority: 40 },
  { slug: "makerlog", name: "Makerlog", homepage_url: "https://getmakerlog.com", submit_url: "https://getmakerlog.com/products", category: "startup", tier: 2, submission_method: "manual", domain_authority: 48 },
  { slug: "wip", name: "WIP.co", homepage_url: "https://wip.co", submit_url: "https://wip.co/products", category: "startup", tier: 2, submission_method: "manual", domain_authority: 55 },
  { slug: "uneed", name: "Uneed", homepage_url: "https://www.uneed.best", submit_url: "https://www.uneed.best/submit-a-tool", category: "launch", tier: 2, submission_method: "form", domain_authority: 42 },
  { slug: "tinylaunch", name: "Tiny Launch", homepage_url: "https://tinylaunch.com", submit_url: "https://tinylaunch.com/submit", category: "launch", tier: 2, submission_method: "form", domain_authority: 38 },
  { slug: "openalternative", name: "Open Alternative", homepage_url: "https://openalternative.co", submit_url: "https://openalternative.co/submit", category: "saas", tier: 2, submission_method: "form", domain_authority: 45 },
  { slug: "devhunt", name: "Dev Hunt", homepage_url: "https://devhunt.org", submit_url: "https://devhunt.org/submit", category: "dev", tier: 2, submission_method: "form", domain_authority: 45 },
  { slug: "stackshare", name: "StackShare", homepage_url: "https://stackshare.io", submit_url: "https://stackshare.io/tools/new", category: "dev", tier: 2, submission_method: "manual", domain_authority: 78 },

  // Tier 2 — SEO / marketing
  { slug: "seotoolslist", name: "SEO Tools List", homepage_url: "https://www.seotoolslist.com", submit_url: "https://www.seotoolslist.com/submit-tool/", category: "seo", tier: 2, submission_method: "form", domain_authority: 40 },
  { slug: "growthhackers", name: "GrowthHackers", homepage_url: "https://growthhackers.com", submit_url: "https://growthhackers.com/submit", category: "marketing", tier: 2, submission_method: "manual", domain_authority: 70 },
  { slug: "marketermilk", name: "Marketer Milk Tools", homepage_url: "https://www.marketermilk.com/tools", submit_url: "https://www.marketermilk.com/contact", category: "marketing", tier: 2, submission_method: "email", domain_authority: 48 },

  // Tier 3 — additional AI / long-tail
  { slug: "aitools-club", name: "AI Tools Club", homepage_url: "https://aitools.club", submit_url: "https://aitools.club/submit-tool", category: "ai", tier: 3, submission_method: "form", domain_authority: 35 },
  { slug: "gpte", name: "GPTE.ai", homepage_url: "https://gpte.ai", submit_url: "https://gpte.ai/submit-tool/", category: "ai", tier: 3, submission_method: "form", domain_authority: 32 },
  { slug: "aitoolslist-io", name: "AI Tools List", homepage_url: "https://aitoolslist.io", submit_url: "https://aitoolslist.io/submit", category: "ai", tier: 3, submission_method: "form", domain_authority: 30 },
  { slug: "supertools", name: "SuperTools", homepage_url: "https://supertools.therundown.ai", submit_url: "https://supertools.therundown.ai/submit", category: "ai", tier: 3, submission_method: "form", domain_authority: 38 },
  { slug: "victrays", name: "Victrays AI", homepage_url: "https://victrays.com", submit_url: "https://victrays.com/submit", category: "ai", tier: 3, submission_method: "form", domain_authority: 30 },
  { slug: "toolshunt", name: "Tools Hunt", homepage_url: "https://www.toolshunt.com", submit_url: "https://www.toolshunt.com/submit-tool", category: "ai", tier: 3, submission_method: "form", domain_authority: 32 },
  { slug: "aitoolsguide", name: "AI Tools Guide", homepage_url: "https://www.aitoolsguide.com", submit_url: "https://www.aitoolsguide.com/submit-tool/", category: "ai", tier: 3, submission_method: "form", domain_authority: 32 },
  { slug: "toolsforcreators", name: "Tools for Creators", homepage_url: "https://www.toolsforcreators.com", submit_url: "https://www.toolsforcreators.com/submit", category: "creator", tier: 3, submission_method: "form", domain_authority: 34 },
  { slug: "aitoolshunter", name: "AI Tools Hunter", homepage_url: "https://aitoolshunter.com", submit_url: "https://aitoolshunter.com/submit-tool/", category: "ai", tier: 3, submission_method: "form", domain_authority: 30 },
  { slug: "aitrendytools", name: "AI Trendy Tools", homepage_url: "https://www.aitrendytools.com", submit_url: "https://www.aitrendytools.com/submit-tool", category: "ai", tier: 3, submission_method: "form", domain_authority: 35 },
  { slug: "insanelycoolai", name: "Insanely Cool AI Tools", homepage_url: "https://insanelycooltools.com", submit_url: "https://insanelycooltools.com/submit", category: "ai", tier: 2, submission_method: "manual", domain_authority: 40 },
  { slug: "aidirectori", name: "AI Directori", homepage_url: "https://aidirectori.es", submit_url: "https://aidirectori.es/submit", category: "ai", tier: 2, submission_method: "form", domain_authority: 42 },

  // Tier 3 — long-tail startup
  { slug: "techpluto", name: "TechPluto", homepage_url: "https://www.techpluto.com", submit_url: "https://www.techpluto.com/submit-startup/", category: "startup", tier: 3, submission_method: "form", domain_authority: 50 },
  { slug: "eu-startups", name: "EU-Startups Directory", homepage_url: "https://www.eu-startups.com/directory/", submit_url: "https://www.eu-startups.com/directory/add-listing/", category: "startup", tier: 3, submission_method: "form", domain_authority: 70 },
  { slug: "producthive", name: "Product Hive", homepage_url: "https://producthive.io", submit_url: "https://producthive.io/submit", category: "launch", tier: 3, submission_method: "form", domain_authority: 28 },
  { slug: "launched", name: "Launched.io", homepage_url: "https://launched.io", submit_url: "https://launched.io/submit-startup", category: "launch", tier: 3, submission_method: "form", domain_authority: 32 },
  { slug: "prelaunch", name: "Prelaunch Directory", homepage_url: "https://prelaunch.directory", submit_url: "https://prelaunch.directory/submit", category: "launch", tier: 3, submission_method: "form", domain_authority: 25 },
  { slug: "startupinspire", name: "Startup Inspire", homepage_url: "https://startupinspire.com", submit_url: "https://startupinspire.com/submit-startup", category: "startup", tier: 3, submission_method: "form", domain_authority: 35 },
  { slug: "startuptabs", name: "Startup Tabs", homepage_url: "https://startuptabs.com", submit_url: "https://startuptabs.com/submit", category: "startup", tier: 3, submission_method: "form", domain_authority: 30 },
  { slug: "startupsftw", name: "Startups FTW", homepage_url: "https://startupsftw.com", submit_url: "https://startupsftw.com/submit", category: "startup", tier: 3, submission_method: "form", domain_authority: 25 },
  { slug: "beststartuptools", name: "Best Startup Tools", homepage_url: "https://beststartuptools.com", submit_url: "https://beststartuptools.com/submit", category: "startup", tier: 3, submission_method: "form", domain_authority: 26 },
  { slug: "buildpublicly", name: "Build Publicly", homepage_url: "https://buildpublicly.com", submit_url: "https://buildpublicly.com/submit", category: "startup", tier: 3, submission_method: "form", domain_authority: 28 },
  { slug: "10words", name: "10words", homepage_url: "https://10words.io", submit_url: "https://10words.io/submit", category: "launch", tier: 3, submission_method: "manual", domain_authority: 40 },
  { slug: "producthuntdaily", name: "Product Hunt Daily", homepage_url: "https://producthuntdaily.com", submit_url: "https://producthuntdaily.com/submit-product", category: "launch", tier: 3, submission_method: "manual", domain_authority: 30 },
  { slug: "producthuntalt", name: "Product Hunt Alternatives", homepage_url: "https://producthuntalternative.com", submit_url: "https://producthuntalternative.com/submit", category: "launch", tier: 3, submission_method: "form", domain_authority: 30 },
  { slug: "productlaunchhq", name: "Product Launch HQ", homepage_url: "https://productlaunchhq.co", submit_url: "https://productlaunchhq.co/submit", category: "launch", tier: 3, submission_method: "form", domain_authority: 28 },
  { slug: "startupbuffet", name: "Startup Buffet", homepage_url: "https://startupbuffet.com", submit_url: "https://startupbuffet.com/submit-startup/", category: "startup", tier: 3, submission_method: "form", domain_authority: 30 },
  { slug: "makerpad-tools", name: "Makerpad Tools", homepage_url: "https://www.makerpad.co/tools", submit_url: "https://www.makerpad.co/contact", category: "nocode", tier: 2, submission_method: "email", domain_authority: 65 },
  { slug: "workspaces-xyz", name: "Workspaces.xyz Tools", homepage_url: "https://workspaces.xyz", submit_url: "https://workspaces.xyz/tools/submit", category: "creator", tier: 3, submission_method: "manual", domain_authority: 45 },
  { slug: "prompthero", name: "PromptHero Tools", homepage_url: "https://prompthero.com", submit_url: "https://prompthero.com/submit", category: "ai", tier: 3, submission_method: "manual", domain_authority: 60 },
  { slug: "lovable-showcase", name: "Lovable Showcase", homepage_url: "https://lovable.dev/showcase", submit_url: "https://lovable.dev/showcase", category: "builder", tier: 3, submission_method: "manual", domain_authority: 55 },
  { slug: "ai-collection", name: "AI Collection (GitHub)", homepage_url: "https://ai-collection.org", submit_url: "https://github.com/ai-collection/ai-collection", category: "ai", tier: 3, submission_method: "manual", domain_authority: 35, notes: "Open source repo, PR to add." },
  { slug: "aitoolsclub-net", name: "AI Tools Club Net", homepage_url: "https://aitoolsclub.net", submit_url: "https://aitoolsclub.net/submit-tool/", category: "ai", tier: 3, submission_method: "form", domain_authority: 30 },
  { slug: "getbyte", name: "GetByte", homepage_url: "https://getbyte.tech", submit_url: "https://getbyte.tech/submit", category: "dev", tier: 3, submission_method: "form", domain_authority: 25 },
  { slug: "aifinder", name: "AI Finder", homepage_url: "https://ai-finder.net", submit_url: "https://ai-finder.net/submit", category: "ai", tier: 3, submission_method: "form", domain_authority: 30 },
];

export function directoriesTotal() {
  return SEED_DIRECTORIES.length;
}
