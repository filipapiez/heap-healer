const A = "#5a58dd";

const FAQ = [
  [
    "What do you actually do?",
    "We audit technical SEO, repair indexing problems, plan and create search-focused pages, build relevant authority links, and track the results in your report.",
  ],
  [
    "How is growth measured?",
    "Against the day-one baseline in your own Google Search Console: organic clicks, impressions, indexed pages, and the agreed supporting metrics.",
  ],
  [
    "What does the 90-day guarantee cover?",
    "If there is no measurable organic growth after 90 days against the agreed baseline, eligible payments are refunded under the guarantee.",
  ],
  [
    "Can I see the work?",
    "Yes. Your report shows completed fixes, new pages, indexing status, backlinks, Search Console performance, and AI-search mentions.",
  ],
];

export default function LandingPage() {
  return (
    <main className="site">
      <style>{CSS}</style>
      <nav className="nav shell">
        <a className="brand" href="/">
          MentionMy<span>App</span>
        </a>
        <div className="navlinks">
          <a href="#features">Features</a>
          <a href="#results">Results</a>
          <a href="#pricing">Pricing</a>
        </div>
        <a className="navcta" href="/grow">
          Start free audit
        </a>
      </nav>

      <header className="hero">
        <div className="heroPattern" />
        <div className="shell heroInner">
          <p className="label">SEO GROWTH ON AUTOPILOT</p>
          <h1>
            Grow organic traffic
            <br />
            <em>without the guesswork.</em>
          </h1>
          <p className="lead">
            We fix the technical problems holding your site back, create pages customers are
            searching for, build authority, and measure every result.
          </p>
          <a className="primary" href="/grow">
            Start with a free website audit <b>→</b>
          </a>
          <p className="guarantee">
            No measurable organic growth in 90 days? <strong>You get your money back.</strong>
          </p>
          <div className="logoStrip">
            <span>35,000 companies served</span>
            <i />
            <span>12K+ customer reviews</span>
            <i />
            <span>72% average organic growth</span>
          </div>
        </div>
      </header>

      <section className="section shell intro" id="features">
        <p className="label">PLATFORM FEATURES</p>
        <h2>
          A powerful SEO growth system <span>— all in one place.</span>
        </h2>
        <div className="featureGrid">
          <FeatureCard
            title="Technical SEO audit"
            copy="Find and fix indexing, metadata, schema, crawl, speed, and internal-link problems."
            visual="audit"
            wide
          />
          <FeatureCard
            title="30-day search plan"
            copy="A practical month of pages based on buyer intent, competitor gaps, and real demand."
            visual="calendar"
            wide
          />
          <FeatureCard
            title="New indexable pages"
            copy="Useful landing pages and articles, connected to your site and submitted for indexing."
            visual="page"
          />
          <FeatureCard
            title="Authority backlinks"
            copy="Relevant placements tracked by source, target page, anchor text, and live status."
            visual="links"
          />
          <FeatureCard
            title="AI visibility tracking"
            copy="See when ChatGPT, Perplexity, Gemini, and Google AI mention or cite your brand."
            visual="ai"
          />
        </div>
      </section>

      <section className="section pale">
        <div className="shell example">
          <p className="label">YOUR WORKSPACE</p>
          <h2>
            Not a monthly slide deck <span>— a live record of your growth.</span>
          </h2>
          <p className="sectionLead">
            Everything we fix, publish, and earn stays visible alongside the numbers from your
            Search Console.
          </p>
          <div className="dashboard">
            <div className="dashTop">
              <div>
                <small>MENTIONMYAPP GROWTH REPORT</small>
                <h3>Acme Studio</h3>
              </div>
              <div className="range">Last 90 days⌄</div>
            </div>
            <div className="metrics">
              <Metric n="+38%" t="Organic clicks" />
              <Metric n="+24" t="Indexed pages" />
              <Metric n="18" t="Backlinks live" />
              <Metric n="7" t="AI mentions" />
            </div>
            <div className="chart">
              <svg viewBox="0 0 900 230" preserveAspectRatio="none">
                <path
                  d="M0 205 C90 200 125 180 205 188 S330 150 400 160 S520 108 585 118 S720 50 900 35"
                  fill="none"
                  stroke={A}
                  strokeWidth="6"
                />
                <path
                  d="M0 205 C90 200 125 180 205 188 S330 150 400 160 S520 108 585 118 S720 50 900 35 L900 230 L0 230Z"
                  fill="#5a58dd12"
                />
              </svg>
            </div>
            <div className="workRows">
              <span>
                Technical fixes completed <b>14/14</b>
              </span>
              <span>
                Pages published <b>12</b>
              </span>
              <span>
                Search Console synced <b>Today</b>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell network">
        <div className="networkCopy">
          <p className="label">AUTHORITY BUILDING</p>
          <h2>
            A backlink plan <span>that gets stronger as your site grows.</span>
          </h2>
          <ul>
            <li>Opportunities matched to your topic and market</li>
            <li>Contextual links inside relevant pages</li>
            <li>Every live, pending, or lost link tracked</li>
            <li>Authority directed to the pages that matter</li>
          </ul>
          <a className="darkButton" href="/grow">
            Get my growth plan →
          </a>
        </div>
        <Network />
      </section>

      <section className="section results" id="results">
        <div className="shell">
          <p className="label">MEASURED RESULTS</p>
          <h2>
            The numbers change <span>— and you can verify every one.</span>
          </h2>
          <div className="resultCards">
            <Metric n="35,000" t="companies served" />
            <Metric n="12K+" t="customer reviews" />
            <Metric n="72%" t="average organic growth" />
          </div>
          <div className="quote">
            <p>
              “Finally, SEO work we can actually see. We know what changed, what was published, and
              whether it moved the numbers.”
            </p>
            <span>What customers want from an SEO partner</span>
          </div>
        </div>
      </section>

      <section className="section shell pricing" id="pricing">
        <div>
          <p className="label">SIMPLE PRICING</p>
          <h2>Everything you need to start growing.</h2>
          <p className="sectionLead left">
            Start with a free audit. Continue only when the baseline, priorities, and scope make
            sense.
          </p>
        </div>
        <div className="priceBox">
          <div>
            <small>MENTIONMYAPP SEO</small>
            <strong>$49</strong>
            <span>per month</span>
          </div>
          <ul>
            <li>Technical SEO and indexing fixes</li>
            <li>New pages based on search demand</li>
            <li>Backlink and AI visibility tracking</li>
            <li>Your live customer growth report</li>
            <li>90-day money-back growth guarantee</li>
          </ul>
          <a className="primary" href="/grow">
            Start free audit →
          </a>
        </div>
      </section>

      <section className="section shell faq">
        <p className="label">FAQ</p>
        <h2>Clear answers before you start.</h2>
        {FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <b>+</b>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <section className="final">
        <div className="heroPattern" />
        <div>
          <h2>
            Grow organic traffic
            <br />
            <em>with a plan you can see.</em>
          </h2>
          <a className="primary" href="/grow">
            Start with a free website audit →
          </a>
          <p>No card required for the audit.</p>
        </div>
      </section>
      <footer className="footer shell">
        <a className="brand" href="/">
          MentionMy<span>App</span>
        </a>
        <p>SEO growth, measured from day one.</p>
        <div>
          <a href="/grow">Free audit</a>
          <a href="/auth">Sign in</a>
          <a href="/terms">Terms</a>
        </div>
      </footer>
    </main>
  );
}

function Metric({ n, t }: { n: string; t: string }) {
  return (
    <div className="metric">
      <strong>{n}</strong>
      <span>{t}</span>
    </div>
  );
}

function FeatureCard({
  title,
  copy,
  visual,
  wide = false,
}: {
  title: string;
  copy: string;
  visual: string;
  wide?: boolean;
}) {
  return (
    <article className={`feature ${wide ? "wide" : ""}`}>
      <h3>{title}</h3>
      <p>{copy}</p>
      <Visual kind={visual} />
    </article>
  );
}

function Visual({ kind }: { kind: string }) {
  if (kind === "audit")
    return (
      <div className="browser">
        <div className="browserBar">
          <i />
          <i />
          <i />
        </div>
        <div className="audit">
          <div>
            <span>High</span>Missing page title<b>Fixed ✓</b>
          </div>
          <div>
            <span>Medium</span>Broken internal links<b>Fixed ✓</b>
          </div>
          <div>
            <span>Medium</span>Pages not indexed<b>Resolved</b>
          </div>
          <div>
            <span>Low</span>Missing schema<b>Ready</b>
          </div>
        </div>
      </div>
    );
  if (kind === "calendar")
    return (
      <div className="calendar">
        {["Research", "Service", "Comparison", "Location", "Guide", "FAQ"].map((x, i) => (
          <div key={x}>
            <b>{i + 4}</b>
            <span>{x}</span>
            <small>{i % 2 ? "Google" : "Buyer intent"}</small>
          </div>
        ))}
      </div>
    );
  if (kind === "page")
    return (
      <div className="pageMock">
        <div />
        <h4>Your new search page</h4>
        <i />
        <i />
        <i className="short" />
      </div>
    );
  if (kind === "links") return <Network mini />;
  return (
    <div className="aiMock">
      <p>
        <b>ChatGPT</b> best software for growing a local business <span>MentionMyApp cited ✓</span>
      </p>
      <p>
        <b>Perplexity</b> how to improve website visibility <span>Page mentioned ✓</span>
      </p>
    </div>
  );
}

function Network({ mini = false }: { mini?: boolean }) {
  return (
    <div className={`networkVisual ${mini ? "mini" : ""}`}>
      <svg viewBox="0 0 600 440">
        <g stroke="#b9b8ef" strokeWidth="1.5">
          {[
            [300, 220, 90, 90],
            [300, 220, 510, 80],
            [300, 220, 100, 350],
            [300, 220, 500, 350],
            [90, 90, 510, 80],
            [90, 90, 100, 350],
            [510, 80, 500, 350],
            [100, 350, 500, 350],
            [160, 210, 430, 210],
          ].map((l, i) => (
            <line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
          ))}
        </g>
        <g fill="#fff" stroke="#cac9ed" strokeWidth="2">
          <circle cx="90" cy="90" r="38" />
          <circle cx="510" cy="80" r="32" />
          <circle cx="100" cy="350" r="35" />
          <circle cx="500" cy="350" r="38" />
          <circle cx="160" cy="210" r="28" />
          <circle cx="430" cy="210" r="30" />
        </g>
        <circle cx="300" cy="220" r="55" fill={A} />
        <text x="300" y="226" textAnchor="middle" fill="#fff" fontWeight="800" fontSize="18">
          MMA
        </text>
        <g fill={A} fontWeight="800" fontSize="13" textAnchor="middle">
          <text x="90" y="95">
            DR 62
          </text>
          <text x="510" y="85">
            DR 54
          </text>
          <text x="100" y="355">
            DR 47
          </text>
          <text x="500" y="355">
            DR 71
          </text>
          <text x="160" y="215">
            DR 58
          </text>
          <text x="430" y="215">
            DR 66
          </text>
        </g>
      </svg>
    </div>
  );
}

const CSS = `
*{box-sizing:border-box}.site{font-family:Arial,Helvetica,sans-serif;color:#0b1020;background:#fff}.shell{width:min(1540px,calc(100% - 64px));margin:auto}.nav{height:86px;display:flex;align-items:center;border-bottom:1px solid #e7e8ed}.brand{font-size:26px;font-weight:900;letter-spacing:-1.5px;color:#0b1020;text-decoration:none}.brand span{color:${A}}.navlinks{display:flex;gap:40px;margin-left:72px}.nav a{color:#272b3b;text-decoration:none}.navcta{margin-left:auto!important;background:${A};color:#fff!important;padding:17px 28px;border-radius:7px;font-weight:700}.hero{min-height:820px;position:relative;overflow:hidden;border-bottom:1px solid #e8e9ef}.heroPattern,.final .heroPattern{position:absolute;inset:0;opacity:.7;background:linear-gradient(#fffffff0,#fffffff0),repeating-linear-gradient(90deg,#dde0fa 0,#dde0fa 1px,transparent 1px,transparent 54px),repeating-linear-gradient(0deg,#dde0fa 0,#dde0fa 1px,transparent 1px,transparent 54px)}.heroInner{position:relative;text-align:center;padding-top:120px}.label{font-size:13px;font-weight:800;letter-spacing:2px;color:${A};margin:0 0 30px}.hero h1,.final h2{font-size:clamp(64px,7.4vw,116px);line-height:.98;letter-spacing:-7px;margin:0 auto 35px;max-width:1350px}.hero h1 em,.final h2 em{font-style:normal;color:${A}}.lead{font-size:22px;line-height:1.55;color:#555d73;max-width:820px;margin:0 auto 34px}.primary,.darkButton{display:inline-flex;background:#0d0b0d;color:white;text-decoration:none;padding:21px 38px;border-radius:7px;font-size:18px;font-weight:750}.primary b{margin-left:15px}.guarantee{color:#727789;margin:22px 0 0}.logoStrip{height:94px;display:flex;align-items:center;justify-content:center;gap:42px;background:#fff;border:1px solid #e2e4eb;border-radius:12px;margin-top:78px;font-weight:700;color:#3d4355}.logoStrip i{height:34px;width:1px;background:#e1e2e8}.section{padding-top:120px;padding-bottom:120px}.intro h2,.example h2,.network h2,.results h2,.pricing h2,.faq h2{font-size:clamp(52px,5.6vw,88px);line-height:1.04;letter-spacing:-5px;margin:0 0 65px;max-width:1400px}.section h2 span{color:#b3b4b8}.featureGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:24px}.feature{grid-column:span 2;min-height:590px;border:1px solid #dfe1e7;border-radius:18px;padding:38px;display:flex;flex-direction:column;overflow:hidden}.feature.wide{grid-column:span 3;min-height:660px}.feature h3{font-size:28px;margin:0 0 15px;letter-spacing:-1px}.feature>p{color:#6c707a;font-size:17px;line-height:1.55;max-width:620px;margin:0}.browser,.calendar,.pageMock,.aiMock,.networkVisual{margin-top:auto}.browser{height:330px;border:1px solid #e0e1e6;border-radius:14px;overflow:hidden}.browserBar{height:38px;border-bottom:1px solid #e5e6ea;display:flex;gap:7px;align-items:center;padding:0 14px;background:#fafafa}.browserBar i{width:9px;height:9px;background:#d4d6dc;border-radius:50%}.audit{padding:24px}.audit div{display:grid;grid-template-columns:70px 1fr auto;gap:12px;padding:17px 10px;border-bottom:1px solid #eaebef;color:#666b78}.audit span{color:#eb654e}.audit b{color:${A}}.calendar{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.calendar div{min-height:118px;border:1px solid #e0e2e8;border-radius:12px;padding:16px;background:#fff}.calendar b{font-size:20px}.calendar span{display:block;color:${A};margin:14px 0 8px}.calendar small{color:#8a8e98}.pageMock{border:1px solid #e0e2e8;border-radius:14px;padding:24px;background:#fff}.pageMock>div{height:145px;background:linear-gradient(135deg,#e9e9fc,#f8f8fd);border-radius:8px}.pageMock h4{font-size:20px}.pageMock i{display:block;height:9px;background:#e4e5e9;margin:10px 0;border-radius:6px}.pageMock i.short{width:55%}.aiMock{display:grid;gap:12px}.aiMock p{border:1px solid #e0e2e8;border-radius:12px;padding:18px;margin:0;line-height:1.45}.aiMock b,.aiMock span{display:block}.aiMock span{color:#148d68;margin-top:10px}.pale,.results{background:#f7f7f8}.sectionLead{font-size:20px;color:#686e80;line-height:1.55;max-width:850px;text-align:center;margin:-40px auto 55px}.sectionLead.left{text-align:left;margin:-40px 0 0}.dashboard{background:white;border:1px solid #dfe1e7;border-radius:18px;padding:42px;box-shadow:0 30px 80px #14182d0d}.dashTop{display:flex;justify-content:space-between}.dashTop small{color:${A};font-weight:800;letter-spacing:1px}.dashTop h3{font-size:28px;margin:8px 0}.range{border:1px solid #e0e2e8;padding:13px 18px;border-radius:8px;height:max-content}.metrics,.resultCards{display:grid;grid-template-columns:repeat(4,1fr);margin:32px 0;border:1px solid #e0e2e8;border-radius:12px}.metric{padding:28px}.metric+.metric{border-left:1px solid #e0e2e8}.metric strong{display:block;font-size:44px;letter-spacing:-2px}.metric span{color:#737989;font-size:14px}.chart{height:250px;border-left:1px solid #e2e4e9;border-bottom:1px solid #e2e4e9;background:repeating-linear-gradient(0deg,transparent 0,transparent 61px,#edf0f4 62px);padding:10px}.chart svg{width:100%;height:100%}.workRows{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:25px}.workRows span{background:#f6f7f9;border-radius:8px;padding:17px;color:#626877}.workRows b{float:right;color:#171c2b}.network{display:grid;grid-template-columns:.9fr 1.1fr;gap:90px;align-items:center}.network h2{font-size:clamp(52px,5vw,80px)}.network ul{list-style:none;padding:0;display:grid;gap:17px;color:#686e80;font-size:18px;line-height:1.5}.network li:before{content:'✓';display:inline-grid;place-items:center;width:24px;height:24px;border:2px solid ${A};border-radius:50%;color:${A};font-size:12px;font-weight:bold;margin-right:12px}.networkVisual svg{width:100%;height:auto}.networkVisual.mini svg{max-height:330px}.darkButton{margin-top:25px}.results h2{margin-bottom:70px}.resultCards{grid-template-columns:repeat(3,1fr);background:#fff;margin:0}.resultCards .metric{padding:45px}.resultCards .metric strong{font-size:68px}.quote{margin-top:90px;max-width:1100px}.quote p{font-size:44px;line-height:1.2;letter-spacing:-2px;margin:0 0 24px}.quote span{color:#767b89}.pricing{display:grid;grid-template-columns:1fr 620px;gap:90px;align-items:center}.pricing h2{font-size:clamp(52px,5vw,80px);margin-bottom:65px}.priceBox{border:1px solid #dfe1e7;border-radius:18px;padding:42px}.priceBox>div{display:grid;grid-template-columns:1fr auto;align-items:end;border-bottom:1px solid #e2e4e9;padding-bottom:30px}.priceBox small{color:${A};font-weight:bold;letter-spacing:1px}.priceBox strong{font-size:72px;letter-spacing:-4px}.priceBox span{text-align:right;color:#777c89}.priceBox ul{list-style:none;padding:20px 0;display:grid;gap:18px}.priceBox li:before{content:'✓';color:${A};font-weight:bold;margin-right:12px}.priceBox .primary{width:100%;justify-content:center}.faq{max-width:1120px}.faq h2{font-size:70px}.faq details{border-top:1px solid #dedfe4;padding:27px 0}.faq summary{font-size:22px;font-weight:700;list-style:none;cursor:pointer}.faq summary b{float:right}.faq details p{color:#676d7d;font-size:17px;line-height:1.6;max-width:850px}.final{min-height:640px;position:relative;display:grid;place-items:center;text-align:center;overflow:hidden}.final>div:last-child{position:relative}.final h2{font-size:clamp(58px,6vw,96px);margin-bottom:40px}.final>div>p{color:#787d8b}.footer{min-height:140px;border-top:1px solid #e1e3e9;display:flex;align-items:center;gap:40px}.footer p{color:#747986}.footer div{margin-left:auto;display:flex;gap:30px}.footer a{color:#252a39;text-decoration:none}
@media(max-width:950px){.shell{width:min(100% - 32px,1540px)}.navlinks{display:none}.hero{min-height:720px}.hero h1,.final h2{letter-spacing:-4px}.logoStrip{gap:14px;font-size:12px}.featureGrid{grid-template-columns:1fr}.feature,.feature.wide{grid-column:1;min-height:560px}.network,.pricing{grid-template-columns:1fr}.metrics{grid-template-columns:repeat(2,1fr)}.metrics .metric:nth-child(3){border-left:0;border-top:1px solid #e0e2e8}.metrics .metric:nth-child(4){border-top:1px solid #e0e2e8}.workRows{grid-template-columns:1fr}.resultCards{grid-template-columns:1fr}.resultCards .metric+.metric{border-left:0;border-top:1px solid #e0e2e8}.section{padding:82px 0}.intro h2,.example h2,.network h2,.results h2,.pricing h2,.faq h2{letter-spacing:-3px}.pricing{gap:45px}}
@media(max-width:600px){.nav{height:72px}.brand{font-size:21px}.navcta{padding:12px 14px;font-size:13px}.heroInner{padding-top:85px}.hero h1{font-size:52px;letter-spacing:-3px}.lead{font-size:18px}.primary{padding:18px 22px;font-size:15px}.logoStrip{height:auto;display:grid;padding:22px;margin-top:55px}.logoStrip i{display:none}.intro h2,.example h2,.network h2,.results h2,.pricing h2,.faq h2{font-size:44px;letter-spacing:-2px}.feature{padding:24px}.dashboard{padding:20px}.metrics{grid-template-columns:1fr}.metrics .metric+.metric{border-left:0;border-top:1px solid #e0e2e8}.resultCards .metric strong{font-size:50px}.quote p{font-size:32px}.priceBox{padding:24px}.priceBox strong{font-size:58px}.footer{align-items:flex-start;flex-direction:column;padding:38px 0}.footer div{margin-left:0}}
`;
