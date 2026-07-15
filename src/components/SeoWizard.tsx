import { useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#5b5bd6";
const INK = "#0b1020";
const MUTED = "#3a4470";
const LINE = "#e4e7f2";
const PANEL = "#f7f8fc";
const STEPS = 6;
const CHECKOUT_URL =
  "https://buy.stripe.com/14A7sE0dr9sC7jt9eV0oM00?client_reference_id=3368c149-80ef-41e4-89d7-142cd2f92eb6";

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
  target_market: "United States",
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
  const [lead, setLead] = useState<Lead>(EMPTY);
  const [leadId] = useState(() => crypto.randomUUID());
  const [audienceInput, setAudienceInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const set = <K extends keyof Lead>(key: K, value: Lead[K]) =>
    setLead((old) => ({ ...old, [key]: value }));

  const persist = async (nextStep: number, completed = false) => {
    setSaving(true);
    const row = {
      id: leadId,
      ...lead,
      current_step: nextStep,
      completed,
      updated_at: new Date().toISOString(),
    };
    const { error } = await seoLeadClient.from("seo_leads").upsert(row, { onConflict: "id" });
    setSaving(false);
    return !error;
  };

  const next = async () => {
    const nextStep = Math.min(step + 1, STEPS);
    await persist(nextStep);
    setStep(nextStep);
  };
  const submit = async () => {
    await persist(STEPS, true);
    setDone(true);
    window.location.assign(CHECKOUT_URL);
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
    <main className="seo-wizard">
      <style>{`
      .seo-wizard{min-height:100vh;background:#fff;color:${INK};font-family:Inter,system-ui,sans-serif;display:grid;grid-template-columns:minmax(0,1fr) minmax(440px,1fr);grid-template-rows:72px minmax(0,1fr)}
      .seo-topbar{grid-column:1/-1;display:flex;align-items:center;padding:0 clamp(24px,4vw,64px);border-bottom:1px solid ${LINE};background:rgba(255,255,255,.94);backdrop-filter:blur(14px);z-index:10}.seo-main{padding:48px clamp(24px,7vw,92px);display:flex;flex-direction:column;justify-content:center;max-width:780px}
      .seo-brand{display:flex;align-items:center;gap:11px;font-family:Sora,Inter,system-ui,sans-serif;font-weight:850;font-size:21px;letter-spacing:-.04em}.seo-brand-mark{width:39px;height:39px;filter:drop-shadow(0 10px 14px #5b5bd638);animation:brandFloat 4s ease-in-out infinite}.seo-brand em{font-style:normal;color:${ACCENT}}
      .seo-progress{height:5px;background:${PANEL};border-radius:99px;overflow:hidden;margin-bottom:18px}.seo-progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,${ACCENT},#8b7cf6);transition:width .45s cubic-bezier(.22,1,.36,1)}
      .step-card{animation:stepIn .45s cubic-bezier(.22,1,.36,1)}
      .seo-wizard input,.seo-wizard textarea,.seo-wizard select{box-sizing:border-box;width:100%;border:1.5px solid ${LINE};border-radius:14px;padding:15px 17px;font:inherit;color:${INK};outline:none;background:#fff}
      .seo-wizard input:focus,.seo-wizard textarea:focus,.seo-wizard select:focus{border-color:${ACCENT};box-shadow:0 0 0 4px #5b5bd617;transform:translateY(-1px)}
      .seo-wizard input,.seo-wizard textarea,.seo-wizard select,.seo-wizard button{transition:all .2s ease}.seo-wizard button{font:inherit}.seo-btn{border:0;border-radius:999px;padding:17px 22px;font-weight:700;cursor:pointer}.seo-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 24px #1919191b}.seo-btn:disabled{opacity:.35;cursor:not-allowed}
      .seo-proof{position:relative;overflow:hidden;background:${PANEL};border-radius:0 0 0 64px;padding:42px clamp(28px,3.5vw,60px);display:flex;flex-direction:column;justify-content:center}
      .seo-orb{position:absolute;border-radius:50%;filter:blur(1px);opacity:.7;animation:orb 8s ease-in-out infinite}.seo-orb.one{width:210px;height:210px;background:#dedcff;right:-55px;top:-45px}.seo-orb.two{width:130px;height:130px;background:#dff8ef;left:-35px;bottom:12%;animation-delay:-3s}
      .proof-grid{display:grid;grid-template-columns:repeat(3,1fr);text-align:center;margin-bottom:22px}.proof-grid>div{padding:0 10px}.proof-grid>div+div{border-left:1px solid #d9dce8}.metric-icon{width:42px;height:42px;margin:0 auto 9px;border:1px dashed #c7cbd9;border-radius:50%;display:grid;place-items:center;color:${ACCENT};background:#fff}.metric-icon svg{width:19px;height:19px}.metric-value{font-family:Sora,Inter,sans-serif;font-size:22px;font-weight:800;letter-spacing:-.03em}.metric-label{font-size:11px;color:#7a829d;margin-top:2px}
      .world-stage{position:relative;width:min(100%,720px);margin:0 auto;aspect-ratio:1.75/1}.world-map{width:100%;height:100%;overflow:visible}.map-land{fill:url(#dotPattern);opacity:.9}.map-route{fill:none;stroke:#b9b9f3;stroke-width:1.2;stroke-dasharray:4 6;opacity:.55}.map-pulse{fill:${ACCENT};transform-box:fill-box;transform-origin:center;animation:mapPulse 2.8s ease-out infinite}.map-pulse:nth-of-type(2n){animation-delay:-1.4s}.map-halo{fill:${ACCENT};opacity:.1;animation:mapPulse 2.8s ease-out infinite}.review-pill{align-self:center;display:flex;align-items:center;gap:11px;background:#fff;border:1px dashed #bfc3d2;border-radius:13px;padding:10px 18px;box-shadow:0 12px 34px #29305f12;font-size:14px}.review-stars{color:#ffb400;letter-spacing:2px}.review-pill strong{font-size:16px}.review-pill span:last-child{color:#7a829d}
      .proof-card{position:relative;z-index:1;box-shadow:0 24px 70px #25252512;animation:cardFloat 6s ease-in-out infinite}.guarantee{background:${INK};color:white;border-radius:22px;padding:30px;position:relative;overflow:hidden}.guarantee:after{content:"";position:absolute;width:170px;height:170px;border-radius:50%;background:${ACCENT};filter:blur(70px);opacity:.28;right:-60px;top:-60px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}.checkout-note{display:flex;align-items:center;justify-content:center;gap:7px;color:${MUTED};font-size:12px;margin-top:12px}
      .money-back{display:flex;align-items:center;gap:12px;margin-top:18px;padding:14px 16px;border:1px solid #dcdcf8;background:#f7f7ff;border-radius:14px;color:${INK};font-size:14px;line-height:1.4}.money-back-icon{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:${ACCENT};color:#fff;font-weight:900;box-shadow:0 7px 16px #5b5bd630}.money-back strong{display:block;color:${ACCENT};font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
      .benefit-list{display:grid;gap:12px;margin:24px 0 4px}.benefit{display:flex;align-items:center;gap:12px;padding:13px 14px;background:${PANEL};border:1px solid ${LINE};border-radius:12px;font-size:14px;font-weight:650;color:${INK};transition:transform .2s ease,border-color .2s ease}.benefit:hover{transform:translateX(4px);border-color:#c9c9f2}.benefit-check{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#e4f8ef;color:#079668;font-weight:900;flex:0 0 24px}
      @keyframes stepIn{from{opacity:0;transform:translateY(16px) scale(.99)}to{opacity:1;transform:none}}@keyframes brandFloat{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-4px) rotate(3deg)}}@keyframes cardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes orb{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,-16px) scale(1.08)}}@keyframes mapPulse{0%{opacity:.9;transform:scale(.6)}70%,100%{opacity:0;transform:scale(2.6)}}
      @media(prefers-reduced-motion:reduce){.seo-wizard *{animation:none!important;transition:none!important}}
      @media(max-width:860px){.seo-wizard{grid-template-columns:1fr;grid-template-rows:66px auto}.seo-topbar{padding:0 22px}.seo-proof{display:none}.seo-main{padding:36px 22px;min-height:calc(100vh - 66px)}.two-col{grid-template-columns:1fr}}
    `}</style>
      <header className="seo-topbar">
        <div className="seo-brand" aria-label="MentionMyApp">
          <LogoMark />
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
                title="Target market and language"
                sub="Where should your pages rank, and in what language?"
              >
                <Label>Target market</Label>
                <select
                  value={lead.target_market}
                  onChange={(e) => set("target_market", e.target.value)}
                >
                  {[
                    "United States",
                    "Global (all countries)",
                    "Canada",
                    "United Kingdom",
                    "Europe",
                    "Latin America",
                    "Middle East",
                    "Asia-Pacific",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <Spacer />
                <Label>Primary language</Label>
                <select value={lead.language} onChange={(e) => set("language", e.target.value)}>
                  {[
                    "English (US)",
                    "English (UK)",
                    "Spanish",
                    "Polish",
                    "German",
                    "French",
                    "Portuguese",
                    "Arabic",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
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
                  <select
                    value={lead.monthly_clicks}
                    onChange={(e) => set("monthly_clicks", e.target.value)}
                  >
                    <option value="">Monthly organic clicks…</option>
                    {["0–100", "100–1,000", "1,000–10,000", "10,000+"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                  <select
                    value={lead.indexed_pages}
                    onChange={(e) => set("indexed_pages", e.target.value)}
                  >
                    <option value="">Indexed pages…</option>
                    {["Under 10", "10–50", "50–200", "200+"].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </div>
              </Shell>
            )}
            {step === 6 && (
              <Shell
                title="Start with a free growth audit"
                sub="We'll review your technical SEO, indexing, content gaps, and opportunities before recommending a plan."
              >
                <div className="guarantee">
                  <div
                    style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".14em", color: ACCENT }}
                  >
                    THE 90-DAY GUARANTEE
                  </div>
                  <h2 style={{ fontSize: 23, lineHeight: 1.35, margin: "12px 0" }}>
                    No measurable SEO growth in 90 days? Get every dollar back.
                  </h2>
                  <p style={{ fontSize: 14, color: "#c2c5cc", lineHeight: 1.6, margin: 0 }}>
                    Measured in your Google Search Console against the day-one baseline. Final scope
                    and eligibility are confirmed after the audit.
                  </p>
                  <ul style={{ paddingLeft: 20, lineHeight: 1.8, fontSize: 14 }}>
                    <li>Technical SEO and indexing fixes</li>
                    <li>Search-demand and competitor gap analysis</li>
                    <li>New SEO landing-page plan</li>
                    <li>Monthly Search Console reporting</li>
                  </ul>
                </div>
                <Spacer />
                <Label>Your name</Label>
                <input
                  aria-label="Your name"
                  placeholder="Your name"
                  autoComplete="name"
                  value={lead.name}
                  onChange={(e) => set("name", e.target.value)}
                />
                <Spacer />
                <Label>Work email</Label>
                <input
                  aria-label="Work email"
                  placeholder="you@company.com"
                  type="email"
                  autoComplete="email"
                  value={lead.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Shell>
            )}
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
                onClick={step === STEPS ? submit : next}
                style={{ background: step === STEPS ? ACCENT : INK, color: "#fff", flex: 1 }}
              >
                {saving
                  ? "Preparing checkout…"
                  : step === STEPS
                    ? "Continue to secure checkout →"
                    : "Continue →"}
              </button>
            </div>
            {step === STEPS && (
              <div className="checkout-note">🔒 Secure payment powered by Stripe</div>
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
            <div className="metric-value">12K+</div>
            <div className="metric-label">Customer reviews</div>
          </div>
          <div>
            <div className="metric-icon">
              <TrendIcon />
            </div>
            <div className="metric-value">35,000</div>
            <div className="metric-label">Companies</div>
          </div>
          <div>
            <div className="metric-icon">
              <ClockIcon />
            </div>
            <div className="metric-value">90 days</div>
            <div className="metric-label">Money-back guarantee</div>
          </div>
        </div>
        <WorldMap />
        <div className="review-pill" aria-label="4.9 out of 5 from more than 12,000 reviews">
          <span className="review-stars">★★★★★</span>
          <strong>4.9/5</strong>
          <span>from 12K+ reviews</span>
        </div>
      </aside>
    </main>
  );
}

function WorldMap() {
  return (
    <div className="world-stage" aria-label="Global SEO growth map">
      <svg
        className="world-map"
        viewBox="0 0 760 430"
        role="img"
        aria-label="World map showing global customer activity"
      >
        <defs>
          <pattern id="dotPattern" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.45" fill="#858ba1" />
          </pattern>
        </defs>
        <path
          className="map-land"
          d="M24 131l29-22 42-7 21-27 45-21 57 4 22 16 42 4 29 23-18 21-29 5-13 25-30 1-18 28-26-5-16 22-22-12-23-35-42-3-28 15-22-10z"
        />
        <path
          className="map-land"
          d="M188 211l36 7 28 26 11 39-14 31-1 44-20 38-19-22-8-42-18-33-12-46z"
        />
        <path
          className="map-land"
          d="M346 117l29-21 43-2 24-18 50 7 33-13 65 19 53-2 42 28 48 7 12 26-31 20-47-2-30 22-37-5-31 14-45-18-31 4-18-22-34-5-25-19-35 5-21-12z"
        />
        <path
          className="map-land"
          d="M415 202l39 4 34 29 4 50-17 39-28 42-20-28-13-51-21-34 8-34z"
        />
        <path className="map-land" d="M635 302l35-19 48 8 20 27-19 25-39 4-31-16z" />
        <path className="map-route" d="M113 174C230 84 374 108 478 211S644 257 690 315" />
        <path className="map-route" d="M211 264C315 204 410 185 555 151" />
        {[
          [112, 174],
          [170, 192],
          [214, 264],
          [443, 213],
          [478, 211],
          [543, 170],
          [611, 191],
          [690, 315],
          [450, 330],
          [354, 128],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle className="map-halo" cx={cx} cy={cy} r="13" />
            <circle className="map-pulse" cx={cx} cy={cy} r="4" />
            <circle cx={cx} cy={cy} r="3.2" fill="#5b5bd6" />
          </g>
        ))}
      </svg>
    </div>
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

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoMark() {
  return (
    <svg className="seo-brand-mark" viewBox="0 0 40 40" role="img" aria-label="MentionMyApp logo">
      <defs>
        <linearGradient id="mma-logo" x1="5" y1="4" x2="35" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c7cf0" />
          <stop offset="1" stopColor="#4747c2" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#mma-logo)" />
      <path
        d="M10 27V14.5c0-1 .8-1.8 1.8-1.8h1.4c.6 0 1.2.3 1.5.9L20 22l5.3-8.4c.3-.6.9-.9 1.5-.9h1.4c1 0 1.8.8 1.8 1.8V27"
        fill="none"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="9" r="4" fill="#7cf0be" stroke="white" strokeWidth="2" />
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
