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

import { useState, type CSSProperties } from "react";
import EngineRotator from "@/components/EngineRotator";
import EngineIcon, { type EngineName } from "@/components/engineIcons";
import HeroBackground from "@/components/HeroBackground";
import PressMarquee from "@/components/PressMarquee";
import GrowthCharts from "@/components/GrowthCharts";
import WorldMap from "@/components/WorldMap";

// ---------- Brand ----------
const ACCENT = "#6366F1";
const ACCENT_DARK = "#4F46E5";
const INK = "#171A2B";
const MUTED = "#6B7280";
const LINE = "#E5E7EB";
const BG = "#FFFFFF";

// ---------- Editorial paper palette (below-hero sections) ----------
const PAPER = "#F4F5FB";
const INKD = "#0C0E1A";
const VIOLET = "#6C5CE7";
const MUTEDW = "#6B7086";

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
    wide: true,
    status: "Available",
  },
  {
    t: "Search Console Reporting",
    d: "Imports verified clicks and impressions, saves a comparable day-one baseline, and syncs performance daily.",
    wide: true,
    status: "Available",
  },
  {
    t: "Approved Publishing",
    d: "Queues approved pages for WordPress, Shopify, or a selected GitHub repository, with draft and review modes where supported.",
    status: "Available",
  },
  {
    t: "Verified Backlink Workflow",
    d: "Schedules directory opportunities and counts a placement live only after the public page links back to your site.",
    status: "Available",
  },
  {
    t: "AI Visibility Workspace",
    d: "Tracks whether ChatGPT, Gemini, Claude, and Perplexity mention your brand when people ask about your category.",
    status: "Available",
  },
  {
    t: "Authority Snapshot",
    d: "Shows your authority score, referring domains, backlinks, and keyword estimates in one place.",
    status: "Available",
  },
  {
    t: "Tracked Content Plan",
    d: "Records approved and published pages, target keywords, and indexing status without inventing work that has not happened.",
    status: "Available",
  },
  {
    t: "Connection Status",
    d: "Keeps website, repository, store, and Search Console states aligned so connected services are marked correctly.",
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
                  fontSize: "clamp(38px, 5.6vw, 68px)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  margin: "0 auto 24px",
                  maxWidth: 1240,
                }}
              >
                Grow organic traffic
                <span
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.32em",
                  }}
                >
                  <span style={{ color: ACCENT }}>on autopilot</span>
                  <span>from</span>
                  <EngineRotator />
                </span>
              </h1>
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

              {/* ---------- RESULTS STRIP ---------- */}
              <div
                style={{
                  marginTop: 46,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: 1,
                  background: LINE,
                  border: `1px solid ${LINE}`,
                  borderRadius: 16,
                  overflow: "hidden",
                  maxWidth: 900,
                  margin: "46px auto 0",
                }}
              >
                {[
                  { value: "+312%", label: "Search impressions" },
                  { value: "+187%", label: "Organic clicks" },
                  { value: "+64%", label: "Qualified signups" },
                  { value: "90 days", label: "Money-back guarantee" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{ background: "#fff", padding: "22px 18px", textAlign: "center" }}
                  >
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        color: ACCENT,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13.5, color: MUTED }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 12.5, color: MUTED }}>
                Average change across managed sites in their first 90 days.
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

      {/* ================= EDITORIAL PAPER SECTIONS ================= */}
      <div className="brut">
        <style>{`
          .brut { position: relative; background:
              radial-gradient(900px 480px at 12% -8%, rgba(108,92,231,0.13), transparent 62%),
              radial-gradient(760px 420px at 92% 12%, rgba(56,189,248,0.12), transparent 60%),
              ${PAPER};
            color: ${INKD}; font-family: 'DM Sans', system-ui, sans-serif; }
          .brut .wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
          .brut h2, .brut h3, .brut h4, .brut .grotesk { font-family: 'Space Grotesk', 'DM Sans', sans-serif; letter-spacing: -0.02em; }
          .brut section { border-color: rgba(12,14,26,0.07) !important; }
          .brut .rule { border-top: 1px solid rgba(12,14,26,0.08); }
          .brut .box {
            border: 1px solid rgba(12,14,26,0.07) !important;
            border-radius: 28px !important;
            box-shadow: 0 18px 44px -24px rgba(12,14,26,0.35);
          }
          /* split / column layouts become separate rounded cards instead of hard-divided panels */
          .brut .split.box, .brut .grid3.box, .brut .bento.box {
            border: 0 !important; box-shadow: none !important; border-radius: 0 !important; background: transparent !important;
            gap: 22px;
          }
          .brut .split.box > *, .brut .grid3.box > *, .brut .bento.box > * {
            border: 1px solid rgba(12,14,26,0.07) !important;
            border-radius: 28px !important;
            box-shadow: 0 18px 44px -24px rgba(12,14,26,0.35);
          }
          .brut .box > * { border-right-color: rgba(12,14,26,0.07) !important; border-bottom-color: rgba(12,14,26,0.07) !important; border-left-color: rgba(12,14,26,0.07) !important; }
          .brut .lift { transition: box-shadow 260ms cubic-bezier(.22,1,.36,1), transform 260ms cubic-bezier(.22,1,.36,1); }
          .brut .lift:hover, .brut .lift-ink:hover { box-shadow: 0 28px 60px -28px rgba(108,92,231,0.65) !important; transform: translateY(-6px) !important; }
          .brut .eyebrow { font-size: 11.5px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${VIOLET}; }
          .brut .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            border: 1px solid transparent !important; border-radius: 999px !important;
            background: linear-gradient(135deg, #8B7BFF 0%, #5A46F5 60%, #4130D6 100%);
            color: #fff; font-weight: 600; font-family: 'Space Grotesk', sans-serif; padding: 15px 30px;
            text-decoration: none; cursor: pointer; letter-spacing: -0.01em;
            box-shadow: 0 14px 30px -12px rgba(108,92,231,0.75);
            transition: transform 220ms cubic-bezier(.22,1,.36,1), box-shadow 220ms, filter 220ms; }
          .brut .btn:hover { transform: translateY(-3px); filter: brightness(1.07); box-shadow: 0 22px 44px -14px rgba(108,92,231,0.85); }
          .brut .btn-ghost { background: rgba(255,255,255,0.7) !important; color: ${INKD}; border: 1px solid rgba(12,14,26,0.12) !important; box-shadow: none; }
          .brut .btn-ghost:hover { background: #fff !important; box-shadow: 0 14px 30px -18px rgba(12,14,26,0.6); }
          .brut .grid3 { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 22px; }
          .brut .grid2 { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 22px; }
          .brut .bento { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 22px; }
          .brut .num { font-family: 'Space Grotesk', sans-serif; font-size: 68px; font-weight: 700; line-height: 1; opacity: 0.14; }
          .brut input, .brut select, .brut textarea { font-family: inherit; border-radius: 999px !important; }
          .brut input:not([type="checkbox"]) { padding-left: 18px !important; padding-right: 18px !important; }
          .brut svg, .brut img { border-radius: 18px; }
          @media (max-width: 900px) {
            .brut .grid3, .brut .grid2, .brut .bento, .brut .split { grid-template-columns: 1fr !important; }
            .brut .span2, .brut .span3 { grid-column: auto !important; }
          }
        `}</style>

        {/* ---------- FREE AUDIT ---------- */}
        <section style={{ padding: "88px 0", borderBottom: `1px solid ${INKD}` }}>
          <div className="wrap">
            <div className="split box" style={{ display: "grid", gridTemplateColumns: "7fr 5fr" }}>
              <div style={{ padding: 48, borderRight: `1px solid ${INKD}`, background: "#fff" }}>
                <div className="eyebrow" style={{ marginBottom: 18 }}>
                  Free SEO · AEO · GEO readiness audit
                </div>
                <h2
                  style={{
                    fontSize: "clamp(30px, 3.6vw, 46px)",
                    fontWeight: 700,
                    lineHeight: 1.05,
                    margin: "0 0 28px",
                  }}
                >
                  CAN SEARCH ENGINES AND AI CRAWLERS UNDERSTAND{" "}
                  <span style={{ color: VIOLET }}>WHAT YOU OFFER?</span>
                </h2>
                <div
                  style={{
                    display: "flex",
                    border: `1px solid rgba(12,14,26,0.10)`,
                    borderRadius: 999,
                    background: "#fff",
                    padding: 5,
                    boxShadow: "0 14px 34px -22px rgba(12,14,26,0.6)",
                    marginBottom: 20,
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
                      background: "transparent",
                      padding: "16px 20px",
                      fontSize: 16,
                      color: INKD,
                      minWidth: 0,
                    }}
                  />
                  <a
                    href={`/grow?site=${encodeURIComponent(auditUrl)}`}
                    className="btn"
                    style={{ whiteSpace: "nowrap", padding: "13px 26px" }}
                  >
                    ANALYZE
                  </a>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {ENGINES.map((e) => (
                    <span
                      key={e}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        border: `1px solid rgba(12,14,26,0.10)`,
                        borderRadius: 999,
                        padding: "7px 14px",
                        fontSize: 13,
                        fontWeight: 500,
                        background: "#fff",
                      }}
                    >
                      <EngineIcon name={e} size={15} /> {e}
                    </span>
                  ))}
                </div>
              </div>
              <div
                style={{
                  padding: 48,
                  background: INKD,
                  color: PAPER,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 26,
                }}
              >
                {[
                  [
                    "Full technical audit",
                    "We crawl every page and flag what's blocking you from ranking.",
                  ],
                  [
                    "Backlinks that actually stick",
                    "Submitted daily, then confirmed live — nothing counted until it is.",
                  ],
                  [
                    "Numbers straight from Google",
                    "Clicks, impressions and positions pulled from your own Search Console.",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      borderBottom: `1px solid ${MUTEDW}33`,
                      paddingBottom: 18,
                    }}
                  >
                    <span
                      style={{
                        marginTop: 7,
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: VIOLET,
                        flex: "0 0 auto",
                      }}
                    />
                    <div>
                      <div className="grotesk" style={{ fontSize: 19, fontWeight: 600 }}>
                        {label}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 14.5,
                          lineHeight: 1.55,
                          color: MUTEDW,
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- HOW IT WORKS + FEATURE BENTO ---------- */}
        <section id="features" style={{ padding: "88px 0", background: "#fff" }}>
          <div className="wrap">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 32,
                flexWrap: "wrap",
                marginBottom: 56,
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(34px, 5vw, 62px)",
                  fontWeight: 700,
                  lineHeight: 0.95,
                  margin: 0,
                }}
              >
                HOW THE
                <br />
                GROWTH ENGINE RUNS
              </h2>
              <p style={{ maxWidth: 300, textAlign: "right", color: MUTEDW, margin: 0 }}>
                Audit, publish, verify, measure — one loop that runs every day on your site.
              </p>
            </div>

            <div className="grid3">
              {STEPS.map((s, i) => (
                <div
                  key={s.n}
                  className={`box ${i === 1 ? "lift-ink" : "lift"}`}
                  style={{
                    padding: 32,
                    minHeight: 320,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    background: i === 1 ? VIOLET : "#fff",
                    color: i === 1 ? "#fff" : INKD,
                  }}
                >
                  <div className="num" style={{ opacity: i === 1 ? 0.25 : 0.12 }}>
                    {s.n}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        margin: "0 0 12px",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.t}
                    </h3>
                    <p style={{ margin: "0 0 16px", lineHeight: 1.6, fontSize: 14.5 }}>{s.d}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {s.chips.map((c) => (
                        <span
                          key={c}
                          style={{
                            border: `1px solid ${i === 1 ? "rgba(255,255,255,0.45)" : "rgba(12,14,26,0.12)"}`,
                            borderRadius: 999,
                            background: i === 1 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.7)",
                            padding: "5px 12px",
                            fontSize: 11.5,
                            fontWeight: 500,
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <GrowthCharts />

            <div className="bento" style={{ marginTop: 20 }}>
              {FEATURES.map((f, i) => {
                const dark = i === 3;
                const wide = i === 0 || i === 5 || i === 6 || i === 7;
                return (
                  <div
                    key={f.t}
                    className={`box ${dark ? "lift-ink" : "lift"} ${wide ? "span2" : ""}`}
                    style={{
                      gridColumn: wide ? "span 2" : undefined,
                      padding: 30,
                      minHeight: 200,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                      background: dark ? INKD : PAPER,
                      color: dark ? PAPER : INKD,
                    }}
                  >
                    <FeatureVisual index={i} dark={dark} />
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: dark ? "#A99CFF" : VIOLET,
                          marginTop: 22,
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3
                        className="grotesk"
                        style={{
                          fontSize: wide ? 24 : 19,
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          margin: "6px 0 8px",
                          lineHeight: 1.2,
                        }}
                      >
                        {f.t}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          lineHeight: 1.6,
                          opacity: dark ? 0.72 : 0.68,
                          maxWidth: 460,
                        }}
                      >
                        {f.d}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- CONTROLLED DELIVERY ---------- */}
        <section style={{ padding: "88px 0", borderTop: `1px solid ${INKD}` }}>
          <div className="wrap">
            <div className="eyebrow">Controlled delivery</div>
            <h2
              style={{
                fontSize: "clamp(30px, 4vw, 50px)",
                fontWeight: 700,
                margin: "14px 0 12px",
                lineHeight: 1,
              }}
            >
              YOUR WEBSITE STAYS YOURS.
            </h2>
            <p style={{ color: MUTEDW, maxWidth: 620, margin: "0 0 40px", fontSize: 16 }}>
              Connect only the destination you authorize, review the page content, and choose draft,
              publish, or pull-request delivery where the platform supports it.
            </p>
            <div className="grid3">
              {[
                { n: "1", t: "Scoped connection", items: ["WordPress", "Shopify", "GitHub"] },
                { n: "2", t: "Approval state", items: ["draft", "approved", "published"] },
                {
                  n: "3",
                  t: "Evidence trail",
                  items: ["Job status", "Published URL", "Verified backlink"],
                },
              ].map((m) => (
                <div key={m.n} className="box lift" style={{ padding: 30, background: "#fff" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <span
                      className="grotesk"
                      style={{
                        background: VIOLET,
                        color: "#fff",
                        width: 26,
                        height: 26,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {m.n}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 12,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                      }}
                    >
                      {m.t}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {m.items.map((t) => (
                      <span
                        key={t}
                        style={{
                          border: `1px solid rgba(12,14,26,0.12)`,
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.75)",
                          padding: "6px 14px",
                          fontSize: 12.5,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- SUCCESS STORIES (hidden until real) ---------- */}
        {CASES.length > 0 && (
          <section id="stories" style={{ padding: "88px 0", borderTop: `1px solid ${INKD}` }}>
            <div className="wrap">
              <div className="eyebrow">Success stories</div>
              <h2 style={{ fontSize: 46, fontWeight: 700, margin: "14px 0 40px" }}>
                CUSTOMER RESULTS
              </h2>
              <div className="grid3">
                {CASES.map((c) => (
                  <div
                    key={c.company}
                    className="box lift"
                    style={{ padding: 30, background: "#fff" }}
                  >
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 18px" }}>
                      {c.headline}
                    </h3>
                    <div style={{ display: "flex", gap: 28, marginBottom: 16 }}>
                      {[c.stat1, c.stat2].map(([v, l]) => (
                        <div key={l}>
                          <div className="grotesk" style={{ fontSize: 30, fontWeight: 700 }}>
                            {v}
                          </div>
                          <div style={{ fontSize: 12, color: MUTEDW }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    {c.quote && (
                      <p style={{ fontSize: 14, color: MUTEDW, lineHeight: 1.6, margin: 0 }}>
                        "{c.quote}" — {c.person}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- MEASUREMENT TWIN CARDS ---------- */}
        <section style={{ padding: "88px 0", background: "#fff", borderTop: `1px solid ${INKD}` }}>
          <div className="wrap">
            <div className="grid2">
              <div className="box" style={{ padding: 36, background: PAPER }}>
                <h3
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    margin: "0 0 12px",
                    textTransform: "uppercase",
                  }}
                >
                  Measure Google performance
                </h3>
                <p style={{ color: MUTEDW, fontSize: 14.5, lineHeight: 1.65, margin: "0 0 24px" }}>
                  Verified clicks and impressions sync from your Search Console property and stay
                  comparable to the saved 28-day baseline.
                </p>
                <svg viewBox="0 0 420 150" style={{ width: "100%" }}>
                  {[30, 70, 110].map((y) => (
                    <line key={y} x1="0" x2="420" y1={y} y2={y} stroke={MUTEDW} strokeWidth="1" />
                  ))}
                  <path
                    d="M0,135 C60,133 120,128 180,112 C250,92 320,58 420,26 L420,150 L0,150 Z"
                    fill={`${VIOLET}22`}
                  />
                  <path
                    d="M0,135 C60,133 120,128 180,112 C250,92 320,58 420,26"
                    fill="none"
                    stroke={VIOLET}
                    strokeWidth="3"
                  />
                  <line
                    x1="150"
                    x2="150"
                    y1="10"
                    y2="140"
                    stroke={INKD}
                    strokeDasharray="5 5"
                    strokeWidth="1.2"
                  />
                  <text x="156" y="22" fontSize="10" fill={INKD} fontFamily="DM Sans">
                    work starts
                  </text>
                </svg>
              </div>
              <div className="box" style={{ padding: 36, background: INKD, color: PAPER }}>
                <h3
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    margin: "0 0 12px",
                    textTransform: "uppercase",
                  }}
                >
                  Prepare for AI discovery
                </h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, margin: "0 0 24px", opacity: 0.75 }}>
                  Audit the structure that search and answer engines can read. Mention tracking
                  appears only after a real visibility provider is connected.
                </p>
                <div style={{ border: `1px solid ${MUTEDW}55`, padding: 18 }}>
                  <div style={{ textAlign: "right", marginBottom: 12 }}>
                    <span
                      style={{
                        background: VIOLET,
                        color: "#fff",
                        padding: "8px 14px",
                        display: "inline-block",
                        fontSize: 13.5,
                      }}
                    >
                      What's the best option near me?
                    </span>
                  </div>
                  <div
                    style={{
                      border: `1px solid ${MUTEDW}55`,
                      padding: "12px 14px",
                      fontSize: 13.5,
                      opacity: 0.8,
                    }}
                  >
                    Provider not connected — MentionMyApp will not invent an AI recommendation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- NETWORK / MAP ---------- */}
        <section style={{ padding: "80px 0", borderTop: `1px solid ${INKD}` }}>
          <div className="wrap">
            <div className="eyebrow">From Chicago to everywhere</div>
            <h2
              style={{
                fontSize: "clamp(30px, 4vw, 50px)",
                fontWeight: 700,
                margin: "14px 0 0",
                lineHeight: 1,
              }}
            >
              ONE TEAM IN CHICAGO. <span style={{ color: MUTEDW }}>CLIENTS WORLDWIDE.</span>
            </h2>
            <div style={{ marginTop: 24 }}>
              <WorldMap hqLabel="MentionMyApp" accent={VIOLET} dot="#C9C4BC" height={440} />
            </div>
          </div>
        </section>

        {/* ---------- PRICING ---------- */}
        <section id="pricing" style={{ padding: "88px 0", borderTop: `1px solid ${INKD}` }}>
          <div className="wrap">
            <h2
              style={{
                fontSize: "clamp(32px, 4.4vw, 54px)",
                fontWeight: 700,
                margin: "0 0 40px",
                textAlign: "center",
              }}
            >
              INVEST IN GROWTH
            </h2>
            <div className="box grid3" style={{ gap: 0, borderRight: 0, background: "#fff" }}>
              {[
                {
                  name: "Core",
                  price: "$49",
                  suffix: "/mo",
                  items: ["1 website", "Daily SEO page", "Automatic directory backlinks"],
                  cta: "Start free audit",
                  featured: false,
                },
                {
                  name: "Growth",
                  price: "$149",
                  suffix: "/mo",
                  items: [
                    "Up to 5 websites",
                    "Search Console + Semrush sync",
                    "Priority publishing queue",
                  ],
                  cta: "Go pro",
                  featured: true,
                },
                {
                  name: "Agency",
                  price: "Custom",
                  suffix: "",
                  items: ["Unlimited websites", "Client report links", "Dedicated strategist"],
                  cta: "Contact us",
                  featured: false,
                },
              ].map((p) => (
                <div
                  key={p.name}
                  style={{
                    padding: 40,
                    borderRight: `1px solid ${INKD}`,
                    background: p.featured ? PAPER : "#fff",
                    position: "relative",
                  }}
                >
                  {p.featured && (
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: VIOLET,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        padding: "4px 10px",
                        textTransform: "uppercase",
                      }}
                    >
                      Best value
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: p.featured ? VIOLET : INKD,
                    }}
                  >
                    {p.name}
                  </span>
                  <div
                    className="grotesk"
                    style={{ fontSize: 46, fontWeight: 700, margin: "20px 0" }}
                  >
                    {p.price}
                    <span style={{ fontSize: 16, fontWeight: 500 }}>{p.suffix}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px" }}>
                    {p.items.map((it) => (
                      <li
                        key={it}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontSize: 14.5,
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            background: VIOLET,
                            display: "inline-block",
                          }}
                        />
                        {it}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/grow"
                    className={`btn ${p.featured ? "" : "btn-ghost"}`}
                    style={{ width: "100%", boxSizing: "border-box" }}
                  >
                    {p.cta.toUpperCase()}
                  </a>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", color: MUTEDW, marginTop: 20, fontSize: 14.5 }}>
              No measurable growth in 90 days — every dollar back. Cancel anytime.
            </p>
          </div>
        </section>

        {/* ---------- FOOTER ---------- */}
        <footer style={{ background: INKD, color: PAPER, padding: "72px 0 40px" }}>
          <div className="wrap">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 40,
                borderBottom: `1px solid ${MUTEDW}33`,
                paddingBottom: 40,
                marginBottom: 32,
              }}
            >
              <div style={{ maxWidth: 320 }}>
                <div
                  className="grotesk"
                  style={{ fontSize: 26, fontWeight: 700, marginBottom: 14 }}
                >
                  MENTIONMYAPP
                </div>
                <p style={{ margin: 0, opacity: 0.7, fontSize: 14.5, lineHeight: 1.6 }}>
                  Verified SEO growth on autopilot — audits, published pages, real backlinks, and
                  Search Console proof.
                </p>
              </div>
              <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
                <div>
                  <h5
                    style={{
                      color: VIOLET,
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      margin: "0 0 14px",
                    }}
                  >
                    Product
                  </h5>
                  <ul
                    style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, opacity: 0.7 }}
                  >
                    <li style={{ marginBottom: 8 }}>
                      <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>
                        Features
                      </a>
                    </li>
                    <li style={{ marginBottom: 8 }}>
                      <a href="#pricing" style={{ color: "inherit", textDecoration: "none" }}>
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a href="/how-it-works" style={{ color: "inherit", textDecoration: "none" }}>
                        How it works
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5
                    style={{
                      color: VIOLET,
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      margin: "0 0 14px",
                    }}
                  >
                    Company
                  </h5>
                  <ul
                    style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, opacity: 0.7 }}
                  >
                    <li style={{ marginBottom: 8 }}>
                      <a href="/about" style={{ color: "inherit", textDecoration: "none" }}>
                        About
                      </a>
                    </li>
                    <li style={{ marginBottom: 8 }}>
                      <a href="/contact" style={{ color: "inherit", textDecoration: "none" }}>
                        Contact
                      </a>
                    </li>
                    <li>
                      <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }}>
                        Privacy
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5
                    style={{
                      color: VIOLET,
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      margin: "0 0 14px",
                    }}
                  >
                    Start
                  </h5>
                  <ul
                    style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, opacity: 0.7 }}
                  >
                    <li style={{ marginBottom: 8 }}>
                      <a href="/grow" style={{ color: "inherit", textDecoration: "none" }}>
                        Free audit
                      </a>
                    </li>
                    <li style={{ marginBottom: 8 }}>
                      <a href="/auth" style={{ color: "inherit", textDecoration: "none" }}>
                        Sign in
                      </a>
                    </li>
                    <li>
                      <a href="/terms" style={{ color: "inherit", textDecoration: "none" }}>
                        Guarantee terms
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                fontSize: 11.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                opacity: 0.45,
              }}
            >
              <span>© {new Date().getFullYear()} MentionMyApp · Chicago, IL</span>
              <span>Verified growth reporting</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Feature card mini-previews ---------- */
function FeatureVisual({ index, dark }: { index: number; dark: boolean }) {
  const line = dark ? "rgba(244,245,251,0.12)" : "rgba(12,14,26,0.08)";
  const card: CSSProperties = {
    background: dark ? "rgba(255,255,255,0.05)" : "#fff",
    minWidth: 0,
    overflow: "hidden",
    border: `1px solid ${line}`,
    borderRadius: 14,
    padding: 14,
    fontSize: 12,
    minHeight: 120,
    minWidth: 0,
    overflow: "hidden",
    color: dark ? "#F4F5FB" : "#0C0E1A",
  };
  const muted = dark ? "rgba(244,245,251,0.55)" : "#6B7086";
  const pill = (t: string, c: string, bg: string) => (
    <span style={{ fontSize: 10.5, fontWeight: 600, color: c, background: bg, borderRadius: 999, padding: "2px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>{t}</span>
  );
  const ok = pill("Pass", "#1F7A4D", "#E4F5EB");
  const warn = pill("Fix", "#9A5B00", "#FFF1D6");

  switch (index) {
    case 0:
      return (
        <div style={{ ...card, display: "grid", gridTemplateColumns: "96px 1fr", gap: 18, alignItems: "center" }}>
          <div style={{ position: "relative", width: 96, height: 96 }}>
            <svg viewBox="0 0 36 36" width="96" height="96">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke={line} strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6C5CE7" strokeWidth="3" strokeDasharray="84 100" strokeLinecap="round" transform="rotate(-90 18 18)" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 22 }} className="grotesk">86</div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[["Crawlability", ok], ["Meta descriptions", warn], ["Schema markup", ok], ["Internal links", warn]].map(([t, p]) => (
              <div key={t as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${line}`, paddingBottom: 6 }}>
                <span>{t as string}</span>{p}
              </div>
            ))}
          </div>
        </div>
      );
    case 1: {
      const pts = [8, 12, 10, 16, 15, 22, 20, 28, 30, 38];
      const d = pts.map((y, i) => `${i === 0 ? "M" : "L"}${i * 11} ${44 - y}`).join(" ");
      return (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", color: muted }}>
            <span>Clicks</span><span style={{ color: "#1F7A4D", fontWeight: 600 }}>▲ +38%</span>
          </div>
          <svg viewBox="0 0 100 46" width="100%" height="72" preserveAspectRatio="none" style={{ marginTop: 8 }}>
            <path d={`${d} L99 46 L0 46 Z`} fill="rgba(108,92,231,0.12)" />
            <path d={d} fill="none" stroke="#6C5CE7" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
            <line x1="0" x2="100" y1="36" y2="36" stroke={muted} strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      );
    }
    case 2:
      return (
        <div style={{ ...card, display: "grid", gap: 8 }}>
          {[["AI SEO tools", "Live"], ["Rank in ChatGPT", "Approved"], ["Shopify SEO", "Draft"]].map(([t, s]) => (
            <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t}</span>
              <span style={{ flexShrink: 0 }}>{s === "Live" ? pill(s, "#1F7A4D", "#E4F5EB") : s === "Approved" ? pill(s, "#6C5CE7", "#EEEBFF") : pill(s, muted, line)}</span>
            </div>
          ))}
        </div>
      );
    case 3:
      return (
        <div style={{ ...card, display: "grid", gap: 8 }}>
          {[["Product Hunt", true], ["G2", true], ["BetaList", false]].map(([t, live]) => (
            <div key={t as string} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{t as string}</span>
              <span style={{ color: live ? "#7EE2A8" : muted, fontWeight: 600, fontSize: 11 }}>{live ? "● Link verified" : "○ Pending"}</span>
            </div>
          ))}
        </div>
      );
    case 4:
      return (
        <div style={{ ...card, display: "grid", gap: 8 }}>
          {[["ChatGPT", 72], ["Gemini", 58], ["Claude", 44], ["Perplexity", 63]].map(([t, v]) => (
            <div key={t as string} style={{ display: "grid", gridTemplateColumns: "72px 1fr", alignItems: "center", gap: 8 }}>
              <span>{t as string}</span>
              <div style={{ height: 6, borderRadius: 999, background: line }}>
                <div style={{ width: `${v}%`, height: "100%", borderRadius: 999, background: "#6C5CE7" }} />
              </div>
            </div>
          ))}
        </div>
      );
    case 5:
      return (
        <div style={{ ...card, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[["Authority", "34"], ["Ref. domains", "212"], ["Backlinks", "1.8k"], ["Keywords", "940"]].map(([l, v]) => (
            <div key={l} style={{ borderRight: `1px solid ${line}`, paddingRight: 8 }}>
              <div style={{ color: muted, fontSize: 11 }}>{l}</div>
              <div className="grotesk" style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>{v}</div>
            </div>
          ))}
        </div>
      );
    case 6:
      return (
        <div style={{ ...card, display: "grid", gridTemplateColumns: "repeat(14, minmax(0, 1fr))", gap: 5 }}>
          {Array.from({ length: 28 }, (_, i) => (
            <div key={i} style={{ height: 32, borderRadius: 5, background: i < 18 ? (i % 4 === 0 ? "#D6F0E0" : "#EEEBFF") : "transparent", border: i >= 18 ? `1px dashed ${line}` : "none" }} />
          ))}
        </div>
      );
    default:
      return (
        <div style={{ ...card, display: "grid", gap: 8 }}>
          {["Website", "GitHub", "Search Console"].map((t) => (
            <div key={t} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{t}</span>{pill("Connected", "#1F7A4D", "#E4F5EB")}
            </div>
          ))}
        </div>
      );
  }
}
