import { useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import WorldMap from "@/components/WorldMap";

const ACCENT = "#5b5bd6";
const INK = "#0b1020";
const MUTED = "#3a4470";
const LINE = "#e4e7f2";
const PANEL = "#f7f8fc";
const STEPS = 6;
const CHECKOUT_URL = "https://buy.stripe.com/14A7sE0dr9sC7jt9eV0oM00";
const SECONDARY_CHECKOUT_URL = "https://buy.stripe.com/aFa5kF3Y00ifbpf8KbcAo00";
const OWNER_EMAIL = "filipapiez@gmail.com";
const MARKETS = [
  "Global (all countries)",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Albania",
  "Algeria",
  "Angola",
  "Argentina",
  "Armenia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belgium",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kenya",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Panama",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Saudi Arabia",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "Uruguay",
  "Vietnam",
  "Belarus",
  "Belize",
  "Botswana",
  "Cameroon",
  "Democratic Republic of the Congo",
  "Ivory Coast",
  "El Salvador",
  "Ethiopia",
  "Fiji",
  "Honduras",
  "Iraq",
  "Jamaica",
  "Kazakhstan",
  "Laos",
  "Libya",
  "Malta",
  "Moldova",
  "Mongolia",
  "Montenegro",
  "Myanmar",
  "Namibia",
  "Nepal",
  "North Macedonia",
  "Oman",
  "Paraguay",
  "Puerto Rico",
  "Rwanda",
  "Senegal",
  "Sri Lanka",
  "Tanzania",
  "Trinidad and Tobago",
  "Uganda",
  "Uzbekistan",
  "Venezuela",
  "Zambia",
  "Zimbabwe",
];
const LANGUAGES = [
  { label: "English (US)", flag: "🇺🇸", audience: "332 million" },
  { label: "English (UK)", flag: "🇬🇧", audience: "67 million" },
  { label: "English (AU/NZ)", flag: "🇦🇺", audience: "32 million" },
  { label: "English (Canada)", flag: "🇨🇦", audience: "30 million" },
  { label: "English (South Africa)", flag: "🇿🇦", audience: "15 million" },
  { label: "Spanish", flag: "🇪🇸", audience: "500 million" },
  { label: "Polish", flag: "🇵🇱", audience: "40 million" },
  { label: "German", flag: "🇩🇪", audience: "100 million" },
  { label: "French", flag: "🇫🇷", audience: "310 million" },
  { label: "Portuguese", flag: "🇧🇷", audience: "260 million" },
  { label: "Arabic", flag: "🇸🇦", audience: "370 million" },
  { label: "Italian", flag: "🇮🇹", audience: "68 million" },
  { label: "Dutch", flag: "🇳🇱", audience: "25 million" },
  { label: "Japanese", flag: "🇯🇵", audience: "125 million" },
  { label: "Korean", flag: "🇰🇷", audience: "82 million" },
  { label: "Hindi", flag: "🇮🇳", audience: "600 million" },
  { label: "Chinese (Simplified)", flag: "🇨🇳", audience: "1.1 billion" },
  { label: "Turkish", flag: "🇹🇷", audience: "88 million" },
  { label: "Swedish", flag: "🇸🇪", audience: "13 million" },
  { label: "Danish", flag: "🇩🇰", audience: "6 million" },
  { label: "Norwegian", flag: "🇳🇴", audience: "5 million" },
  { label: "Czech", flag: "🇨🇿", audience: "11 million" },
  { label: "Romanian", flag: "🇷🇴", audience: "24 million" },
  { label: "Greek", flag: "🇬🇷", audience: "13 million" },
  { label: "Hebrew", flag: "🇮🇱", audience: "9 million" },
  { label: "Indonesian", flag: "🇮🇩", audience: "200 million" },
  { label: "Vietnamese", flag: "🇻🇳", audience: "90 million" },
  { label: "Thai", flag: "🇹🇭", audience: "61 million" },
  { label: "Ukrainian", flag: "🇺🇦", audience: "33 million" },
];

const SERVICE_SCOPE = [
  {
    group: "Fix",
    blurb: "Weeks 1–2 · technical foundation",
    items: [
      "Technical SEO audit covering crawlability, metadata, links, and schema",
      "Prioritized findings with the affected URLs and recommended fixes",
      "Approved website changes sent through a connected publishing workflow",
    ],
  },
  {
    group: "Build",
    blurb: "Every month · new indexable pages",
    items: [
      "A workspace for approved SEO pages and target keywords",
      "Draft or publish delivery through supported website connections",
      "Published and indexed status tracked only when evidence is available",
    ],
  },
  {
    group: "Promote",
    blurb: "Every month · authority and visibility",
    items: [
      "A weekly directory-opportunity queue with assisted submissions",
      "Backlinks counted live only after the placement page is verified",
    ],
  },
  {
    group: "Prove",
    blurb: "Always on · clear measurement",
    items: [
      "Day-one Google Search Console baseline snapshot",
      "Reporting for clicks, impressions, verified links, and tracked pages",
      "Day-90 review against baseline: no measurable growth, full refund",
    ],
  },
];

type SeoLeadClient = {
  from: (table: "seo_leads") => {
    upsert: (
      row: Record<string, unknown>,
      options: { onConflict: "id" },
    ) => PromiseLike<{ error: unknown }>;
  };
};

const seoLeadClient = supabase as unknown as SeoLeadClient;

type Lead = {
  name: string;
  website: string;
  target_market: string;
  language: string;
  business_desc: string;
  target_audience: string[];
  competitors: string[];
  gsc_connected: boolean;
  monthly_clicks: string;
  indexed_pages: string;
  email: string;
};

const EMPTY: Lead = {
  name: "",
  website: "",
  target_market: "Global (all countries)",
  language: "English (US)",
  business_desc: "",
  target_audience: [],
  competitors: [],
  gsc_connected: false,
  monthly_clicks: "",
  indexed_pages: "",
  email: "",
};

export default function SeoWizard() {
  const [step, setStep] = useState(1);
  const [lead, setLead] = useState<Lead>(() => {
    if (typeof window === "undefined") return EMPTY;
    const site = new URLSearchParams(window.location.search).get("site")?.trim();
    return site ? { ...EMPTY, website: site } : EMPTY;
  });
  const [leadId] = useState(() => crypto.randomUUID());
  const [audienceInput, setAudienceInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [done, setDone] = useState(false);
  const set = <K extends keyof Lead>(key: K, value: Lead[K]) =>
    setLead((old) => ({ ...old, [key]: value }));

  const persist = async (nextStep: number, completed = false) => {
    setSaving(true);
    setSaveError("");
    const row = {
      id: leadId,
      ...lead,
      current_step: nextStep,
      completed,
      updated_at: new Date().toISOString(),
    };
    try {
      const { error } = await seoLeadClient.from("seo_leads").upsert(row, { onConflict: "id" });
      if (error) throw error;
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : error && typeof error === "object" && "message" in error
            ? String((error as { message?: unknown }).message)
            : "We could not save your audit request";
      setSaveError(`${message}. Please try again before continuing.`);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const checkoutUrl = (base: string) => {
    const url = new URL(base);
    url.searchParams.set("client_reference_id", leadId);
    return url.toString();
  };

  const next = async () => {
    const nextStep = Math.min(step + 1, STEPS);
    if (await persist(nextStep)) setStep(nextStep);
  };
  const submit = async () => {
    if (!(await persist(STEPS, true))) return;
    setDone(true);
    const { data } = await supabase.auth.getUser();
    if (data.user?.email?.toLowerCase() === OWNER_EMAIL) {
      window.location.assign("/dashboard");
      return;
    }
    window.location.assign(checkoutUrl(CHECKOUT_URL));
  };
  const submitSecondary = async () => {
    if (!(await persist(STEPS, true))) return;
    setDone(true);
    const { data } = await supabase.auth.getUser();
    if (data.user?.email?.toLowerCase() === OWNER_EMAIL) {
      window.location.assign("/dashboard");
      return;
    }
    window.location.assign(checkoutUrl(SECONDARY_CHECKOUT_URL));
  };
  const canContinue = useMemo(() => {
    if (step === 1) return /^(https?:\/\/)?[^\s.]+\.[^\s]+/.test(lead.website.trim());
    if (step === 3) return lead.business_desc.trim().length > 10;
    if (step === 6)
      return lead.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
    return true;
  }, [lead, step]);

  const addAudience = () => {
    if (!audienceInput.trim() || lead.target_audience.length >= 3) return;
    set("target_audience", [...lead.target_audience, audienceInput.trim()]);
    setAudienceInput("");
  };
  const addCompetitor = () => {
    if (!competitorInput.trim()) return;
    set("competitors", [...lead.competitors, competitorInput.trim()]);
    setCompetitorInput("");
  };

  return (
    <main className={`seo-wizard ${step === STEPS ? "checkout-step" : ""}`}>
      <style>{`
      .seo-wizard{min-height:100vh;background:#fff;color:${INK};font-family:Inter,system-ui,sans-serif;display:grid;grid-template-columns:minmax(0,1fr) minmax(440px,1fr);grid-template-rows:72px minmax(0,1fr)}
      .seo-topbar{grid-column:1/-1;display:flex;align-items:center;padding:0 clamp(24px,4vw,64px);border-bottom:1px solid ${LINE};background:rgba(255,255,255,.94);backdrop-filter:blur(14px);z-index:10}.seo-main{padding:48px clamp(24px,7vw,92px);display:flex;flex-direction:column;justify-content:center;max-width:780px}
      .seo-brand{display:flex;align-items:center;font-family:Sora,Inter,system-ui,sans-serif;font-weight:850;font-size:21px;letter-spacing:-.04em}.seo-brand em{font-style:normal;color:${ACCENT}}
      .seo-progress{height:5px;background:${PANEL};border-radius:99px;overflow:hidden;margin-bottom:18px}.seo-progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,${ACCENT},#8b7cf6);transition:width .45s cubic-bezier(.22,1,.36,1)}
      .step-card{animation:stepIn .45s cubic-bezier(.22,1,.36,1)}
      .seo-wizard input,.seo-wizard textarea,.seo-wizard select{box-sizing:border-box;width:100%;border:1.5px solid ${LINE};border-radius:14px;padding:15px 17px;font:inherit;color:${INK};outline:none;background:#fff}
      .seo-wizard input:focus,.seo-wizard textarea:focus,.seo-wizard select:focus{border-color:${ACCENT};box-shadow:0 0 0 4px #5b5bd617;transform:translateY(-1px)}
      .seo-wizard input,.seo-wizard textarea,.seo-wizard select,.seo-wizard button{transition:all .2s ease}.seo-wizard button{font:inherit}.seo-btn{border:0;border-radius:999px;padding:17px 22px;font-weight:700;cursor:pointer}.seo-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 24px #1919191b}.seo-btn:disabled{opacity:.35;cursor:not-allowed}
      .seo-proof{position:relative;overflow:hidden;background:${PANEL};border-radius:0 0 0 64px;padding:42px clamp(28px,3.5vw,60px);display:flex;flex-direction:column;justify-content:center}
      .seo-orb{position:absolute;border-radius:50%;filter:blur(1px);opacity:.7;animation:orb 8s ease-in-out infinite}.seo-orb.one{width:210px;height:210px;background:#dedcff;right:-55px;top:-45px}.seo-orb.two{width:130px;height:130px;background:#dff8ef;left:-35px;bottom:12%;animation-delay:-3s}
      .proof-grid{display:grid;grid-template-columns:repeat(3,1fr);text-align:center;margin-bottom:22px}.proof-grid>div{padding:0 10px}.proof-grid>div+div{border-left:1px solid #d9dce8}.metric-icon{width:42px;height:42px;margin:0 auto 9px;border:1px dashed #c7cbd9;border-radius:50%;display:grid;place-items:center;color:${ACCENT};background:#fff}.metric-icon svg{width:19px;height:19px}.metric-value{font-family:Sora,Inter,sans-serif;font-size:22px;font-weight:800;letter-spacing:-.03em}.metric-label{font-size:11px;color:#7a829d;margin-top:2px}
      .review-pill{align-self:center;display:flex;align-items:center;gap:11px;background:#fff;border:1px dashed #bfc3d2;border-radius:13px;padding:10px 18px;box-shadow:0 12px 34px #29305f12;font-size:14px}.review-stars{color:#ffb400;letter-spacing:2px}.review-pill strong{font-size:16px}.review-pill span:last-child{color:#7a829d}
      .proof-card{position:relative;z-index:1;box-shadow:0 24px 70px #25252512;animation:cardFloat 6s ease-in-out infinite}.guarantee{background:${INK};color:white;border-radius:22px;padding:30px;position:relative;overflow:hidden}.guarantee:after{content:"";position:absolute;width:170px;height:170px;border-radius:50%;background:${ACCENT};filter:blur(70px);opacity:.28;right:-60px;top:-60px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}.checkout-note{display:flex;align-items:center;justify-content:center;gap:7px;color:${MUTED};font-size:12px;margin-top:12px}.secondary-checkout{width:100%;margin-top:10px;background:#fff;color:${ACCENT};border:1px solid #cfcff5!important}
      .money-back{display:flex;align-items:center;gap:12px;margin-top:18px;padding:14px 16px;border:1px solid #dcdcf8;background:#f7f7ff;border-radius:14px;color:${INK};font-size:14px;line-height:1.4}.money-back-icon{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:${ACCENT};color:#fff;font-weight:900;box-shadow:0 7px 16px #5b5bd630}.money-back strong{display:block;color:${ACCENT};font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
      .market-picker{position:relative}.market-trigger{width:100%;display:flex;align-items:center;gap:14px;border:1.5px solid ${LINE};border-radius:24px;background:#fff;padding:19px 22px;color:${INK};font-size:17px;font-weight:650;cursor:pointer;box-shadow:0 7px 20px #252b5210}.market-trigger.open{border-color:#cfcff5;border-radius:24px}.market-globe{color:${ACCENT};font-size:21px}.market-chevron{margin-left:auto;color:#8a91aa;transition:transform .2s ease}.market-trigger.open .market-chevron{transform:rotate(180deg)}.market-menu{position:absolute;z-index:20;left:0;right:0;top:calc(100% + 10px);background:#fff;border:1px solid ${LINE};border-radius:22px;box-shadow:0 20px 48px #1a224228;overflow:hidden;animation:stepIn .2s ease}.market-search{border:0!important;border-radius:0!important;border-bottom:1px solid ${LINE}!important;box-shadow:none!important;padding:18px 22px!important}.market-options{max-height:300px;overflow:auto}.market-option{width:100%;display:flex;align-items:center;gap:13px;border:0;background:#fff;padding:15px 22px;text-align:left;color:${INK};cursor:pointer}.market-option:hover,.market-option.selected{background:#f4f3ff}.market-option.selected{color:${ACCENT};font-weight:700}.market-count{padding:11px 22px;border-top:1px solid ${LINE};font-size:12px;color:#8a91aa;background:#fbfbfd}.language-trigger{align-items:flex-start}.language-flag{font-size:22px;line-height:1}.language-copy{display:grid;gap:7px;text-align:left}.language-audience{font-size:13px;color:${ACCENT};font-weight:650}.language-menu{top:calc(100% + 10px)}.language-option{font-size:15px}.language-option .language-flag{font-size:20px}.baseline-select-wrap{position:relative}.baseline-select{appearance:none!important;border-radius:999px!important;padding:16px 46px 16px 20px!important;background:#fff!important;box-shadow:0 6px 18px #252b520d}.baseline-select-wrap:after{content:"⌄";position:absolute;right:19px;top:50%;transform:translateY(-56%);color:#7f869f;font-size:18px;pointer-events:none}
      .benefit-list{display:grid;gap:12px;margin:24px 0 4px}.benefit{display:flex;align-items:center;gap:12px;padding:13px 14px;background:${PANEL};border:1px solid ${LINE};border-radius:12px;font-size:14px;font-weight:650;color:${INK};transition:transform .2s ease,border-color .2s ease}.benefit:hover{transform:translateX(4px);border-color:#c9c9f2}.benefit-check{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#e4f8ef;color:#079668;font-weight:900;flex:0 0 24px}
      .checkout-step .seo-main{grid-column:1/-1;max-width:1240px;width:100%;margin:0 auto;padding-top:38px;padding-bottom:54px;box-sizing:border-box}.checkout-step .seo-proof{display:none}.checkout-step .seo-progress{margin-bottom:14px}.checkout-layout{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(360px,.88fr);gap:26px;align-items:start}.checkout-intro{margin-bottom:24px}.checkout-intro h1{font-size:clamp(32px,4vw,48px);line-height:1.08;letter-spacing:-.035em;margin:0 0 10px}.checkout-intro p{margin:0;color:${MUTED};font-size:16px;line-height:1.6}.scope-list{display:grid;gap:11px}.scope-card{background:${PANEL};border:1px solid #eceef6;border-radius:20px;padding:17px 20px}.scope-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}.scope-number{display:grid;place-items:center;width:27px;height:27px;border-radius:9px;background:${ACCENT};color:#fff;font-size:12px;font-weight:850}.scope-name{font-weight:850}.scope-blurb{font-size:12px;color:#7d849d}.scope-card ul{list-style:none;padding:0;margin:0;display:grid;gap:7px}.scope-card li{display:flex;gap:9px;font-size:13.5px;line-height:1.45}.scope-check{color:#119b69;font-weight:900}.checkout-panel{position:sticky;top:96px;display:grid;gap:14px}.checkout-guarantee{background:${INK};color:#fff;border-radius:24px;padding:26px;box-shadow:0 24px 60px #0b102032}.checkout-guarantee-kicker{font-size:11.5px;font-weight:850;letter-spacing:.15em;color:#a9aaf7}.checkout-guarantee h2{font-size:21px;line-height:1.35;margin:10px 0}.checkout-guarantee p{font-size:13px;line-height:1.55;color:#bec3d1;margin:0}.checkout-price{display:flex;align-items:baseline;gap:9px;border-top:1px solid #2b3042;margin-top:17px;padding-top:15px}.checkout-price strong{font-size:38px}.checkout-price span{font-size:13px;color:#bec3d1}.checkout-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.checkout-field label{display:block;font-size:11px;font-weight:850;letter-spacing:.1em;text-transform:uppercase;color:${MUTED};margin-bottom:7px}.checkout-actions{display:flex;gap:10px}.checkout-actions .back{width:70px;flex:0 0 70px;background:${PANEL};color:${INK}}.checkout-actions .primary{flex:1;background:linear-gradient(135deg,${ACCENT},#4545c1);color:#fff;box-shadow:0 12px 26px #5b5bd638}.checkout-hint{text-align:center;color:${MUTED};font-size:12px}.save-error{border:1px solid #fecaca;background:#fef2f2;color:#991b1b;border-radius:12px;padding:10px 12px;font-size:12px;line-height:1.45}.checkout-alt{border:0;background:transparent;color:${ACCENT};font-size:12px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
      @keyframes stepIn{from{opacity:0;transform:translateY(16px) scale(.99)}to{opacity:1;transform:none}}@keyframes brandFloat{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-4px) rotate(3deg)}}@keyframes cardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes orb{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,-16px) scale(1.08)}}
      @media(prefers-reduced-motion:reduce){.seo-wizard *{animation:none!important;transition:none!important}}
      @media(max-width:860px){.seo-wizard{grid-template-columns:1fr;grid-template-rows:66px auto}.seo-topbar{padding:0 22px}.seo-proof{display:none}.seo-main{padding:36px 22px;min-height:calc(100vh - 66px)}.two-col,.checkout-layout{grid-template-columns:1fr}.checkout-step .seo-main{padding:28px 22px 44px}.checkout-panel{position:static}.checkout-fields{grid-template-columns:1fr}}
    `}</style>
      <header className="seo-topbar">
        <div className="seo-brand" aria-label="MentionMyApp">
          <span>
            MentionMy<em>App</em>
          </span>
        </div>
      </header>
      <section className="seo-main">
        {!done ? (
          <>
            <div className="seo-progress" aria-label={`Step ${step} of ${STEPS}`}>
              <span style={{ width: `${(step / STEPS) * 100}%` }} />
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".13em",
                marginBottom: 18,
                color: ACCENT,
              }}
            >
              STEP {String(step).padStart(2, "0")} <span style={{ color: MUTED }}>/ 06</span>
              {step === 4 && (
                <span style={{ marginLeft: 12, fontWeight: 500, letterSpacing: 0 }}>Optional</span>
              )}
            </div>
            {step === 1 && (
              <Shell
                title="What's your website?"
                sub="We'll audit it to build your indexing and organic growth plan."
              >
                <input
                  aria-label="Website"
                  placeholder="yourwebsite.com"
                  value={lead.website}
                  onChange={(e) => set("website", e.target.value)}
                  autoFocus
                />
                <div className="money-back">
                  <span className="money-back-icon" aria-hidden="true">
                    ✓
                  </span>
                  <span>
                    <strong>90-day money-back guarantee</strong>No measurable SEO growth in 90 days?
                    Get every dollar back.
                  </span>
                </div>
              </Shell>
            )}
            {step === 2 && (
              <Shell
                title="Target market & language"
                sub="Choose the market you want to rank in and the language your content is written in."
              >
                <Label>Target market</Label>
                <SearchableMarket
                  value={lead.target_market}
                  onChange={(value) => set("target_market", value)}
                />
                <Spacer />
                <Label>Primary language</Label>
                <LanguagePicker
                  value={lead.language}
                  onChange={(value) => set("language", value)}
                />
              </Shell>
            )}
            {step === 3 && (
              <Shell title="Describe your business" sub="What do you do, and who do you serve?">
                <textarea
                  rows={5}
                  placeholder="For example: a web design studio serving small businesses in Chicago…"
                  value={lead.business_desc}
                  onChange={(e) => set("business_desc", e.target.value)}
                />
                <Spacer />
                <Label>Target audience ({lead.target_audience.length}/3)</Label>
                <Entry
                  value={audienceInput}
                  setValue={setAudienceInput}
                  add={addAudience}
                  placeholder="dentists in Illinois"
                />
                <Chips
                  items={lead.target_audience}
                  remove={(i) =>
                    set(
                      "target_audience",
                      lead.target_audience.filter((_, x) => x !== i),
                    )
                  }
                />
              </Shell>
            )}
            {step === 4 && (
              <Shell
                title="Who are your competitors?"
                sub="We'll compare the keywords and pages they rank for against your site."
              >
                <Entry
                  value={competitorInput}
                  setValue={setCompetitorInput}
                  add={addCompetitor}
                  placeholder="competitor.com"
                />
                <Chips
                  items={lead.competitors}
                  remove={(i) =>
                    set(
                      "competitors",
                      lead.competitors.filter((_, x) => x !== i),
                    )
                  }
                />
              </Shell>
            )}
            {step === 5 && (
              <Shell
                title="Your starting point"
                sub="Your results are measured against a clear day-one baseline."
              >
                <button
                  className="seo-btn"
                  style={{
                    width: "100%",
                    background: PANEL,
                    color: INK,
                    textAlign: "left",
                    borderRadius: 14,
                  }}
                  onClick={() => set("gsc_connected", !lead.gsc_connected)}
                >
                  <strong>
                    {lead.gsc_connected
                      ? "✓ Search Console marked for connection"
                      : "Connect Google Search Console"}
                  </strong>
                  <div style={{ fontSize: 13, color: MUTED, fontWeight: 400, marginTop: 4 }}>
                    Read-only access for indexed pages and organic clicks. OAuth connection follows
                    after signup.
                  </div>
                </button>
                <Spacer />
                <Label>Or estimate your current results</Label>
                <div className="two-col">
                  <div className="baseline-select-wrap">
                    <select
                      className="baseline-select"
                      value={lead.monthly_clicks}
                      onChange={(e) => set("monthly_clicks", e.target.value)}
                    >
                      <option value="">Monthly organic clicks…</option>
                      {["0–100", "100–1,000", "1,000–10,000", "10,000+"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                  <div className="baseline-select-wrap">
                    <select
                      className="baseline-select"
                      value={lead.indexed_pages}
                      onChange={(e) => set("indexed_pages", e.target.value)}
                    >
                      <option value="">Indexed pages…</option>
                      {["Under 10", "10–50", "50–200", "200+"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </Shell>
            )}
            {step === 6 && (
              <div className="step-card">
                <div className="checkout-intro">
                  <h1>Everything we do — and the guarantee behind it</h1>
                  <p>
                    One complete SEO growth system with clear deliverables and no surprise add-ons.
                  </p>
                </div>
                <div className="checkout-layout">
                  <div className="scope-list">
                    {SERVICE_SCOPE.map((section, index) => (
                      <article className="scope-card" key={section.group}>
                        <div className="scope-head">
                          <span className="scope-number">{index + 1}</span>
                          <span className="scope-name">{section.group}</span>
                          <span className="scope-blurb">{section.blurb}</span>
                        </div>
                        <ul>
                          {section.items.map((item) => (
                            <li key={item}>
                              <span className="scope-check">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                  <div className="checkout-panel">
                    <div className="checkout-guarantee">
                      <div className="checkout-guarantee-kicker">THE 90-DAY GUARANTEE</div>
                      <h2>No measurable organic growth in 90 days? Get every dollar back.</h2>
                      <p>
                        Measured in your Google Search Console against the agreed day-one baseline.
                        Final scope and eligibility are confirmed after your audit.
                      </p>
                      <div className="checkout-price">
                        <strong>$49</strong>
                        <span>/month · cancel anytime</span>
                      </div>
                    </div>
                    <div className="checkout-fields">
                      <div className="checkout-field">
                        <label htmlFor="checkout-name">Your name</label>
                        <input
                          id="checkout-name"
                          placeholder="Your name"
                          autoComplete="name"
                          value={lead.name}
                          onChange={(e) => set("name", e.target.value)}
                        />
                      </div>
                      <div className="checkout-field">
                        <label htmlFor="checkout-email">Work email</label>
                        <input
                          id="checkout-email"
                          placeholder="you@company.com"
                          type="email"
                          autoComplete="email"
                          value={lead.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="checkout-actions">
                      <button
                        className="seo-btn back"
                        onClick={() => setStep(5)}
                        aria-label="Back to previous step"
                      >
                        ←
                      </button>
                      <button
                        className="seo-btn primary"
                        disabled={!canContinue || saving}
                        onClick={submit}
                      >
                        {saving ? "Preparing checkout…" : "Continue to secure checkout →"}
                      </button>
                    </div>
                    {!canContinue && (
                      <div className="checkout-hint">
                        Enter your name and work email to continue
                      </div>
                    )}
                    {saveError && <div className="save-error">{saveError}</div>}
                    <div className="checkout-hint">
                      🔒 Secure checkout powered by Stripe · Baseline confirmed before the guarantee
                      period begins
                    </div>
                    <button
                      className="checkout-alt"
                      disabled={!canContinue || saving}
                      onClick={submitSecondary}
                    >
                      Use alternate Stripe checkout
                    </button>
                  </div>
                </div>
              </div>
            )}
            {step < STEPS && (
              <>
                <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
                  {step > 1 && (
                    <button
                      className="seo-btn"
                      onClick={() => setStep((s) => Math.max(1, s - 1))}
                      style={{ background: PANEL, color: INK, width: 92 }}
                    >
                      ←
                    </button>
                  )}
                  <button
                    className="seo-btn"
                    disabled={!canContinue || saving}
                    onClick={next}
                    style={{ background: INK, color: "#fff", flex: 1 }}
                  >
                    {saving ? "Saving…" : "Continue →"}
                  </button>
                </div>
                {saveError && <div className="save-error">{saveError}</div>}
              </>
            )}
          </>
        ) : (
          <Shell
            title="Your audit request is in."
            sub="We'll review your site and contact you with the next steps. Your 90-day measurement period starts only after the baseline and project scope are agreed."
          >
            <div style={{ background: PANEL, borderRadius: 16, padding: 22 }}>
              Watch your inbox for your SEO growth audit.
            </div>
          </Shell>
        )}
      </section>
      <aside className="seo-proof" aria-label="SEO service guarantee">
        <div className="proof-grid">
          <div>
            <div className="metric-icon">
              <BuildingIcon />
            </div>
            <div className="metric-value">Read-only</div>
            <div className="metric-label">Search Console access</div>
          </div>
          <div>
            <div className="metric-icon">
              <TrendIcon />
            </div>
            <div className="metric-value">Verified</div>
            <div className="metric-label">Live backlink evidence</div>
          </div>
          <div>
            <div className="metric-icon">
              <TrendIcon />
            </div>
            <div className="metric-value">Approved</div>
            <div className="metric-label">Website changes only</div>
          </div>
        </div>
        <WorldMap
          hqLabel="MentionMyApp"
          accent={ACCENT}
          dot="#747a91"
          dotOpacity={0.72}
          height={420}
        />
        <div className="review-pill" aria-label="Evidence-first reporting">
          <strong>Evidence-first</strong>
          <span>Unconnected data stays visibly pending</span>
        </div>
      </aside>
    </main>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path
        d="M4 21h16M6 21V8h8v13M14 12h4v9M9 11h2M9 14h2M9 17h2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m4 17 5-5 4 3 7-8M15 7h5v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Shell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="step-card">
      <h1
        style={{
          fontSize: "clamp(32px,4vw,48px)",
          lineHeight: 1.08,
          letterSpacing: "-.03em",
          margin: "0 0 14px",
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.6, margin: "0 0 28px", maxWidth: 560 }}>
        {sub}
      </p>
      {children}
    </div>
  );
}

function LanguagePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = LANGUAGES.find((language) => language.label === value) ?? LANGUAGES[0];

  return (
    <div className="market-picker">
      <button
        type="button"
        className={`market-trigger language-trigger${open ? " open" : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="language-flag" aria-hidden="true">
          {selected.flag}
        </span>
        <span className="language-copy">
          <span>{selected.label}</span>
          <span className="language-audience">✓ Potential audience {selected.audience}</span>
        </span>
        <span className="market-chevron" aria-hidden="true">
          ⌄
        </span>
      </button>
      {open && (
        <div className="market-menu language-menu" role="listbox" aria-label="Primary language">
          <div className="market-options">
            {LANGUAGES.map((language) => (
              <button
                type="button"
                role="option"
                aria-selected={language.label === value}
                className={`market-option language-option${language.label === value ? " selected" : ""}`}
                key={language.label}
                onClick={() => {
                  onChange(language.label);
                  setOpen(false);
                }}
              >
                <span className="language-flag" aria-hidden="true">
                  {language.flag}
                </span>
                <span>{language.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchableMarket({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = MARKETS.filter((market) => market.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="market-picker">
      <button
        type="button"
        className={`market-trigger${open ? " open" : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="market-globe" aria-hidden="true">
          ◎
        </span>
        <span>{value}</span>
        <span className="market-chevron" aria-hidden="true">
          ⌄
        </span>
      </button>
      {open && (
        <div className="market-menu">
          <input
            className="market-search"
            aria-label="Search countries"
            placeholder="Search countries…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
            autoFocus
          />
          <div className="market-options" role="listbox" aria-label="Target market">
            {matches.map((market) => (
              <button
                type="button"
                role="option"
                aria-selected={market === value}
                className={`market-option${market === value ? " selected" : ""}`}
                key={market}
                onClick={() => {
                  onChange(market);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span aria-hidden="true">{market.startsWith("Global") ? "◎" : "○"}</span>
                {market}
              </button>
            ))}
            {!matches.length && <div className="market-count">No matching country found.</div>}
          </div>
          {!!matches.length && (
            <div className="market-count">
              Showing {matches.length} of {MARKETS.length} — type to search
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: ".09em",
        color: MUTED,
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}
function Spacer() {
  return <div style={{ height: 18 }} />;
}
function Entry({
  value,
  setValue,
  add,
  placeholder,
}: {
  value: string;
  setValue: (v: string) => void;
  add: () => void;
  placeholder: string;
}) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
      />
      <button
        aria-label="Add"
        onClick={add}
        style={{
          border: 0,
          background: ACCENT,
          color: "#fff",
          borderRadius: "50%",
          width: 52,
          height: 52,
          fontSize: 22,
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        +
      </button>
    </div>
  );
}
function Chips({ items, remove }: { items: string[]; remove: (i: number) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 14 }}>
      {items.map((item, i) => (
        <span
          key={`${item}-${i}`}
          style={{ background: PANEL, borderRadius: 99, padding: "8px 13px", fontSize: 14 }}
        >
          {item}
          <button
            aria-label={`Remove ${item}`}
            onClick={() => remove(i)}
            style={{
              border: 0,
              background: "none",
              color: MUTED,
              cursor: "pointer",
              marginLeft: 7,
            }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
