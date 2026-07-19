// =============================================================
// LandingPage.tsx v2 — MentionMyApp homepage
// BabyLoveGrowth-style layout, MentionMyApp brand + offer:
//   nav · hero + guarantee line + client logo strip ·
//   free GEO audit widget · how it works (3 steps) ·
//   platform features grid · "written like you" example ·
//   success stories · backlink/network section (WorldMap) ·
//   Google + AI-assistants twin cards · final CTA · footer
//
// HONESTY GUARDS (all ship empty/hidden until filled with REAL data):
//   CLIENTS — logo strip · CASES — success stories ·
//   Any feature card you won't actually ship: delete it.
//
// Routes: /grow = wizard funnel · /signin = auth
// =============================================================

import { useState } from "react";
import EngineRotator from "@/components/EngineRotator";
import EngineIcon, { type EngineName } from "@/components/engineIcons";
import HeroBackground from "@/components/HeroBackground";
import PressMarquee from "@/components/PressMarquee";
import WorldMap from "@/components/WorldMap";

// ---------- Brand ----------
const ACCENT = "#6366F1";
const ACCENT_DARK = "#4F46E5";
const INK = "#171A2B";
const NAVY = "#141830";
const MUTED = "#6B7280";
const LINE = "#E5E7EB";
const BG = "#FFFFFF";
const PANEL = "#F6F6FB";
const POS = "#22C55E";

// ---------- Configurable proof (REAL data only; empty = hidden) ----------
const CLIENTS: string[] = []; // e.g. ["Acme Dental", "Riverside Law", ...]
const CASES: {
  company: string;
  headline: string;
  stat1: [string, string];
  stat2: [string, string];
  quote?: string;
  person?: string;
}[] = [];
// e.g. [{ company: "Acme Dental", headline: "How Acme Dental 3x'd organic clicks",
//         stat1: ["3x", "Organic clicks"], stat2: ["41", "Pages indexed"],
//         quote: "…", person: "Dr. A, Owner" }]

const ENGINES: EngineName[] = ["ChatGPT", "Claude", "Perplexity", "Gemini"];

const STEPS = [
  {
    n: "01",
    t: "Audit the foundation",
    d: "Crawl your site and turn technical SEO, metadata, schema, and internal-link findings into a prioritized work plan.",
    chips: ["Technical audit", "URL-level findings"],
  },
  {
    n: "02",
    t: "Approve and deliver",
    d: "Send approved pages through a supported website connection and work through an assisted directory-placement queue.",
    chips: ["Approved publishing", "Verified backlinks"],
  },
  {
    n: "03",
    t: "Measure verified growth",
    d: "Save a 28-day Search Console baseline, sync real clicks and impressions, and compare the latest 28 days on the same basis.",
    chips: ["Verified reporting", "Comparable baseline"],
  },
];

const FEATURES = [
  {
    t: "Technical SEO Audit",
    d: "Crawls your site and records actionable checks for crawlability, metadata, schema, and internal links.",
    icon: "🔧",
    wide: true,
    status: "Available",
  },
  {
    t: "Search Console Reporting",
    d: "Imports verified clicks and impressions, saves a comparable day-one baseline, and syncs performance daily.",
    icon: "📈",
    wide: true,
    status: "Available",
  },
  {
    t: "Approved Publishing",
    d: "Queues approved pages for WordPress, Shopify, or a selected GitHub repository, with draft and review modes where supported.",
    icon: "🚀",
    status: "Available",
  },
  {
    t: "Verified Backlink Workflow",
    d: "Schedules directory opportunities and counts a placement live only after the public page links back to your site.",
    icon: "🔗",
    status: "Available",
  },
  {
    t: "AI Visibility Workspace",
    d: "Displays real AI-query checks after an AI-visibility provider writes results. Until then it stays visibly pending.",
    icon: "👁",
    status: "Provider required",
  },
  {
    t: "Semrush Authority Snapshot",
    d: "Shows Authority Score, referring domains, backlinks, and keyword estimates when Semrush API access is configured.",
    icon: "📊",
    status: "API key required",
  },
  {
    t: "Tracked Content Plan",
    d: "Records approved and published pages, target keywords, and indexing status without inventing work that has not happened.",
    icon: "🗓",
    status: "Available",
  },
  {
    t: "Connection Status",
    d: "Keeps website, repository, store, and Search Console states aligned so connected services are marked correctly.",
    icon: "🔌",
    status: "Available",
  },
];

export default function LandingPage() {
  const [auditUrl, setAuditUrl] = useState("");

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: INK, background: BG }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .lp-display { font-family: 'Sora', 'Inter', sans-serif; letter-spacing: -0.03em; }
        .lp-cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; cursor: pointer;
          border-radius: 999px; padding: 16px 30px; font-size: 15.5px; font-weight: 700; font-family: inherit;
          background: linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK}); color: #fff;
          box-shadow: 0 10px 26px ${ACCENT}45; text-decoration: none; transition: transform 120ms, box-shadow 120ms;
        }
        .lp-cta:hover { transform: translateY(-1px); }
        .lp-ghost { display: inline-flex; align-items: center; border-radius: 999px; padding: 15px 24px; font-size: 15px; font-weight: 600; color: ${INK}; text-decoration: none; border: 1.5px solid ${LINE}; background: ${BG}; }
        .lp-sec { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
        .lp-eyebrow { font-size: 12px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: ${ACCENT_DARK}; }
        .lp-h2 { font-family: 'Sora', sans-serif; letter-spacing: -0.03em; font-size: clamp(28px, 3.8vw, 44px); font-weight: 800; line-height: 1.1; margin: 12px 0 0; }
        .lp-h2 .ghost { color: #B9BCC9; }
        .lp-card { background: ${BG}; border: 1.5px solid ${LINE}; border-radius: 20px; }
        .lp-chip { display: inline-flex; align-items: center; gap: 6px; border: 1.5px solid ${LINE}; border-radius: 999px; padding: 8px 16px; font-size: 13.5px; font-weight: 600; background: ${BG}; }
        @media (max-width: 900px) { .lp-2col { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ---------- NAV ---------- */}
      <nav
        style={{
          borderBottom: `1px solid ${LINE}`,
          position: "sticky",
          top: 0,
          background: `${BG}F2`,
          backdropFilter: "blur(8px)",
          zIndex: 50,
        }}
      >
        <div
          className="lp-sec"
          style={{ display: "flex", alignItems: "center", gap: 26, padding: "14px 20px" }}
        >
          <a
            href="/"
            className="lp-display"
            style={{ fontWeight: 800, fontSize: 19, color: INK, textDecoration: "none" }}
          >
            Mention<span style={{ color: ACCENT }}>My</span>App
          </a>
          <div style={{ display: "flex", gap: 22, fontSize: 14, color: MUTED }}>
            <a href="#stories" style={{ color: "inherit", textDecoration: "none" }}>
              Success stories
            </a>
            <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>
              Features
            </a>
            <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>
              Pricing
            </a>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <a
              href="/auth"
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                color: INK,
                textDecoration: "none",
                padding: "10px 14px",
              }}
            >
              Sign in
            </a>
            <a href="/grow" className="lp-cta" style={{ padding: "11px 20px", fontSize: 14 }}>
              Start for free
            </a>
          </div>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <HeroBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <header
            style={{
              textAlign: "center",
              padding: "76px 20px 20px",
              background: `radial-gradient(60% 50% at 50% 0%, ${ACCENT}0D, transparent)`,
            }}
          >
            <div className="lp-sec">
              <h1
                className="lp-display"
                style={{
                  fontSize: "clamp(38px, 6vw, 68px)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  margin: "0 auto 20px",
                  maxWidth: 900,
                }}
              >
                Audit, publish, and measure{" "}
                <span style={{ color: ACCENT }}>organic growth with evidence</span>
              </h1>
              <div
                className="lp-display"
                style={{
                  margin: "2px auto 22px",
                  fontSize: "clamp(38px, 6vw, 68px)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  color: INK,
                  letterSpacing: "-0.01em",
                }}
              >
                Build visibility across <EngineRotator />
              </div>
              <p
                style={{
                  fontSize: 18.5,
                  color: MUTED,
                  lineHeight: 1.6,
                  maxWidth: 660,
                  margin: "0 auto 30px",
                }}
              >
                MentionMyApp turns site audits, approved publishing, verified backlinks, and real
                Search Console data into one truthful growth workspace.
              </p>
              <a href="/grow" className="lp-cta" style={{ fontSize: 16.5, padding: "18px 38px" }}>
                Start for free
              </a>
              <div style={{ marginTop: 16, fontSize: 14.5, color: MUTED }}>
                If your organic metrics don't improve within 90 days,{" "}
                <strong style={{ color: INK }}>you get your money back</strong> 🛡
              </div>

              {/* Client logo strip — hidden until CLIENTS has real entries */}
              {CLIENTS.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 0,
                    marginTop: 44,
                    border: `1px solid ${LINE}`,
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  {CLIENTS.map((c) => (
                    <div
                      key={c}
                      style={{
                        padding: "14px 26px",
                        borderRight: `1px solid ${LINE}`,
                        fontFamily: "Georgia, serif",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#9AA0AA",
                      }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </header>
          <PressMarquee />
        </div>
      </div>

      {/* ---------- FREE GEO AUDIT WIDGET ---------- */}
      <section className="lp-sec" style={{ padding: "36px 20px 20px" }}>
        <div
          className="lp-card"
          style={{
            textAlign: "center",
            padding: "50px 24px",
            background: `radial-gradient(50% 60% at 50% 0%, ${ACCENT}0F, ${BG})`,
          }}
        >
          <div className="lp-eyebrow">Free SEO · AEO · GEO readiness audit</div>
          <h2 className="lp-h2" style={{ maxWidth: 720, margin: "12px auto 0" }}>
            Can search engines and AI crawlers clearly understand{" "}
            <span style={{ color: ACCENT }}>what your website offers?</span>
          </h2>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              margin: "24px 0 26px",
            }}
          >
            {ENGINES.map((e) => (
              <span key={e} className="lp-chip">
                <EngineIcon name={e} size={16} /> {e}
              </span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 560,
              margin: "0 auto",
              background: BG,
              border: `1.5px solid ${LINE}`,
              borderRadius: 999,
              padding: 6,
              boxShadow: "0 14px 34px rgba(23,26,43,0.08)",
            }}
          >
            <input
              value={auditUrl}
              onChange={(e) => setAuditUrl(e.target.value)}
              placeholder="yourwebsite.com"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                padding: "12px 18px",
                fontSize: 15.5,
                fontFamily: "inherit",
                background: "transparent",
                color: INK,
                minWidth: 0,
              }}
            />
            <a
              href={`/grow?site=${encodeURIComponent(auditUrl)}`}
              className="lp-cta"
              style={{ padding: "12px 24px", fontSize: 14.5, whiteSpace: "nowrap" }}
            >
              Run free audit →
            </a>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="lp-sec" style={{ padding: "70px 20px 20px" }}>
        <div className="lp-eyebrow">How it works</div>
        <h2 className="lp-h2">
          Traffic growth made simple <span className="ghost">— in three strategic steps.</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginTop: 34,
          }}
        >
          {STEPS.map((s) => (
            <div key={s.n} className="lp-card" style={{ padding: "26px 28px" }}>
              <div
                className="lp-display"
                style={{ color: ACCENT, fontWeight: 800, fontSize: 15, marginBottom: 10 }}
              >
                {s.n}
              </div>
              <h3
                className="lp-display"
                style={{ fontSize: 21, fontWeight: 800, margin: "0 0 10px" }}
              >
                {s.t}
              </h3>
              <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.65, margin: "0 0 16px" }}>
                {s.d}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {s.chips.map((c) => (
                  <span key={c} className="lp-chip" style={{ fontSize: 12, padding: "6px 12px" }}>
                    <span style={{ color: POS }}>✓</span> {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- PLATFORM FEATURES ---------- */}
      <section id="features" className="lp-sec" style={{ padding: "70px 20px 20px" }}>
        <div className="lp-eyebrow">Platform features</div>
        <h2 className="lp-h2">
          A powerful suite of features <span className="ghost">— all in one place.</span>
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
            marginTop: 34,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.t}
              className="lp-card"
              style={{ padding: "24px 26px", gridColumn: f.wide ? "span 1" : undefined }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <h3 className="lp-display" style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>
                  {f.t}
                </h3>
                <span style={{ fontSize: 18 }} aria-hidden>
                  {f.icon}
                </span>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  marginBottom: 10,
                  borderRadius: 999,
                  padding: "4px 9px",
                  background: f.status === "Available" ? "#ECFDF5" : "#FFF7ED",
                  color: f.status === "Available" ? "#047857" : "#9A3412",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {f.status}
              </span>
              <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- WRITTEN LIKE YOU ---------- */}
      <section className="lp-sec" style={{ padding: "70px 20px 20px" }}>
        <div className="lp-eyebrow">Controlled delivery</div>
        <h2 className="lp-h2">
          Your website stays yours <span className="ghost">— every change is explicit.</span>
        </h2>
        <p style={{ color: MUTED, fontSize: 16, maxWidth: 640, margin: "14px 0 30px" }}>
          Connect only the destination you authorize, review the page content, and choose draft,
          publish, or pull-request delivery where the platform supports it.
        </p>
        <div
          className="lp-2col"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}
        >
          <MiniCard n="1" title="Scoped connection">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["WordPress", "Shopify", "GitHub"].map((platform) => (
                <span key={platform} className="lp-chip" style={{ fontSize: 12.5 }}>
                  {platform}
                </span>
              ))}
            </div>
          </MiniCard>
          <MiniCard n="2" title="Approval state">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["draft", "approved", "published"].map((t) => (
                <span key={t} className="lp-chip" style={{ fontSize: 12.5 }}>
                  {t}
                </span>
              ))}
            </div>
          </MiniCard>
          <MiniCard n="3" title="Evidence trail">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Job status", "Published URL", "Verified backlink"].map((t) => (
                <span
                  key={t}
                  className="lp-chip"
                  style={{ fontSize: 12.5, color: ACCENT_DARK, borderColor: `${ACCENT}55` }}
                >
                  🔗 {t}
                </span>
              ))}
            </div>
          </MiniCard>
        </div>
      </section>

      {/* ---------- SUCCESS STORIES (hidden until real) ---------- */}
      {CASES.length > 0 && (
        <section id="stories" className="lp-sec" style={{ padding: "70px 20px 20px" }}>
          <div className="lp-eyebrow">Success stories</div>
          <h2 className="lp-h2">
            Our customer results <span className="ghost">— receipts included.</span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 16,
              marginTop: 34,
            }}
          >
            {CASES.map((c) => (
              <div key={c.company} className="lp-card" style={{ padding: "26px 28px" }}>
                <h3
                  className="lp-display"
                  style={{ fontSize: 19, fontWeight: 800, margin: "0 0 14px" }}
                >
                  {c.headline}
                </h3>
                <div style={{ display: "flex", gap: 26, marginBottom: 14 }}>
                  {[c.stat1, c.stat2].map(([v, l]) => (
                    <div key={l}>
                      <div className="lp-display" style={{ fontSize: 26, fontWeight: 800 }}>
                        {v}
                      </div>
                      <div style={{ fontSize: 12, color: MUTED }}>{l}</div>
                    </div>
                  ))}
                </div>
                {c.quote && (
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>
                    "{c.quote}" — {c.person}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- NETWORK / MAP ---------- */}
      <section className="lp-sec" style={{ padding: "70px 20px 10px" }}>
        <div className="lp-eyebrow">From Chicago to everywhere</div>
        <h2 className="lp-h2">
          One team in Chicago <span className="ghost">— growing businesses worldwide.</span>
        </h2>
        <div style={{ marginTop: 20 }}>
          <WorldMap hqLabel="MentionMyApp" accent={ACCENT} dot="#C7CAF0" height={440} />
        </div>
      </section>

      {/* ---------- TWIN OUTCOME CARDS ---------- */}
      <section className="lp-sec" style={{ padding: "50px 20px 20px" }}>
        <div
          className="lp-2col"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div className="lp-card" style={{ padding: "28px 30px" }}>
            <h3
              className="lp-display"
              style={{ fontSize: 24, fontWeight: 800, margin: "0 0 10px" }}
            >
              Measure Google search performance
            </h3>
            <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.65, margin: "0 0 20px" }}>
              Verified clicks and impressions sync from your Search Console property and stay
              comparable to the saved 28-day baseline.
            </p>
            {/* mini GSC-style chart */}
            <svg viewBox="0 0 420 150" style={{ width: "100%" }}>
              {[30, 70, 110].map((y) => (
                <line key={y} x1="0" x2="420" y1={y} y2={y} stroke={LINE} strokeWidth="1" />
              ))}
              <path
                d="M0,135 C60,133 120,128 180,112 C250,92 320,58 420,26 L420,150 L0,150 Z"
                fill={`${ACCENT}1A`}
              />
              <path
                d="M0,135 C60,133 120,128 180,112 C250,92 320,58 420,26"
                fill="none"
                stroke={ACCENT}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1="150"
                x2="150"
                y1="10"
                y2="140"
                stroke={MUTED}
                strokeDasharray="5 5"
                strokeWidth="1.2"
                opacity="0.6"
              />
              <text x="156" y="22" fontSize="10" fill={MUTED} fontFamily="Inter">
                work starts
              </text>
            </svg>
          </div>
          <div className="lp-card" style={{ padding: "28px 30px" }}>
            <h3
              className="lp-display"
              style={{ fontSize: 24, fontWeight: 800, margin: "0 0 10px" }}
            >
              Prepare for AI discovery
            </h3>
            <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.65, margin: "0 0 20px" }}>
              Audit the structure that search and answer engines can read. Mention tracking appears
              only after a real visibility provider is connected.
            </p>
            <div
              style={{
                background: PANEL,
                borderRadius: 14,
                padding: "16px 18px",
                fontSize: 13.5,
                lineHeight: 1.6,
              }}
            >
              <div style={{ textAlign: "right", marginBottom: 10 }}>
                <span
                  style={{
                    background: INK,
                    color: "#fff",
                    borderRadius: 12,
                    padding: "8px 14px",
                    display: "inline-block",
                  }}
                >
                  What's the best option near me?
                </span>
              </div>
              <div
                style={{
                  background: BG,
                  border: `1.5px solid ${LINE}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                Provider not connected — MentionMyApp will not invent an AI recommendation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PRICING ANCHOR ---------- */}
      <section
        id="pricing"
        style={{ background: NAVY, color: "#fff", padding: "60px 20px", marginTop: 50 }}
      >
        <div className="lp-sec" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", color: "#A5B4FC" }}>
            SIMPLE PRICING
          </div>
          <h2
            className="lp-display"
            style={{ fontSize: "clamp(26px, 3.4vw, 38px)", fontWeight: 800, margin: "12px 0 8px" }}
          >
            $49/month for the core growth workspace.
          </h2>
          <p style={{ color: "#B6BAD1", fontSize: 15, margin: "0 0 26px" }}>
            No measurable growth in 90 days — every dollar back. Cancel anytime.
          </p>
          <a href="/grow" className="lp-cta" style={{ fontSize: 16, padding: "17px 34px" }}>
            Start with a free growth audit →
          </a>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer
        style={{ borderTop: `1px solid ${LINE}`, padding: "26px 20px", fontSize: 13, color: MUTED }}
      >
        <div
          className="lp-sec"
          style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
        >
          <span>© {new Date().getFullYear()} MentionMyApp · Chicago, IL</span>
          <span style={{ display: "flex", gap: 18 }}>
            <a href="/grow" style={{ color: "inherit" }}>
              Free audit
            </a>
            <a href="/auth" style={{ color: "inherit" }}>
              Sign in
            </a>
            <a href="/terms" style={{ color: "inherit" }}>
              Guarantee terms
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

// ---------- Small pieces ----------
function MiniCard({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#F6F6FB", borderRadius: 18, padding: "22px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#6366F1",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {n}
        </span>
        <span
          style={{
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#6B7280",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
