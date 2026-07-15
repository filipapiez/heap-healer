import WorldMap from "@/components/WorldMap";

const ACCENT = "#5b5bd6";
const INK = "#0b1020";
const MUTED = "#68708c";
const LINE = "#e4e7f2";
const PANEL = "#f7f8fc";
const NAVY = "#11162b";

const PHASES = [
  [
    "01",
    "Fix your SEO",
    "Weeks 1–2",
    "Technical audit, speed and crawl fixes, schema, indexing, titles, headings, and internal links.",
  ],
  [
    "02",
    "Build pages that rank",
    "Every month",
    "Keyword and competitor research plus new indexable landing pages and articles built around real demand.",
  ],
  [
    "03",
    "Build authority",
    "Every month",
    "Relevant backlink opportunities and content structured for Google and AI-search visibility.",
  ],
  [
    "04",
    "Prove it grew",
    "Always on",
    "A live report showing clicks, impressions, indexed pages, backlinks, and progress against your baseline.",
  ],
];

const FAQ = [
  [
    "How is growth measured?",
    "Using indexed pages and organic clicks in your own Google Search Console compared with the agreed day-one baseline.",
  ],
  [
    "What if I do not have Search Console?",
    "We help you connect it during onboarding. You keep ownership of the account and its data.",
  ],
  [
    "When does the 90-day clock start?",
    "When the baseline is confirmed and we have the access needed to begin the agreed work.",
  ],
  [
    "What does the guarantee mean?",
    "If the day-90 review shows no measurable growth over the agreed baseline, you receive a refund of eligible payments.",
  ],
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <style>{`
        .landing-page{font-family:Inter,system-ui,sans-serif;color:${INK};background:#fff}.lp-wrap{max-width:1120px;margin:auto;padding-left:22px;padding-right:22px}.lp-nav{height:72px;border-bottom:1px solid ${LINE};display:flex;align-items:center}.lp-nav .lp-wrap{width:100%;display:flex;align-items:center;gap:28px}.lp-logo{font-size:21px;font-weight:900;letter-spacing:-.045em;color:${INK};text-decoration:none}.lp-logo em{font-style:normal;color:${ACCENT}}.lp-links{display:flex;gap:22px}.lp-links a,.lp-signin{color:${MUTED};text-decoration:none;font-size:14px}.lp-actions{margin-left:auto;display:flex;align-items:center;gap:10px}.lp-cta{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:15px 26px;background:linear-gradient(135deg,${ACCENT},#4848c4);color:#fff;text-decoration:none;font-weight:750;box-shadow:0 12px 28px #5b5bd638;transition:.2s}.lp-cta:hover{transform:translateY(-2px);box-shadow:0 16px 34px #5b5bd648}.lp-ghost{display:inline-flex;border:1px solid ${LINE};border-radius:999px;padding:14px 22px;color:${INK};text-decoration:none;font-weight:700}.lp-hero{text-align:center;padding-top:72px}.lp-kicker{display:inline-flex;border:1px solid #d7d7fa;background:#f4f3ff;color:${ACCENT};border-radius:99px;padding:8px 16px;font-size:13px;font-weight:750}.lp-hero h1{font-size:clamp(40px,6vw,68px);line-height:1.04;letter-spacing:-.055em;max-width:900px;margin:22px auto 18px}.lp-hero p{font-size:18px;line-height:1.65;color:${MUTED};max-width:690px;margin:0 auto 28px}.lp-hero-actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}.lp-map{max-width:1000px;margin:18px auto 0}.lp-guarantee{background:${NAVY};color:#fff;text-align:center;padding:38px 20px}.lp-eyebrow{font-size:11px;font-weight:850;letter-spacing:.15em;text-transform:uppercase;color:#aaaaf2}.lp-guarantee h2{font-size:clamp(23px,3vw,31px);margin:10px 0}.lp-guarantee p{color:#bdc2d3;margin:0}.lp-section{padding-top:76px;padding-bottom:76px}.lp-title{text-align:center;font-size:clamp(30px,4vw,44px);letter-spacing:-.045em;margin:0 0 12px}.lp-sub{text-align:center;color:${MUTED};font-size:16px;margin:0 auto 42px}.lp-phases{display:grid;gap:14px}.lp-phase{display:grid;grid-template-columns:1fr 1.8fr;gap:28px;align-items:center;border:1px solid ${LINE};background:${PANEL};border-radius:22px;padding:28px 32px}.lp-phase:nth-child(even){background:#fff}.lp-phase-number{color:${ACCENT};font-weight:850;font-size:13px}.lp-phase h3{font-size:24px;margin:8px 0 4px;letter-spacing:-.03em}.lp-phase-tag{font-size:12px;color:${MUTED}}.lp-phase p{color:${MUTED};line-height:1.65;margin:0}.lp-pricing{background:${PANEL};padding:76px 20px}.lp-price-card{max-width:570px;margin:auto;background:${NAVY};color:#fff;border-radius:28px;padding:36px;box-shadow:0 30px 70px #11162b40}.lp-price{display:flex;align-items:baseline;gap:10px;margin:12px 0 4px}.lp-price strong{font-size:56px;letter-spacing:-.05em}.lp-price span,.lp-price-copy{color:#bdc2d3}.lp-features{list-style:none;padding:0;margin:24px 0;display:grid;gap:11px}.lp-features li:before{content:'✓';color:#54d59e;font-weight:900;margin-right:10px}.lp-price-card .lp-cta{width:100%;box-sizing:border-box}.lp-faq{max-width:780px}.lp-faq details{border-bottom:1px solid ${LINE};padding:19px 4px}.lp-faq summary{font-weight:750;cursor:pointer}.lp-faq p{color:${MUTED};line-height:1.65}.lp-final{text-align:center;padding:40px 20px 90px}.lp-final h2{font-size:clamp(30px,4vw,44px);margin-bottom:12px}.lp-final p{color:${MUTED};margin-bottom:26px}.lp-footer{border-top:1px solid ${LINE};padding:26px 0;color:${MUTED};font-size:13px}.lp-footer .lp-wrap{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}.lp-footer a{color:inherit;margin-left:16px}@media(max-width:800px){.lp-links{display:none}.lp-phase{grid-template-columns:1fr}.lp-map{margin-top:10px}.lp-nav .lp-cta{padding:11px 15px}.lp-signin{display:none}.lp-section{padding-top:56px;padding-bottom:56px}}
      `}</style>
      <nav className="lp-nav">
        <div className="lp-wrap">
          <a className="lp-logo" href="/">
            MentionMy<em>App</em>
          </a>
          <div className="lp-links">
            <a href="#service">What we do</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="lp-actions">
            <a className="lp-signin" href="/auth">
              Sign in
            </a>
            <a className="lp-cta" href="/grow">
              Start free audit
            </a>
          </div>
        </div>
      </nav>
      <header className="lp-hero lp-wrap">
        <span className="lp-kicker">90-day money-back growth guarantee</span>
        <h1>We fix your SEO and build pages that make your website grow</h1>
        <p>
          Technical fixes, new indexed pages, backlinks, and AI-search visibility—measured
          transparently against your Google Search Console baseline.
        </p>
        <div className="lp-hero-actions">
          <a className="lp-cta" href="/grow">
            Start with a free growth audit →
          </a>
          <a className="lp-ghost" href="/auth">
            Sign in to your report
          </a>
        </div>
        <div className="lp-map">
          <WorldMap hqLabel="MentionMyApp" accent={ACCENT} dot="#c7caf0" height={390} />
        </div>
      </header>
      <section className="lp-guarantee">
        <div className="lp-eyebrow">The 90-day guarantee</div>
        <h2>No measurable organic growth in 90 days? Get every dollar back.</h2>
        <p>Measured in your Search Console against the agreed day-one baseline.</p>
      </section>
      <section id="service" className="lp-section lp-wrap">
        <h2 className="lp-title">Everything we do for your website</h2>
        <p className="lp-sub">
          One SEO growth system—from repairing the foundation to proving the result.
        </p>
        <div className="lp-phases">
          {PHASES.map(([n, name, tag, copy]) => (
            <article className="lp-phase" key={n}>
              <div>
                <span className="lp-phase-number">{n}</span>
                <h3>{name}</h3>
                <span className="lp-phase-tag">{tag}</span>
              </div>
              <p>✓ {copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="pricing" className="lp-pricing">
        <div className="lp-price-card">
          <div className="lp-eyebrow">One plan · everything included</div>
          <div className="lp-price">
            <strong>$49</strong>
            <span>/month · cancel anytime</span>
          </div>
          <div className="lp-price-copy">Backed by the 90-day money-back growth guarantee.</div>
          <ul className="lp-features">
            <li>Technical SEO fixes and indexing</li>
            <li>New SEO pages built around search demand</li>
            <li>Backlink progress and AI-search visibility</li>
            <li>Live customer growth report</li>
          </ul>
          <a className="lp-cta" href="/grow">
            Start with the free audit →
          </a>
        </div>
      </section>
      <section id="faq" className="lp-section lp-wrap lp-faq">
        <h2 className="lp-title">The guarantee, in plain English</h2>
        {FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <section className="lp-final">
        <h2>Your website grows, or you get your money back.</h2>
        <p>Start with the free growth audit. No card required.</p>
        <a className="lp-cta" href="/grow">
          Get my free growth audit →
        </a>
      </section>
      <footer className="lp-footer">
        <div className="lp-wrap">
          <span>© {new Date().getFullYear()} MentionMyApp · Chicago, IL</span>
          <span>
            <a href="/grow">Free audit</a>
            <a href="/auth">Sign in</a>
            <a href="/terms">Terms</a>
          </span>
        </div>
      </footer>
    </main>
  );
}
