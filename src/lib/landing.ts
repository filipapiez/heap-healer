// Auto-generated landing page assets. Do not edit by hand.
export const LANDING_CSS = `:root{
  --ink:#0B1020; --ink-800:#1A2242; --ink-600:#3A4470;
  --signal:#5B5BD6; --signal-deep:#4747C2; --signal-soft:#EDEDFB;
  --mist:#F7F8FC; --line:#E4E7F2;
  --ok:#12B981; --warn:#F59E0B; --bad:#EF4444;
  --r:16px;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Inter',system-ui,sans-serif;color:var(--ink);background:var(--mist);line-height:1.6;font-size:16px}
h1,h2,h3,.display{font-family:'Sora',sans-serif;letter-spacing:-.02em}
a{color:inherit;text-decoration:none}
img,svg{display:block}
.wrap{max-width:1120px;margin:0 auto;padding:0 24px}
.eyebrow{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--signal)}
.btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;padding:13px 24px;border-radius:12px;transition:transform .15s ease, box-shadow .15s ease;cursor:pointer;border:0}
.btn:hover{transform:translateY(-1px)}
.btn-primary{background:var(--signal);color:#fff;box-shadow:0 8px 24px rgba(91,91,214,.35)}
.btn-primary:hover{background:var(--signal-deep)}
.btn-ghost{background:#fff;border:1px solid var(--line);color:var(--ink)}
:focus-visible{outline:3px solid var(--signal);outline-offset:2px;border-radius:8px}

/* ---------- nav ---------- */
nav{position:sticky;top:0;z-index:50;background:rgba(247,248,252,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;height:68px}
.logo{font-family:'Sora';font-weight:800;font-size:19px}
.logo em{font-style:normal;color:var(--signal)}
.nav-links{display:flex;gap:28px;font-size:14px;font-weight:500;color:var(--ink-600)}
.nav-links a:hover{color:var(--ink)}
.nav-cta{display:flex;gap:10px}
.nav-cta .btn{padding:9px 18px;font-size:14px}
@media(max-width:820px){.nav-links{display:none}}

/* ---------- hero ---------- */
.hero{padding:76px 0 40px;overflow:hidden}
.hero-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:48px;align-items:center}
@media(max-width:960px){.hero-grid{grid-template-columns:1fr}}
.hero h1{font-size:clamp(38px,5vw,58px);line-height:1.06;font-weight:800}
.hero h1 .accent{color:var(--signal)}
.hero p.sub{margin:22px 0 18px;font-size:18px;color:var(--ink-600);max-width:34em}
.hero-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px}
.hero-chips span{font-size:13px;font-weight:600;color:var(--signal-deep);background:var(--signal-soft);border:1px solid #DCDCF8;padding:6px 12px;border-radius:99px}
.hero .cta-row{display:flex;gap:14px;flex-wrap:wrap}
.trust{margin-top:10px;font-size:13px;color:var(--ink-600);display:flex;align-items:center;gap:8px}
.trust b{color:var(--ok)}
.rise{opacity:0;transform:translateY(14px);animation:rise .7s ease forwards}
.rise.d1{animation-delay:.08s}.rise.d2{animation-delay:.16s}.rise.d3{animation-delay:.24s}
@keyframes rise{to{opacity:1;transform:none}}

/* ---------- fan-out stage (signature) ---------- */
.stage{position:relative;aspect-ratio:1/1;max-width:540px;margin:0 auto 64px;width:100%}
.stage svg.beams{position:absolute;inset:0;width:100%;height:100%}
.beams line{stroke:var(--line);stroke-width:1.5}
.beams .pulse{fill:var(--signal)}
.core{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:172px;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 20px 50px rgba(11,16,32,.12);padding:14px;z-index:3}
.core .bar{height:7px;border-radius:4px;background:var(--mist)}
.core .vid{aspect-ratio:16/9;border-radius:8px;background:linear-gradient(135deg,var(--ink) 0%,var(--ink-800) 100%);position:relative;margin-bottom:10px}
.core .vid::after{content:"";position:absolute;right:7px;bottom:7px;width:26%;height:22%;border-radius:3px;background:rgba(124,124,240,.9)}
.core .bar+.bar{margin-top:6px}
.core .bar.w60{width:60%}
.core .send{margin-top:10px;height:26px;border-radius:7px;background:var(--signal);color:#fff;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;font-family:'Sora'}
.node{position:absolute;top:50%;left:50%;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:16px;background:#fff;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 22px rgba(11,16,32,.08);z-index:2;transition:transform .25s ease, border-color .25s ease}
.node svg{width:24px;height:24px;fill:var(--ink)}
.node .tick{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:var(--ok);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;opacity:0;transform:scale(.4);transition:all .3s cubic-bezier(.34,1.56,.64,1)}
.node.live{transform:scale(1.12) translateZ(0);border-color:var(--ok)}
.node.done .tick{opacity:1;transform:scale(1)}
.ticker{position:absolute;left:50%;bottom:-58px;transform:translateX(-50%);background:var(--ink);color:#fff;font-size:13px;font-weight:500;padding:9px 18px;border-radius:99px;white-space:nowrap;z-index:4;box-shadow:0 10px 26px rgba(11,16,32,.25)}
.ticker b{color:#7CF0BE;font-weight:700}

/* ---------- section scaffolding ---------- */
section{padding:88px 0}
.sec-head{max-width:620px;margin-bottom:48px}
.sec-head h2{font-size:clamp(28px,3.4vw,38px);font-weight:800;margin:10px 0 14px;line-height:1.15}
.sec-head p{color:var(--ink-600);font-size:17px}

/* ---------- how it works ---------- */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:860px){.steps{grid-template-columns:1fr}}
.step{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:26px}
.step .num{font-family:'Sora';font-weight:800;font-size:13px;color:var(--signal);letter-spacing:.1em}
.step h3{font-size:19px;margin:10px 0 8px}
.step p{font-size:14.5px;color:var(--ink-600)}
.step .art{margin-top:18px;border-radius:10px;background:var(--mist);border:1px solid var(--line);height:120px;display:flex;align-items:center;justify-content:center;overflow:hidden}

/* ---------- engagement ---------- */
.engage{background:var(--ink);color:#fff;border-radius:28px;margin:0 16px}
.engage .wrap{padding-top:88px;padding-bottom:88px}
.engage .eyebrow{color:#9D9DF5}
.engage .sec-head p{color:#A9B0CC}
.engage-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:36px;align-items:stretch}
@media(max-width:900px){.engage-grid{grid-template-columns:1fr}}
.panel{background:var(--ink-800);border:1px solid #2A3462;border-radius:var(--r);padding:22px}
.panel .panel-title{font-size:13px;font-weight:600;color:#A9B0CC;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}
.kpi{background:rgba(255,255,255,.04);border:1px solid #2A3462;border-radius:10px;padding:10px 12px}
.kpi .v{font-family:'Sora';font-weight:700;font-size:20px}
.kpi .l{font-size:11px;color:#8A93B8;margin-top:2px}
.kpi .v .up{color:#7CF0BE;font-size:12px;margin-left:4px}
.legend{display:flex;gap:14px;font-size:12px;color:#A9B0CC;margin-top:12px}
.legend span::before{content:"";display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:6px;vertical-align:-1px}
.legend .lg1::before{background:#7C7CF0}.legend .lg2::before{background:#7CF0BE}
.inbox-item{display:flex;gap:12px;padding:12px 4px;border-bottom:1px solid #2A3462;font-size:13.5px}
.inbox-item:last-child{border-bottom:0}
.avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7C7CF0,#5B5BD6);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px}
.inbox-item .who{font-weight:600}
.inbox-item .what{color:#A9B0CC}
.inbox-item .chip{margin-left:auto;flex-shrink:0;align-self:center;font-size:10.5px;font-weight:600;background:rgba(124,124,240,.18);color:#B9B9F8;padding:3px 8px;border-radius:99px}
.reply{margin-top:12px;display:flex;gap:8px}
.reply input{flex:1;background:rgba(255,255,255,.06);border:1px solid #2A3462;border-radius:9px;padding:9px 12px;color:#fff;font-size:13px;font-family:inherit}
.reply button{background:var(--signal);border:0;color:#fff;font-weight:600;font-size:13px;border-radius:9px;padding:0 16px;cursor:pointer}

/* ---------- SEO ---------- */
.seo-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:36px;align-items:center}
@media(max-width:900px){.seo-grid{grid-template-columns:1fr}}
.score-card{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:34px;text-align:center}
.dial{position:relative;width:190px;height:190px;margin:0 auto 14px}
.dial svg{width:100%;height:100%;transform:rotate(-90deg)}
.dial .track{stroke:var(--mist);stroke-width:14;fill:none}
.dial .fill{stroke:var(--ok);stroke-width:14;fill:none;stroke-linecap:round;stroke-dasharray:503;stroke-dashoffset:503;animation:dial 1.4s .3s ease forwards}
@keyframes dial{to{stroke-dashoffset:91}}
.dial .val{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.dial .val b{font-family:'Sora';font-size:44px;font-weight:800}
.dial .val span{font-size:12px;color:var(--ink-600)}
.finding{display:flex;gap:12px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin-bottom:10px;font-size:14.5px}
.finding .dot{width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;margin-top:1px}
.finding.pass .dot{background:var(--ok)}
.finding.warn .dot{background:var(--warn)}
.finding.fail .dot{background:var(--bad)}
.finding b{font-weight:600}
.finding .fix{color:var(--ink-600)}
.finding .code{font-family:ui-monospace,monospace;font-size:12.5px;background:var(--signal-soft);color:var(--signal-deep);padding:1px 6px;border-radius:5px}

/* ---------- google growth chart ---------- */
.gsc-grid{display:grid;grid-template-columns:1.5fr .6fr;gap:20px;margin-bottom:56px}
@media(max-width:900px){.gsc-grid{grid-template-columns:1fr}}
.gsc{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:22px 22px 14px;box-shadow:0 14px 40px rgba(11,16,32,.06)}
.gsc-top{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--ink-600);margin-bottom:16px}
.gsc-top .gdot{width:18px;height:18px;border-radius:50%;background:conic-gradient(#4285F4 0 25%, #EA4335 25% 50%, #FBBC05 50% 75%, #34A853 75% 100%)}
.gsc-top b{color:var(--ink);font-weight:600}
.gsc-chips{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.gchip{flex:1;min-width:130px;border-radius:10px;padding:10px 14px;color:#fff}
.gchip .cl{font-size:11.5px;opacity:.85}
.gchip .cv{font-family:'Sora';font-weight:700;font-size:22px}
.gchip.blue{background:#4285F4}.gchip.purple{background:#5E35B1}
.gsc-axis{display:flex;justify-content:space-between;font-size:11px;color:var(--ink-600);padding:6px 2px 0}
.gsc-note{font-size:12px;color:var(--ink-600);margin-top:10px}
.stat-stack{display:flex;flex-direction:column;gap:20px}
.stat-card{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:20px;flex:1}
.stat-card .sl{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-600)}
.stat-card .sv{font-family:'Sora';font-weight:800;font-size:38px;line-height:1.1;margin-top:6px}
.stat-card .sd{font-size:13px;margin-top:4px;color:var(--ok);font-weight:600}
.stat-card .bars{display:flex;align-items:flex-end;gap:5px;height:44px;margin-top:14px}
.stat-card .bars i{flex:1;border-radius:3px 3px 0 0;background:var(--signal-soft)}
.stat-card .bars i.hi{background:var(--signal)}

/* ---------- brands ---------- */
.brands{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:860px){.brands{grid-template-columns:1fr}}
.brand-card{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:22px}
.brand-card .swatch{width:38px;height:38px;border-radius:11px;margin-bottom:14px}
.brand-card h3{font-size:17px;margin-bottom:4px}
.brand-card p{font-size:13.5px;color:var(--ink-600)}
.brand-card .row{display:flex;gap:6px;margin-top:14px}
.brand-card .mini{width:26px;height:26px;border-radius:8px;background:var(--mist);border:1px solid var(--line);display:flex;align-items:center;justify-content:center}
.brand-card .mini svg{width:13px;height:13px;fill:var(--ink)}

/* ---------- guarantee ---------- */
.guarantee{margin:0 16px}
.g-card{background:linear-gradient(135deg,#0E7A55 0%,#12B981 100%);border-radius:28px;color:#fff;padding:56px 48px;display:grid;grid-template-columns:auto 1fr;gap:36px;align-items:center}
@media(max-width:820px){.g-card{grid-template-columns:1fr;padding:40px 28px}}
.g-badge{width:112px;height:112px;border-radius:50%;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Sora';font-weight:800;text-align:center;line-height:1.1}
.g-badge b{font-size:30px}
.g-badge span{font-size:11px;letter-spacing:.1em;font-weight:700}
.g-card h2{font-size:clamp(24px,3vw,34px);font-weight:800;margin-bottom:12px;line-height:1.15}
.g-card p{font-size:16.5px;color:rgba(255,255,255,.92);max-width:44em}
.g-card p b{color:#fff}
.g-fine{margin-top:14px;font-size:12.5px;color:rgba(255,255,255,.65)}

/* ---------- final CTA + footer ---------- */
.final{text-align:center;padding:96px 0 110px}
.final h2{font-size:clamp(30px,4vw,46px);font-weight:800;max-width:16em;margin:0 auto 18px;line-height:1.12}
.final p{color:var(--ink-600);margin-bottom:30px}
footer{border-top:1px solid var(--line);padding:28px 0;font-size:13px;color:var(--ink-600)}
.foot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap}

@media(prefers-reduced-motion:reduce){
  .rise{animation:none;opacity:1;transform:none}
  .dial .fill{animation:none;stroke-dashoffset:91}
  *{transition:none!important}
}`;

export const LANDING_HTML = `
<nav>
  <div class="wrap nav-inner">
    <a class="logo" href="#">Mention<em>My</em>App</a>
    <div class="nav-links">
      <a href="#how">How it works</a>
      <a href="#engagement">Engagement</a>
      <a href="#seo">SEO audit</a>
      <a href="#brands">For agencies</a>
    </div>
    <div class="nav-cta">
      <a class="btn btn-ghost" href="/auth">Sign in</a>
      <a class="btn btn-primary" href="/auth">Start free</a>
    </div>
  </div>
</nav>

<!-- ============================== HERO ============================== -->
<header class="hero">
  <div class="wrap hero-grid">
    <div>
      <h1 class="rise">Post once.<br>Show up everywhere —<br><span class="accent">including Google.</span></h1>
      <p class="sub rise d1">MentionMyApp publishes your video to 11 platforms with your logo stamped on, answers every comment from one inbox — and turns each post into backlinks and indexable pages that push your site up the rankings.</p>
      <div class="hero-chips rise d1">
        <span>✓ 11 platforms, one click</span>
        <span>✓ One inbox for stats &amp; replies</span>
        <span>✓ Backlinks + pages Google can index</span>
      </div>
      <div class="cta-row rise d2">
        <a class="btn btn-primary" href="/auth">Start posting free</a>
        <a class="btn btn-ghost" href="#how">See how it works</a>
      </div>
      <div class="trust rise d3" style="margin-top:24px;font-size:14px"><b style="font-size:15px">🛡</b>&nbsp;<a href="#guarantee" style="color:var(--ink);font-weight:600;text-decoration:underline;text-decoration-color:#12B981;text-underline-offset:3px">90-day guarantee</a>&nbsp;— rank better on Google or get every dollar back, and keep all the work we did.</div>
      <div class="trust rise d3"><b>●</b> No passwords collected — accounts connect through each platform's official sign-in.</div>
    </div>

    <!-- signature: fan-out stage -->
    <div class="stage rise d2" id="stage" aria-label="Animation: one post publishing to eleven social platforms">
      <svg class="beams" viewBox="0 0 540 540" id="beams" aria-hidden="true"></svg>
      <div class="core" aria-hidden="true">
        <div class="vid"></div>
        <div class="bar"></div>
        <div class="bar w60"></div>
        <div class="send">Publish everywhere</div>
      </div>
      <div class="ticker" id="ticker">Publishing<b> …</b></div>
    </div>
  </div>
</header>

<!-- ============================== HOW ============================== -->
<section id="how">
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">How it works</div>
      <h2>From one upload to everywhere, in three steps</h2>
      <p>The whole flow takes about ninety seconds. Everything after "Publish" is automatic — rendering, uploading, per-platform formatting, retries.</p>
    </div>
    <div class="steps">
      <div class="step">
        <div class="num">STEP 1</div>
        <h3>Upload &amp; watermark</h3>
        <p>Drop in your video and logo. Set the position, size and opacity — we burn the watermark in at full quality, on every copy.</p>
        <div class="art">
          <svg width="150" height="86" viewBox="0 0 150 86" aria-hidden="true">
            <rect x="8" y="8" width="134" height="70" rx="8" fill="#0B1020"/>
            <polygon points="66,30 66,56 88,43" fill="#7C7CF0"/>
            <rect x="106" y="56" width="28" height="14" rx="3" fill="#5B5BD6" opacity=".9"/>
          </svg>
        </div>
      </div>
      <div class="step">
        <div class="num">STEP 2</div>
        <h3>Compose once</h3>
        <p>One title, caption, hashtags and link — with per-platform overrides when X needs it shorter or YouTube needs a different title.</p>
        <div class="art">
          <svg width="150" height="86" viewBox="0 0 150 86" aria-hidden="true">
            <rect x="10" y="12" width="130" height="10" rx="5" fill="#DDE1F0"/>
            <rect x="10" y="30" width="104" height="10" rx="5" fill="#DDE1F0"/>
            <rect x="10" y="48" width="118" height="10" rx="5" fill="#DDE1F0"/>
            <rect x="10" y="66" width="64" height="10" rx="5" fill="#5B5BD6"/>
          </svg>
        </div>
      </div>
      <div class="step">
        <div class="num">STEP 3</div>
        <h3>Publish or schedule</h3>
        <p>Pick your accounts, hit publish — or set a date. Watch each platform go green in real time, with links to every live post.</p>
        <div class="art">
          <svg width="170" height="86" viewBox="0 0 170 86" aria-hidden="true">
            <g font-family="Inter,sans-serif" font-size="9" fill="#3A4470">
              <rect x="8" y="10" width="154" height="18" rx="6" fill="#fff" stroke="#E4E7F2"/>
              <circle cx="20" cy="19" r="5" fill="#12B981"/><text x="32" y="22">YouTube — published</text>
              <rect x="8" y="34" width="154" height="18" rx="6" fill="#fff" stroke="#E4E7F2"/>
              <circle cx="20" cy="43" r="5" fill="#12B981"/><text x="32" y="46">TikTok — published</text>
              <rect x="8" y="58" width="154" height="18" rx="6" fill="#fff" stroke="#E4E7F2"/>
              <circle cx="20" cy="67" r="5" fill="#F59E0B"/><text x="32" y="70">Instagram — processing…</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============================== ENGAGEMENT ============================== -->
<section id="engagement" style="padding-top:0">
  <div class="engage">
    <div class="wrap">
      <div class="sec-head">
        <div class="eyebrow">Engagement</div>
        <h2>Every like, comment and DM — one screen</h2>
        <p>Stop tab-hopping between eleven apps. MentionMyApp totals your metrics across every account and streams comments into a single feed you can reply from.</p>
      </div>
      <div class="engage-grid">
        <div class="panel">
          <div class="panel-title"><span>Across all connected accounts</span><span>Last 30 days</span></div>
          <div class="kpis">
            <div class="kpi"><div class="v">48.2k<span class="up">▲</span></div><div class="l">Views</div></div>
            <div class="kpi"><div class="v">6,914<span class="up">▲</span></div><div class="l">Likes</div></div>
            <div class="kpi"><div class="v">1,286</div><div class="l">Comments</div></div>
            <div class="kpi"><div class="v">947</div><div class="l">Shares</div></div>
          </div>
          <svg viewBox="0 0 520 190" width="100%" role="img" aria-label="Engagement trend chart, rising over 30 days">
            <defs>
              <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#7C7CF0" stop-opacity=".45"/>
                <stop offset="1" stop-color="#7C7CF0" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <g stroke="#2A3462" stroke-width="1">
              <line x1="0" y1="45" x2="520" y2="45"/><line x1="0" y1="90" x2="520" y2="90"/><line x1="0" y1="135" x2="520" y2="135"/>
            </g>
            <path d="M0,150 C40,142 70,150 105,132 C140,114 170,122 210,104 C250,86 285,96 320,74 C355,52 395,60 435,42 C470,28 495,30 520,20 L520,190 L0,190 Z" fill="url(#area)"/>
            <path d="M0,150 C40,142 70,150 105,132 C140,114 170,122 210,104 C250,86 285,96 320,74 C355,52 395,60 435,42 C470,28 495,30 520,20" fill="none" stroke="#7C7CF0" stroke-width="3" stroke-linecap="round"/>
            <path d="M0,168 C60,164 110,168 160,158 C220,146 270,152 330,138 C390,124 450,126 520,108" fill="none" stroke="#7CF0BE" stroke-width="2.5" stroke-dasharray="1 7" stroke-linecap="round"/>
            <circle cx="435" cy="42" r="5" fill="#7C7CF0" stroke="#0B1020" stroke-width="2"/>
          </svg>
          <div class="legend"><span class="lg1">Views</span><span class="lg2">New followers</span></div>
        </div>
        <div class="panel">
          <div class="panel-title"><span>Latest comments</span><span>All platforms</span></div>
          <div class="inbox-item"><div class="avatar">J</div><div><span class="who">creator.jane</span> <span class="what">— This is awesome, how did you do the intro?</span></div><span class="chip">YouTube</span></div>
          <div class="inbox-item"><div class="avatar" style="background:linear-gradient(135deg,#F59E0B,#EF4444)">M</div><div><span class="who">mike_edits</span> <span class="what">— 🔥🔥🔥</span></div><span class="chip">TikTok</span></div>
          <div class="inbox-item"><div class="avatar" style="background:linear-gradient(135deg,#12B981,#0B8F66)">S</div><div><span class="who">sofia.marketing</span> <span class="what">— Following for more of these</span></div><span class="chip">Instagram</span></div>
          <div class="inbox-item"><div class="avatar" style="background:linear-gradient(135deg,#3A4470,#0B1020)">A</div><div><span class="who">alex.customer</span> <span class="what">— Do you take commissions?</span></div><span class="chip">Bluesky</span></div>
          <div class="reply"><input placeholder="Reply from here — it posts on the platform" aria-label="Reply"><button>Send</button></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============================== SEO ============================== -->
<section id="seo">
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">Free SEO audit</div>
      <h2>Your posts drive traffic. Your site should catch it.</h2>
      <p>Paste your URL and get a scored audit — titles, meta tags, schema, speed, image alts — with the corrected code written for you, ready to paste in.</p>
    </div>

    <!-- Google Search Console-style proof chart -->
    <div class="gsc-grid">
      <div class="gsc">
        <div class="gsc-top"><span class="gdot"></span><b>Google Search performance</b><span>· Apr 9 – Jul 8 · Daily</span></div>
        <div class="gsc-chips">
          <div class="gchip blue"><div class="cl">Total clicks</div><div class="cv">1.8K</div></div>
          <div class="gchip purple"><div class="cl">Total impressions</div><div class="cv">47.6K</div></div>
          <div class="gchip" style="background:#fff;border:1px solid var(--line);color:var(--ink)"><div class="cl" style="color:var(--ink-600)">Average CTR</div><div class="cv">3.8%</div></div>
          <div class="gchip" style="background:#fff;border:1px solid var(--line);color:var(--ink)"><div class="cl" style="color:var(--ink-600)">Average position</div><div class="cv">9.0</div></div>
        </div>
        <svg viewBox="0 0 640 220" width="100%" role="img" aria-label="Daily search clicks and impressions, flat through April and May, rising sharply from early June onward">
          <g stroke="#EEF0F8" stroke-width="1">
            <line x1="0" y1="55" x2="640" y2="55"/><line x1="0" y1="110" x2="640" y2="110"/><line x1="0" y1="165" x2="640" y2="165"/>
          </g>
          <!-- impressions (purple, right scale) -->
          <polyline fill="none" stroke="#5E35B1" stroke-width="2.5" stroke-linejoin="round" points="0,203 40,203 90,204 150,204 210,203 260,203 300,202 330,201 350,198 365,194 375,186 385,168 395,152 405,148 418,145 430,142 442,139 452,96 462,48 468,38 478,64 488,122 498,164 508,158 518,150 528,146 538,154 548,148 558,150 568,146 578,148 588,143 598,136 608,126 618,140 628,132 640,137"/>
          <!-- clicks (blue, left scale) -->
          <polyline fill="none" stroke="#4285F4" stroke-width="2.5" stroke-linejoin="round" points="0,195 12,194 21,167 32,188 45,186 60,194 75,203 90,191 105,197 120,202 135,192 150,197 165,202 180,191 195,198 210,195 225,202 240,192 255,199 270,203 285,191 300,197 315,202 330,195 345,198 358,194 368,190 378,152 388,172 398,186 408,178 420,120 432,93 444,98 452,88 464,138 474,146 484,118 494,132 504,126 514,122 524,70 534,104 544,94 554,110 564,88 574,96 584,78 594,58 606,44 618,40 630,52 640,64"/>
          <!-- annotation: launch line at start of June -->
          <line x1="368" y1="18" x2="368" y2="205" stroke="#12B981" stroke-width="2" stroke-dasharray="5 5"/>
          <circle cx="368" cy="190" r="5" fill="#12B981" stroke="#fff" stroke-width="2"/>
          <g transform="translate(128,20)">
            <rect width="228" height="30" rx="15" fill="#0B1020"/>
            <text x="14" y="20" font-family="Inter,sans-serif" font-size="13" font-weight="600" fill="#fff">MentionMyApp started here ▶</text>
          </g>
        </svg>
        <div class="gsc-axis"><span>4/9</span><span>4/29</span><span>5/19</span><span>6/8</span><span>6/28</span><span>7/8</span></div>
        <div class="gsc-note">Real Search Console data from our own site. Consistent posting on 11 platforms + a fixed-up site: more links in, more crawls, more pages ranking.</div>
      </div>
      <div class="stat-stack">
        <div class="stat-card">
          <div class="sl">Pages indexed by Google</div>
          <div class="sv">214</div>
          <div class="sd">▲ up 181 since launch</div>
          <div class="bars" aria-hidden="true">
            <i style="height:16%"></i><i style="height:18%"></i><i style="height:17%"></i><i style="height:30%"></i><i style="height:46%"></i><i style="height:62%"></i><i style="height:80%"></i><i class="hi" style="height:100%"></i>
          </div>
        </div>
        <div class="stat-card">
          <div class="sl">Average position</div>
          <div class="sv">9</div>
          <div class="sd">▲ climbed from average position 48 to 9 — page one</div>
        </div>
      </div>
    </div>
    <div class="seo-grid">
      <div class="score-card">
        <div class="dial">
          <svg viewBox="0 0 190 190"><circle class="track" cx="95" cy="95" r="80"/><circle class="fill" cx="95" cy="95" r="80"/></svg>
          <div class="val"><b>82</b><span>SEO score · mentionmyapp.com</span></div>
        </div>
        <a class="btn btn-primary" href="/auth" style="width:100%;justify-content:center">Audit my site free</a>
      </div>
      <div>
        <div class="finding pass"><div class="dot">✓</div><div><b>Title tag</b> — 54 characters, primary keyword up front. Good.</div></div>
        <div class="finding warn"><div class="dot">!</div><div><b>Meta description missing on 3 pages</b> — <span class="fix">generated for you:</span> <span class="code">&lt;meta name="description" content="…"&gt;</span></div></div>
        <div class="finding fail"><div class="dot">✕</div><div><b>No Organization schema</b> — <span class="fix">copy-paste JSON-LD written and ready in your report.</span></div></div>
        <div class="finding warn"><div class="dot">!</div><div><b>7 images missing alt text</b> — <span class="fix">suggested alts drafted from the surrounding content.</span></div></div>
        <div class="finding pass"><div class="dot">✓</div><div><b>Sitemap &amp; robots.txt</b> — found and valid.</div></div>
      </div>
    </div>
  </div>
</section>

<!-- ============================== BRANDS ============================== -->
<section id="brands" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <div class="eyebrow">For agencies &amp; multi-brand founders</div>
      <h2>Every brand gets its own workspace</h2>
      <p>Switch brands from the sidebar. Accounts, media, scheduled posts and engagement stay completely separate — one login, clean walls between clients.</p>
    </div>
    <div class="brands">
      <div class="brand-card">
        <div class="swatch" style="background:linear-gradient(135deg,#5B5BD6,#7C7CF0)"></div>
        <h3>Your main brand</h3>
        <p>6 accounts connected · 14 posts scheduled</p>
        <div class="row"><span class="mini" data-icon="yt"></span><span class="mini" data-icon="tt"></span><span class="mini" data-icon="ig"></span><span class="mini" data-icon="x"></span></div>
      </div>
      <div class="brand-card">
        <div class="swatch" style="background:linear-gradient(135deg,#12B981,#0B8F66)"></div>
        <h3>Client A</h3>
        <p>4 accounts connected · 9 posts scheduled</p>
        <div class="row"><span class="mini" data-icon="fb"></span><span class="mini" data-icon="li"></span><span class="mini" data-icon="gb"></span></div>
      </div>
      <div class="brand-card">
        <div class="swatch" style="background:linear-gradient(135deg,#F59E0B,#EF4444)"></div>
        <h3>Client B</h3>
        <p>5 accounts connected · 11 posts scheduled</p>
        <div class="row"><span class="mini" data-icon="ig"></span><span class="mini" data-icon="pin"></span><span class="mini" data-icon="th"></span><span class="mini" data-icon="rd"></span></div>
      </div>
    </div>
  </div>
</section>

<!-- ============================== GUARANTEE ============================== -->
<section class="guarantee" id="guarantee" style="padding-top:0">
  <div class="g-card">
    <div class="g-badge"><b>90</b><span>DAY<br>GUARANTEE</span></div>
    <div>
      <h2>Don't rank better in 90 days? Full refund — and you keep all the work.</h2>
      <p>Use MentionMyApp for three months. If your Google position hasn't improved, we give <b>every dollar back</b> — and you walk away with everything already built: <b>every post published, every backlink earned, every page indexed.</b> The work stays yours, free. The risk stays ours.</p>
      <div class="g-fine">Measured by average position in your Google Search Console, day 1 vs. day 90, with at least 8 posts published per month during the period.</div>
    </div>
  </div>
</section>

<!-- ============================== FINAL ============================== -->
<section class="final">
  <div class="wrap">
    <h2>The next thing you make deserves to be everywhere.</h2>
    <p>Free while in early access. Connect your first account in under a minute.</p>
    <a class="btn btn-primary" href="/auth">Start posting free</a>
  </div>
</section>

<footer>
  <div class="wrap foot">
    <span>© 2026 MentionMyApp · Compose once. Publish everywhere.</span>
    <span>We never ask for your social media passwords — connections use each platform's official sign-in.</span>
  </div>
</footer>
`;

const LANDING_JS = `/* ---------- platform icon paths (simplified monochrome glyphs) ---------- */
const ICONS = {
  yt:'M23 12s0-3.6-.46-5.2a2.9 2.9 0 0 0-2-2C18.9 4.3 12 4.3 12 4.3s-6.9 0-8.5.5a2.9 2.9 0 0 0-2 2C1 8.4 1 12 1 12s0 3.6.5 5.2a2.9 2.9 0 0 0 2 2c1.6.5 8.5.5 8.5.5s6.9 0 8.5-.5a2.9 2.9 0 0 0 2-2C23 15.6 23 12 23 12ZM9.8 15.5v-7l6 3.5Z',
  tt:'M16.7 2h-3.1v13.6a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.6a6.1 6.1 0 1 0 5.1 6V8.7a7.8 7.8 0 0 0 4.5 1.4V7a4.8 4.8 0 0 1-4.5-5Z',
  ig:'M12 2c2.7 0 3 0 4.1.06a5.5 5.5 0 0 1 5.8 5.84C22 9 22 9.3 22 12s0 3-.06 4.1a5.5 5.5 0 0 1-5.84 5.84C15 22 14.7 22 12 22s-3 0-4.1-.06a5.5 5.5 0 0 1-5.84-5.84C2 15 2 14.7 2 12s0-3 .06-4.1A5.5 5.5 0 0 1 7.9 2.06C9 2 9.3 2 12 2Zm0 3.7A6.3 6.3 0 1 0 18.3 12 6.3 6.3 0 0 0 12 5.7Zm0 2.2A4.1 4.1 0 1 1 7.9 12 4.1 4.1 0 0 1 12 7.9Zm6.5-2.9a1.5 1.5 0 1 0 1.5 1.5 1.5 1.5 0 0 0-1.5-1.5Z',
  x:'M17.7 3H21l-7.1 8.1L22.3 21h-6.6l-5.1-6.2L4.7 21H1.4l7.6-8.7L1.7 3h6.7l4.6 5.7Zm-1.2 16h1.8L7.4 4.9H5.5Z',
  fb:'M14 8.5V6.8c0-.9.6-1.1 1-1.1h2.6V2H14c-3 0-4.4 2.2-4.4 4.5v2H7v4h2.7V22h4.2v-9.5h3.1l.4-4Z',
  li:'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3Zm7 0h3.8v1.7h.1a4.2 4.2 0 0 1 3.8-2.1c4 0 4.8 2.7 4.8 6.1V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21h-4Z',
  th:'M17.3 11.2a6.1 6.1 0 0 0-.3-.1c-.2-2.9-1.8-4.6-4.5-4.6a4.4 4.4 0 0 0-3.9 2l1.6 1.1a2.7 2.7 0 0 1 2.3-1.2c1.5 0 2.3.8 2.6 2.2a10 10 0 0 0-2.3-.2c-2.6.1-4.3 1.6-4.2 3.7.1 1.8 1.6 3 3.7 3a4 4 0 0 0 3.3-1.7 5.5 5.5 0 0 0 .7 1.5l1.7-1.1a5.6 5.6 0 0 1-.9-3.2v-.3c1 .5 1.5 1.3 1.5 2.6 0 2.4-2.1 4.9-5.9 4.9-4.3 0-6.9-2.8-6.9-7.8S8.4 4.2 12.7 4.2c3.2 0 5.5 1.5 6.5 4.3l1.9-.6C19.8 4.4 16.9 2.3 12.7 2.3 7.2 2.3 4 5.8 4 12s3.2 9.7 8.7 9.7c5 0 7.9-3.3 7.9-6.8 0-1.8-1.1-3.1-3.3-3.7Zm-4.9 3.9c-1 0-1.7-.4-1.7-1.2s.9-1.6 2.4-1.7a8 8 0 0 1 2 .2c-.2 1.7-1.3 2.7-2.7 2.7Z',
  bs:'M12 10.8c-.9-1.8-3.4-5.1-5.7-6.8C4.1 2.4 3.2 2.7 2.6 3s-.8 1.3-.8 2 .4 5.7.7 6.5c.9 2.7 4 3.6 6.9 3.3-4.2.6-8 2.1-3 7.4 5.4 5.6 7.4-1.2 5.6-4.6-.2-.4 0-.4.2 0-1.8 3.4.2 10.2 5.6 4.6 5-5.3 1.2-6.8-3-7.4 2.9.3 6-.6 6.9-3.3.3-.8.7-5.8.7-6.5s-.2-1.7-.8-2-1.5-.6-3.7 1c-2.3 1.7-4.8 5-5.7 6.8Z',
  pin:'M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.3-5.5s-.3-.7-.3-1.6c0-1.5.9-2.7 2-2.7a1.4 1.4 0 0 1 1.4 1.5c0 1-.6 2.4-.9 3.7a1.6 1.6 0 0 0 1.6 2c2 0 3.4-2.5 3.4-5.5a4.7 4.7 0 0 0-5-4.8 5.2 5.2 0 0 0-5.4 5.2 4.7 4.7 0 0 0 .9 2.7.4.4 0 0 1 .1.4l-.3 1.3c-.1.2-.2.3-.4.2-1.5-.7-2.4-2.8-2.4-4.6 0-3.7 2.7-7.1 7.8-7.1a6.9 6.9 0 0 1 7.3 6.8c0 4.1-2.6 7.4-6.1 7.4a3.2 3.2 0 0 1-2.7-1.4l-.8 2.9a13 13 0 0 1-1.5 3A10 10 0 1 0 12 2Z',
  rd:'M22 12.1a2.2 2.2 0 0 0-3.7-1.6 10.8 10.8 0 0 0-5.6-1.7l1-4.5 3.2.7a1.6 1.6 0 1 0 .2-1l-3.7-.8a.5.5 0 0 0-.6.4l-1.1 5.2a10.9 10.9 0 0 0-5.7 1.7A2.2 2.2 0 1 0 3.5 14a4 4 0 0 0 0 .6c0 3.2 3.8 5.9 8.5 5.9s8.5-2.6 8.5-5.9a4 4 0 0 0 0-.6 2.2 2.2 0 0 0 1.5-1.9ZM7.5 13.7a1.5 1.5 0 1 1 1.5 1.5 1.5 1.5 0 0 1-1.5-1.5Zm8.4 4.2a5.5 5.5 0 0 1-3.9 1.2 5.5 5.5 0 0 1-3.9-1.2.4.4 0 0 1 .6-.6 4.7 4.7 0 0 0 3.3 1 4.7 4.7 0 0 0 3.3-1 .4.4 0 1 1 .6.6ZM15 15.2a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5Z',
  gb:'M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.2a9.8 9.8 0 0 0 3-7.5ZM12 22a9.6 9.6 0 0 0 6.6-2.4l-3.2-2.5a6 6 0 0 1-9-3.2H3.1v2.6A10 10 0 0 0 12 22ZM6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9Zm5.6-8a5.4 5.4 0 0 1 3.8 1.5L18.7 4.6A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.5l3.3 2.6A6 6 0 0 1 12 5.9Z'
};
const PLATFORMS = [
  ['YouTube','yt'],['TikTok','tt'],['Instagram','ig'],['X','x'],['Facebook','fb'],
  ['LinkedIn','li'],['Threads','th'],['Bluesky','bs'],['Pinterest','pin'],['Reddit','rd'],['Google Business','gb']
];
const svgIcon = k => \`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="\${ICONS[k]}"/></svg>\`;

/* ---------- build the fan-out stage ---------- */
const stage = document.getElementById('stage');
const beams = document.getElementById('beams');
const ticker = document.getElementById('ticker');
const C = 270, R = 218;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nodes = [];

PLATFORMS.forEach(([name, key], i) => {
  const a = -Math.PI / 2 + i * (2 * Math.PI / PLATFORMS.length);
  const x = C + R * Math.cos(a), y = C + R * Math.sin(a);

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', C); line.setAttribute('y1', C);
  line.setAttribute('x2', x); line.setAttribute('y2', y);
  beams.appendChild(line);

  if (!reduced) {
    const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulse.setAttribute('r', 3.5); pulse.setAttribute('class', 'pulse');
    const motion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
    motion.setAttribute('dur', '2.6s');
    motion.setAttribute('repeatCount', 'indefinite');
    motion.setAttribute('begin', \`\${(i * 0.24).toFixed(2)}s\`);
    motion.setAttribute('path', \`M \${C} \${C} L \${x} \${y}\`);
    pulse.appendChild(motion); beams.appendChild(pulse);
  }

  const node = document.createElement('div');
  node.className = 'node';
  node.style.left = \`\${(x / 540) * 100}%\`;
  node.style.top = \`\${(y / 540) * 100}%\`;
  node.setAttribute('title', name);
  node.innerHTML = svgIcon(key) + '<span class="tick">✓</span>';
  stage.appendChild(node);
  nodes.push({ node, name });
});

/* published ticker loop */
let idx = 0;
function tick() {
  nodes.forEach(n => n.node.classList.remove('live'));
  const { node, name } = nodes[idx % nodes.length];
  node.classList.add('live', 'done');
  ticker.innerHTML = \`Published to \${name} <b>✓</b>\`;
  idx++;
  if (idx % nodes.length === 0) setTimeout(() => nodes.forEach(n => n.node.classList.remove('done')), 1400);
}
if (reduced) { nodes.forEach(n => n.node.classList.add('done')); ticker.innerHTML = 'Published to 11 platforms <b>✓</b>'; }
else { tick(); setInterval(tick, 1500); }

/* mini icons in brand cards */
document.querySelectorAll('.mini[data-icon]').forEach(el => { el.innerHTML = svgIcon(el.dataset.icon); });`;

let landingRan = false;
export function runLandingScript(): () => void {
  if (landingRan) return () => {};
  landingRan = true;
  try {
    // eslint-disable-next-line no-new-func
    new Function(LANDING_JS)();
  } catch (e) {
    console.error('[landing] script failed', e);
  }
  return () => {};
}
