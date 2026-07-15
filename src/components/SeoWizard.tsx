import { useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const ACCENT = "#e8590c";
const INK = "#191919";
const MUTED = "#68707d";
const LINE = "#e5e7eb";
const PANEL = "#f7f5f2";
const STEPS = 6;

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
  };
  const canContinue = useMemo(() => {
    if (step === 1) return /^(https?:\/\/)?[^\s.]+\.[^\s]+/.test(lead.website.trim());
    if (step === 3) return lead.business_desc.trim().length > 10;
    if (step === 6) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
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
      .seo-wizard{min-height:100vh;background:#fff;color:${INK};font-family:Inter,system-ui,sans-serif;display:grid;grid-template-columns:minmax(0,1fr) minmax(380px,.82fr)}
      .seo-main{padding:52px clamp(24px,7vw,88px);display:flex;flex-direction:column;justify-content:center;max-width:760px}
      .seo-wizard input,.seo-wizard textarea,.seo-wizard select{box-sizing:border-box;width:100%;border:1.5px solid ${LINE};border-radius:14px;padding:15px 17px;font:inherit;color:${INK};outline:none;background:#fff}
      .seo-wizard input:focus,.seo-wizard textarea:focus,.seo-wizard select:focus{border-color:${ACCENT};box-shadow:0 0 0 3px #e8590c1a}
      .seo-wizard button{font:inherit}.seo-btn{border:0;border-radius:999px;padding:17px 22px;font-weight:700;cursor:pointer}.seo-btn:disabled{opacity:.35;cursor:not-allowed}
      .seo-proof{background:${PANEL};border-radius:0 0 0 64px;padding:56px 48px;display:flex;flex-direction:column;justify-content:center}
      .proof-grid{display:grid;grid-template-columns:repeat(3,1fr);text-align:center;margin-bottom:42px}.proof-grid>div+div{border-left:1px solid ${LINE}}
      .guarantee{background:${INK};color:white;border-radius:22px;padding:30px}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      @media(max-width:860px){.seo-wizard{grid-template-columns:1fr}.seo-proof{display:none}.seo-main{padding:36px 22px;min-height:100vh}.two-col{grid-template-columns:1fr}}
    `}</style>
      <section className="seo-main">
        {!done ? (
          <>
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
                    If your indexed pages and organic clicks haven't grown after 90 days, you don't
                    pay.
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
                <input
                  aria-label="Work email"
                  placeholder="you@company.com"
                  type="email"
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
                {saving ? "Saving…" : step === STEPS ? "Request my free audit →" : "Continue →"}
              </button>
            </div>
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
            <b style={{ fontSize: 27 }}>Technical</b>
            <div style={{ fontSize: 12, color: MUTED }}>SEO fixes</div>
          </div>
          <div>
            <b style={{ fontSize: 27 }}>Content</b>
            <div style={{ fontSize: 12, color: MUTED }}>Built for intent</div>
          </div>
          <div>
            <b style={{ fontSize: 27 }}>90 days</b>
            <div style={{ fontSize: 12, color: MUTED }}>Growth guarantee</div>
          </div>
        </div>
        <div
          style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 24, padding: 32 }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".12em", color: ACCENT }}>
            SEO, WITHOUT THE GUESSWORK
          </div>
          <h2 style={{ fontSize: "clamp(26px,3vw,38px)", lineHeight: 1.15, margin: "14px 0" }}>
            Fix what blocks growth. Build what people search for.
          </h2>
          <p style={{ color: MUTED, lineHeight: 1.7 }}>
            We start with your website and Search Console baseline, then prioritize technical fixes,
            indexing, internal links, and pages tied to real buyer demand.
          </p>
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

function Shell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div>
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
