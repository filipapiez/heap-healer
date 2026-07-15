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
        .landing-page{font-family:Inter,system-ui,sans-serif;color:${INK};background:#fff}.lp-wrap{max-width:1120px;margin:auto;padding-left:22px;padding-right:22px}.lp-nav{height:72px;border-bottom:1px solid ${LINE};display:flex;align-items:center}.lp-nav .lp-wrap{width:100%;display:flex;align-items:center;gap:28px}.lp-logo{font-size:21px;font-weight:900;letter-spacing:-.045em;color:${INK};text-decoration:none}.lp-logo em{font-style:normal;color:${ACCENT}}.lp-links{display:flex;gap:22px}.lp-links a,.lp-signin{color:${MUTED};text-decoration:none;font-size:14px}.lp-actions{margin-left:auto;display:flex;align-items:center;gap:10px}.lp-cta{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:15px 26px;background:linear-gradient(135deg,${ACCENT},#4848c4);color:#fff;text-decoration:none;font-weight:750;box-shadow:0 12px 28px #5b5bd638;transition:.2s}.lp-cta:hover{transform:translateY(-2px);box-shadow:0 16px 34px #5b5bd648}.lp-ghost{display:inline-flex;border:1px solid ${LINE};border-radius:999px;padding:14px 22px;color:${INK};text-decoration:none;font-weight:700}.lp-hero{text-align:center;padding-top:72px}.lp-kicker{display:inline-flex;border:1px solid #d7d7fa;background:#f4f3ff;color:${ACCENT};border-radius:99px;padding:8px 16px;font-size:13px;font-weight:750}.lp-hero h1{font-size:clamp(40px,6vw,68px);line-height:1.04;letter-spacing:-.055em;max-width:900px;margin:22px auto 18px}.lp-hero p{font-size:18px;line-height:1.65;color:${MUTED};max-width:720px;margin:0 auto 28px}.lp-hero-actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}.lp-proof{display:grid;grid-template-columns:repeat(3,1fr);max-width:760px;margin:48px auto 8px;border:1px solid ${LINE};border-radius:22px;background:#fff;box-shadow:0 18px 50px #242a5110}.lp-proof div{padding:22px 14px;text-align:center}.lp-proof div+div{border-left:1px solid ${LINE}}.lp-proof strong{display:block;font-size:28px;letter-spacing:-.04em}.lp-proof span{color:${MUTED};font-size:12px}.lp-map{max-width:1000px;margin:10px auto 0}.lp-guarantee{background:${NAVY};color:#fff;text-align:center;padding:38px 20px}.lp-eyebrow{font-size:11px;font-weight:850;letter-spacing:.15em;text-transform:uppercase;color:#aaaaf2}.lp-guarantee h2{font-size:clamp(23px,3vw,31px);margin:10px 0}.lp-guarantee p{color:#bdc2d3;margin:0}.lp-section{padding-top:76px;padding-bottom:76px}.lp-title{text-align:center;font-size:clamp(30px,4vw,44px);letter-spacing:-.045em;margin:0 0 12px}.lp-sub{text-align:center;color:${MUTED};font-size:16px;margin:0 auto 42px;max-width:680px;line-height:1.6}.lp-phases{display:grid;gap:14px}.lp-phase{display:grid;grid-template-columns:1fr 1.8fr;gap:28px;align-items:center;border:1px solid ${LINE};background:${PANEL};border-radius:22px;padding:28px 32px}.lp-phase:nth-child(even){background:#fff}.lp-phase-number{color:${ACCENT};font-weight:850;font-size:13px}.lp-phase h3{font-size:24px;margin:8px 0 4px;letter-spacing:-.03em}.lp-phase-tag{font-size:12px;color:${MUTED}}.lp-phase p{color:${MUTED};line-height:1.65;margin:0}.lp-dashboard{background:${NAVY};color:#fff}.lp-dashboard-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:48px;align-items:center}.lp-dashboard h2{text-align:left}.lp-dashboard p{color:#bdc2d3;line-height:1.7}.lp-report{background:#fff;color:${INK};border-radius:24px;padding:22px;box-shadow:0 28px 70px #0005}.lp-report-row{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.lp-report-card{background:${PANEL};border-radius:15px;padding:16px}.lp-report-card span{display:block;color:${MUTED};font-size:11px;text-transform:uppercase;letter-spacing:.08em}.lp-report-card strong{font-size:24px;display:block;margin-top:5px}.lp-report-list{margin-top:12px;border:1px solid ${LINE};border-radius:15px;overflow:hidden}.lp-report-list div{display:flex;justify-content:space-between;padding:11px 14px;font-size:13px}.lp-report-list div+div{border-top:1px solid ${LINE}}.lp-stories{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.lp-story{border:1px solid ${LINE};border-radius:20px;padding:24px;background:#fff}.lp-story-icon{width:38px;height:38px;border-radius:12px;background:#efefff;color:${ACCENT};display:grid;place-items:center;font-weight:900}.lp-story h3{font-size:18px;margin:15px 0 8px}.lp-story p{color:${MUTED};line-height:1.6;font-size:14px;margin:0}.lp-review-score{text-align:center;margin-top:28px;color:${MUTED};font-size:14px}.lp-review-score strong{color:${INK}}.lp-stars{color:#ffb400;letter-spacing:2px}.lp-pricing{background:${PANEL};padding:76px 20px}.lp-price-card{max-width:570px;margin:auto;background:${NAVY};color:#fff;border-radius:28px;padding:36px;box-shadow:0 30px 70px #11162b40}.lp-price{display:flex;align-items:baseline;gap:10px;margin:12px 0 4px}.lp-price strong{font-size:56px;letter-spacing:-.05em}.lp-price span,.lp-price-copy{color:#bdc2d3}.lp-features{list-style:none;padding:0;margin:24px 0;display:grid;gap:11px}.lp-features li:before{content:'✓';color:#54d59e;font-weight:900;margin-right:10px}.lp-price-card .lp-cta{width:100%;box-sizing:border-box}.lp-faq{max-width:780px}.lp-faq details{border-bottom:1px solid ${LINE};padding:19px 4px}.lp-faq summary{font-weight:750;cursor:pointer}.lp-faq p{color:${MUTED};line-height:1.65}.lp-final{text-align:center;padding:40px 20px 90px}.lp-final h2{font-size:clamp(30px,4vw,44px);margin-bottom:12px}.lp-final p{color:${MUTED};margin-bottom:26px}.lp-footer{border-top:1px solid ${LINE};padding:26px 0;color:${MUTED};font-size:13px}.lp-footer .lp-wrap{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}.lp-footer a{color:inherit;margin-left:16px}@media(max-width:800px){.lp-links{display:none}.lp-phase,.lp-dashboard-grid{grid-template-columns:1fr}.lp-map{margin-top:10px}.lp-nav .lp-cta{padding:11px 15px}.lp-signin{display:none}.lp-section{padding-top:56px;padding-bottom:56px}.lp-stories{grid-template-columns:1fr}.lp-proof strong{font-size:22px}.lp-proof span{font-size:10px}}
      `}</style>
      <style>{`
        .lp-hero{padding-top:64px;padding-bottom:48px;text-align:left}.lp-hero-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(390px,.92fr);gap:64px;align-items:center}.lp-kicker{border:0;border-left:3px solid ${ACCENT};border-radius:0;background:transparent;padding:2px 0 2px 12px;font-size:12px;letter-spacing:.08em;text-transform:uppercase}.lp-hero h1{font-size:clamp(44px,5.4vw,68px);line-height:1.02;max-width:680px;margin:22px 0 20px}.lp-hero p{font-size:17px;max-width:610px;margin:0 0 28px}.lp-hero-actions{justify-content:flex-start}.lp-project{background:${NAVY};color:#fff;border-radius:8px;padding:28px;box-shadow:18px 22px 0 #efefff}.lp-project-top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #2b3045;padding-bottom:20px;margin-bottom:6px}.lp-project-label{font-size:11px;color:#aeb4ca;text-transform:uppercase;letter-spacing:.12em}.lp-project h2{font-size:25px;letter-spacing:-.035em;margin:7px 0 0}.lp-project-price{text-align:right}.lp-project-price strong{display:block;font-size:28px}.lp-project-price span{font-size:11px;color:#aeb4ca}.lp-project-row{display:grid;grid-template-columns:72px 1fr 22px;gap:13px;align-items:center;padding:14px 0;border-bottom:1px solid #292e42}.lp-project-row:last-child{border-bottom:0}.lp-project-week{font-size:11px;color:#aeb4ca}.lp-project-row strong{font-size:14px}.lp-project-check{width:21px;height:21px;border-radius:50%;background:#263e3a;color:#67dda9;display:grid;place-items:center;font-size:11px}.lp-project-foot{margin-top:12px;background:#1b2037;border-radius:7px;padding:13px 14px;font-size:12px;color:#c8cce0;line-height:1.5}.lp-proof{max-width:none;margin:46px 0 0;border:0;border-top:1px solid ${LINE};border-bottom:1px solid ${LINE};border-radius:0;box-shadow:none}.lp-proof div{padding:20px 24px 20px 0;text-align:left}.lp-proof div+div{padding-left:24px}.lp-proof strong{font-size:25px}.lp-proof span{font-size:11px}.lp-map{display:none}@media(max-width:900px){.lp-hero-grid{grid-template-columns:1fr;gap:44px}.lp-project{box-shadow:10px 12px 0 #efefff}}@media(max-width:540px){.lp-proof{grid-template-columns:1fr}.lp-proof div,.lp-proof div+div{padding:14px 0;border-left:0;border-bottom:1px solid ${LINE}}.lp-proof div:last-child{border-bottom:0}.lp-project{padding:22px}.lp-project-row{grid-template-columns:62px 1fr 22px}}
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
        <div className="lp-hero-grid">
          <div>
            <span className="lp-kicker">SEO growth service · Chicago</span>
            <h1>More pages indexed. More customers finding you.</h1>
            <p>
              We repair technical SEO, find the searches your competitors are winning, and build the
              pages and links your website is missing. You see every result in your own growth
              report.
            </p>
            <div className="lp-hero-actions">
              <a className="lp-cta" href="/grow">
                Get a free website audit →
              </a>
              <a className="lp-ghost" href="#service">
                See exactly what we do
              </a>
            </div>
          </div>
          <aside className="lp-project" aria-label="Your first 90 days with MentionMyApp">
            <div className="lp-project-top">
              <div>
                <div className="lp-project-label">Your first 90 days</div>
                <h2>A clear SEO work plan</h2>
              </div>
              <div className="lp-project-price">
                <strong>$49</strong>
                <span>per month</span>
              </div>
            </div>
            <div className="lp-project-row">
              <span className="lp-project-week">Week 1</span>
              <strong>Audit and baseline</strong>
              <span className="lp-project-check">✓</span>
            </div>
            <div className="lp-project-row">
              <span className="lp-project-week">Week 2</span>
              <strong>Technical and indexing fixes</strong>
              <span className="lp-project-check">✓</span>
            </div>
            <div className="lp-project-row">
              <span className="lp-project-week">Month 1</span>
              <strong>Search pages and internal links</strong>
              <span className="lp-project-check">✓</span>
            </div>
            <div className="lp-project-row">
              <span className="lp-project-week">Ongoing</span>
              <strong>Backlinks, reporting, and growth</strong>
              <span className="lp-project-check">✓</span>
            </div>
            <div className="lp-project-foot">
              No measurable organic growth after 90 days? Eligible payments are refunded under the
              guarantee.
            </div>
          </aside>
        </div>
        <div className="lp-proof" aria-label="MentionMyApp customer results">
          <div>
            <strong>35,000</strong>
            <span>companies served</span>
          </div>
          <div>
            <strong>12K+</strong>
            <span>customer reviews</span>
          </div>
          <div>
            <strong>72%</strong>
            <span>average organic growth</span>
          </div>
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
      <section className="lp-section lp-dashboard">
        <div className="lp-wrap lp-dashboard-grid">
          <div>
            <div className="lp-eyebrow">Nothing hidden</div>
            <h2 className="lp-title">See exactly what changed—and what we built</h2>
            <p>
              Your private growth report compares every result with the baseline we agree on before
              work starts. You can see organic clicks, impressions, indexed pages, backlinks, new
              content, and AI-search mentions in one place.
            </p>
            <p>
              We do not ask you to trust a slide deck. The Search Console data belongs to you, and
              the backlink and publishing records stay visible throughout the campaign.
            </p>
          </div>
          <div className="lp-report" aria-label="Example customer growth report">
            <div className="lp-eyebrow" style={{ color: ACCENT }}>
              Your live growth report
            </div>
            <div className="lp-report-row" style={{ marginTop: 14 }}>
              <div className="lp-report-card">
                <span>Organic clicks</span>
                <strong>+38%</strong>
              </div>
              <div className="lp-report-card">
                <span>Indexed pages</span>
                <strong>+24</strong>
              </div>
              <div className="lp-report-card">
                <span>Backlinks live</span>
                <strong>18</strong>
              </div>
              <div className="lp-report-card">
                <span>Guarantee</span>
                <strong>Day 47/90</strong>
              </div>
            </div>
            <div className="lp-report-list">
              <div>
                <span>New pages published</span>
                <strong>12</strong>
              </div>
              <div>
                <span>AI-search mentions tracked</span>
                <strong>7</strong>
              </div>
              <div>
                <span>Last Search Console sync</span>
                <strong>Today</strong>
              </div>
            </div>
            <div className="lp-sub" style={{ fontSize: 11, margin: "12px 0 0", textAlign: "left" }}>
              Example layout. Your report displays your actual campaign data.
            </div>
          </div>
        </div>
      </section>
      <section className="lp-section lp-wrap">
        <h2 className="lp-title">What customers hire us to solve</h2>
        <p className="lp-sub">
          The work is practical: fix what is blocking Google, create pages customers are searching
          for, and show the results clearly.
        </p>
        <div className="lp-stories">
          <article className="lp-story">
            <div className="lp-story-icon">01</div>
            <h3>“Google barely indexes our site.”</h3>
            <p>
              We inspect crawlability, sitemaps, internal links, page quality, and technical errors
              before submitting the right pages again.
            </p>
          </article>
          <article className="lp-story">
            <div className="lp-story-icon">02</div>
            <h3>“Competitors own every useful search.”</h3>
            <p>
              We map competitor gaps and build focused pages for the searches most closely tied to
              your products, services, and locations.
            </p>
          </article>
          <article className="lp-story">
            <div className="lp-story-icon">03</div>
            <h3>“Our SEO agency sends vague reports.”</h3>
            <p>
              You receive a live record of pages, links, indexing, clicks, impressions, and the
              90-day baseline—without vanity metrics.
            </p>
          </article>
        </div>
        <div className="lp-review-score">
          <span className="lp-stars">★★★★★</span> <strong>4.9/5</strong> from 12K+ customer reviews
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
