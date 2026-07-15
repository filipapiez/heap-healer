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
      .seo-wizard{min-height:100vh;background:#fff;color:${INK};font-family:Inter,system-ui,sans-serif;display:grid;grid-template-columns:minmax(0,1fr) minmax(400px,.88fr)}
      .seo-main{padding:52px clamp(24px,7vw,88px);display:flex;flex-direction:column;justify-content:center;max-width:760px}
      .seo-brand{display:flex;align-items:center;gap:11px;font-family:Sora,Inter,system-ui,sans-serif;font-weight:850;font-size:20px;letter-spacing:-.04em;margin-bottom:34px}.seo-brand-mark{width:38px;height:38px;filter:drop-shadow(0 10px 14px #5b5bd638);animation:brandFloat 4s ease-in-out infinite}.seo-brand em{font-style:normal;color:${ACCENT}}
      .seo-progress{height:5px;background:${PANEL};border-radius:99px;overflow:hidden;margin-bottom:18px}.seo-progress span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,${ACCENT},#8b7cf6);transition:width .45s cubic-bezier(.22,1,.36,1)}
      .step-card{animation:stepIn .45s cubic-bezier(.22,1,.36,1)}
      .seo-wizard input,.seo-wizard textarea,.seo-wizard select{box-sizing:border-box;width:100%;border:1.5px solid ${LINE};border-radius:14px;padding:15px 17px;font:inherit;color:${INK};outline:none;background:#fff}
      .seo-wizard input:focus,.seo-wizard textarea:focus,.seo-wizard select:focus{border-color:${ACCENT};box-shadow:0 0 0 4px #5b5bd617;transform:translateY(-1px)}
      .seo-wizard input,.seo-wizard textarea,.seo-wizard select,.seo-wizard button{transition:all .2s ease}.seo-wizard button{font:inherit}.seo-btn{border:0;border-radius:999px;padding:17px 22px;font-weight:700;cursor:pointer}.seo-btn:not(:disabled):hover{transform:translateY(-2px);box-shadow:0 10px 24px #1919191b}.seo-btn:disabled{opacity:.35;cursor:not-allowed}
      .seo-proof{position:relative;overflow:hidden;background:${PANEL};border-radius:0 0 0 64px;padding:56px 48px;display:flex;flex-direction:column;justify-content:center}
      .seo-orb{position:absolute;border-radius:50%;filter:blur(1px);opacity:.7;animation:orb 8s ease-in-out infinite}.seo-orb.one{width:210px;height:210px;background:#dedcff;right:-55px;top:-45px}.seo-orb.two{width:130px;height:130px;background:#dff8ef;left:-35px;bottom:12%;animation-delay:-3s}
      .proof-grid{display:grid;grid-template-columns:repeat(3,1fr);text-align:center;margin-bottom:42px}.proof-grid>div+div{border-left:1px solid ${LINE}}
      .proof-card{position:relative;z-index:1;box-shadow:0 24px 70px #25252512;animation:cardFloat 6s ease-in-out infinite}.guarantee{background:${INK};color:white;border-radius:22px;padding:30px;position:relative;overflow:hidden}.guarantee:after{content:"";position:absolute;width:170px;height:170px;border-radius:50%;background:${ACCENT};filter:blur(70px);opacity:.28;right:-60px;top:-60px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}.checkout-note{display:flex;align-items:center;justify-content:center;gap:7px;color:${MUTED};font-size:12px;margin-top:12px}
      .money-back{display:flex;align-items:center;gap:12px;margin-top:18px;padding:14px 16px;border:1px solid #dcdcf8;background:#f7f7ff;border-radius:14px;color:${INK};font-size:14px;line-height:1.4}.money-back-icon{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:${ACCENT};color:#fff;font-weight:900;box-shadow:0 7px 16px #5b5bd630}.money-back strong{display:block;color:${ACCENT};font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
      .benefit-list{display:grid;gap:12px;margin:24px 0 4px}.benefit{display:flex;align-items:center;gap:12px;padding:13px 14px;background:${PANEL};border:1px solid ${LINE};border-radius:12px;font-size:14px;font-weight:650;color:${INK};transition:transform .2s ease,border-color .2s ease}.benefit:hover{transform:translateX(4px);border-color:#c9c9f2}.benefit-check{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#e4f8ef;color:#079668;font-weight:900;flex:0 0 24px}
      @keyframes stepIn{from{opacity:0;transform:translateY(16px) scale(.99)}to{opacity:1;transform:none}}@keyframes brandFloat{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-4px) rotate(3deg)}}@keyframes cardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes orb{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,-16px) scale(1.08)}}
      @media(prefers-reduced-motion:reduce){.seo-wizard *{animation:none!important;transition:none!important}}
      @media(max-width:860px){.seo-wizard{grid-template-columns:1fr}.seo-proof{display:none}.seo-main{padding:36px 22px;min-height:100vh}.two-col{grid-template-columns:1fr}}
    `}</style>
      <section className="seo-main">
        <div className="seo-brand" aria-label="MentionMyApp">
          <LogoMark />
          <span>
            MentionMy<em>App</em>
          </span>
        </div>
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
        <span className="seo-orb one" aria-hidden="true" />
        <span className="seo-orb two" aria-hidden="true" />
        <div className="proof-grid">
          <div>
            <b style={{ fontSize: 24 }}>Backlinks</b>
            <div style={{ fontSize: 12, color: MUTED }}>Build authority</div>
          </div>
          <div>
            <b style={{ fontSize: 24 }}>New pages</b>
            <div style={{ fontSize: 12, color: MUTED }}>Made indexable</div>
          </div>
          <div>
            <b style={{ fontSize: 27 }}>90 days</b>
            <div style={{ fontSize: 12, color: MUTED }}>Growth guarantee</div>
          </div>
        </div>
        <div
          className="proof-card"
          style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 24, padding: 32 }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", color: ACCENT }}>
            SEO, WITHOUT THE GUESSWORK
          </div>
          <h2 style={{ fontSize: "clamp(26px,3vw,38px)", lineHeight: 1.15, margin: "14px 0" }}>
            Fix what blocks growth. Build what people search for.
          </h2>
          <p style={{ color: MUTED, lineHeight: 1.7 }}>
            MentionMyApp turns your SEO plan into focused, measurable work—not another report that
            sits in your inbox.
          </p>
          <div className="benefit-list">
            <div className="benefit">
              <span className="benefit-check">✓</span>Build relevant backlinks
            </div>
            <div className="benefit">
              <span className="benefit-check">✓</span>Create new indexable pages
            </div>
            <div className="benefit">
              <span className="benefit-check">✓</span>Fix technical SEO blockers
            </div>
            <div className="benefit">
              <span className="benefit-check">✓</span>Track growth in Search Console
            </div>
          </div>
          <div
            style={{ borderTop: `1px solid ${LINE}`, marginTop: 24, paddingTop: 20, fontSize: 14 }}
          >
            <strong style={{ color: ACCENT }}>Clear measurement:</strong> indexed pages and organic
            clicks in your own Search Console.
          </div>
        </div>
      </aside>
    </main>
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
