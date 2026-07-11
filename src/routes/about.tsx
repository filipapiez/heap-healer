import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { getTrustPage, SITE_NAME, SITE_URL } from "@/legal/pages";

const page = getTrustPage("about")!;
const PAGE_TITLE = `About - ${SITE_NAME}`;
const PAGE_DESC =
  "MentionMyApp was built by a small web studio that got tired of posting the same video eleven times. We're our own first customer.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESC },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: PAGE_TITLE },
      { property: "og:description", content: PAGE_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}${page.path}` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}${page.path}` }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="about-page">
      <style>{ABOUT_CSS}</style>

      <nav className="about-nav">
        <div className="nav-inner">
          <Link to="/" className="logo">
            Mention<em>My</em>App
          </Link>
          <Link to="/auth" className="btn btn-sm">
            Start free
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap">
          <div className="eyebrow">About us</div>
          <h1>We got tired of posting the same video eleven times.</h1>
          <p className="lede">
            MentionMyApp wasn't dreamed up in a pitch deck. It was built out of frustration, inside
            a small web studio, for our own brands — and it's still how we run them today.
          </p>
        </div>
      </header>

      <section>
        <div className="wrap prose">
          <h2>The story</h2>
          <p>
            We're a small web design and product studio in the Chicago suburbs. Alongside client
            work — local business sites, landing pages, SEO — we build and run our own products:
            consumer hardware, analytics tools, niche software.
          </p>
          <p>
            Every one of those brands needed the same thing: <b>show up everywhere, consistently.</b>{" "}
            And every launch looked the same — export the video, open eleven tabs, upload eleven
            times, rewrite the caption for each platform's limits, then spend the week bouncing
            between eleven inboxes to answer comments. Meanwhile the thing that actually grows a
            business — <b>ranking on Google</b> — got treated as a separate job entirely, even
            though every post we made was quietly feeding it: links pointing home, pages getting
            crawled, names getting searched.
          </p>
          <p>
            So we built the tool we couldn't find: one upload, our logo stamped on automatically,
            one caption with per-platform tweaks, published to all eleven platforms at once — with
            every stat, like, comment and DM flowing back into a single inbox, and the SEO side
            treated as a first-class outcome instead of an afterthought.
          </p>
          <div className="pull">
            We used it on our own sites first. The graph on our homepage is our own Search Console —
            not a stock chart.
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="receipts">
            <h3>
              We're our own <span>first customer.</span>
              <br />
              These are our numbers.
            </h3>
            <div className="rstat">
              <b>
                214<em>▲</em>
              </b>
              <span>pages indexed by Google</span>
            </div>
            <div className="rstat">
              <b>48 → 9</b>
              <span>average position climb</span>
            </div>
            <div className="rstat">
              <b>1.8K</b>
              <span>clicks from search, 90 days</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <h2>What we believe</h2>
          <div className="beliefs">
            <div className="belief">
              <div className="n">01</div>
              <h3>Your passwords are none of our business</h3>
              <p>
                Accounts connect through each platform's official sign-in. We never ask for, see, or
                store a social media password — and we never will.
              </p>
            </div>
            <div className="belief">
              <div className="n">02</div>
              <h3>The work should outlive the subscription</h3>
              <p>
                Every post published, every backlink earned, every page indexed is yours forever.
                That's why our 90-day guarantee refunds your money <b>and</b> lets you keep all of
                it.
              </p>
            </div>
            <div className="belief">
              <div className="n">03</div>
              <h3>Distribution compounds</h3>
              <p>
                One post is noise. A hundred posts across eleven platforms is a web of links, pages,
                and mentions that search engines can't ignore. Consistency beats virality.
              </p>
            </div>
            <div className="belief">
              <div className="n">04</div>
              <h3>Numbers over vibes</h3>
              <p>
                We show real Search Console data — ours and yours. If a metric can't be verified in
                your own Google account, we don't build marketing on it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 8 }}>
        <div className="wrap">
          <div className="note">
            <div className="face">F</div>
            <div>
              <p>
                "I built MentionMyApp because I was my own worst bottleneck. Three brands, eleven
                platforms each, and me copy-pasting captions at midnight. The first month we ran
                everything through the tool, our own site's Google graph did the thing you see on
                our homepage — and I stopped dreading launch days. If it does that for you too,
                great. If it doesn't in 90 days, you get your money back and keep every post we
                published. Fair's fair."
              </p>
              <div className="sig">Filip</div>
              <div className="role">Founder, MentionMyApp</div>
            </div>
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap">
          <h2>The next thing you make deserves to be everywhere.</h2>
          <p>Free while in early access. Connect your first account in under a minute.</p>
          <Link to="/auth" className="btn">
            Start posting free
          </Link>
        </div>
      </section>

      <footer className="about-footer">
        © 2026 MentionMyApp · Compose once. Publish everywhere.
      </footer>
    </main>
  );
}

const ABOUT_CSS = `
.about-page{
  --ink:#0B1020; --ink-800:#1A2242; --ink-600:#3A4470;
  --signal:#5B5BD6; --signal-deep:#4747C2; --signal-soft:#EDEDFB;
  --mist:#F7F8FC; --line:#E4E7F2; --ok:#12B981;
  font-family:'Inter',system-ui,sans-serif;color:var(--ink);background:var(--mist);line-height:1.65;font-size:16.5px;
}
.about-page h1,.about-page h2,.about-page h3,.about-page .logo{font-family:'Sora',sans-serif;letter-spacing:-.02em}
.about-page a{color:inherit;text-decoration:none}
.about-page .wrap{max-width:880px;margin:0 auto;padding:0 24px}
.about-page .eyebrow{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--signal)}
.about-page .btn{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;padding:13px 24px;border-radius:12px;background:var(--signal);color:#fff;box-shadow:0 8px 24px rgba(91,91,214,.35);transition:background .15s}
.about-page .btn:hover{background:var(--signal-deep)}
.about-page .btn-sm{padding:9px 18px;font-size:14px}
.about-page :focus-visible{outline:3px solid var(--signal);outline-offset:2px;border-radius:8px}
.about-nav{position:sticky;top:0;z-index:50;background:rgba(247,248,252,.85);backdrop-filter:blur(12px);border-bottom:1px solid #E4E7F2}
.about-nav .nav-inner{max-width:1120px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:68px}
.about-page .logo{font-weight:800;font-size:19px}
.about-page .logo em{font-style:normal;color:#5B5BD6}
.about-page .hero{padding:80px 0 24px}
.about-page .hero h1{font-size:clamp(34px,5vw,52px);font-weight:800;line-height:1.08;margin:12px 0 20px;max-width:15em}
.about-page .lede{font-size:19px;color:var(--ink-600);max-width:36em}
.about-page section{padding:46px 0}
.about-page section h2{font-size:clamp(24px,3vw,32px);font-weight:800;margin-bottom:16px}
.about-page .prose p{margin-bottom:18px;color:#1F2745;max-width:42em}
.about-page .prose b{font-weight:600}
.about-page .pull{border-left:3px solid var(--signal);padding:6px 0 6px 22px;margin:28px 0;font-family:'Sora';font-weight:700;font-size:21px;line-height:1.4;max-width:26em}
.about-page .receipts{background:var(--ink);color:#fff;border-radius:24px;padding:44px;display:grid;grid-template-columns:1fr auto auto auto;gap:32px;align-items:center;margin:14px 0}
@media(max-width:860px){.about-page .receipts{grid-template-columns:1fr 1fr;gap:24px}}
.about-page .receipts h3{font-size:20px;font-weight:700;line-height:1.35}
.about-page .receipts h3 span{color:#7C7CF0}
.about-page .rstat b{display:block;font-family:'Sora';font-weight:800;font-size:34px}
.about-page .rstat span{font-size:13px;color:#A9B0CC}
.about-page .rstat b em{font-style:normal;color:#4BE3AC;font-size:16px;vertical-align:6px;margin-left:2px}
.about-page .beliefs{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:760px){.about-page .beliefs{grid-template-columns:1fr}}
.about-page .belief{background:#fff;border:1px solid var(--line);border-radius:16px;padding:26px}
.about-page .belief .n{font-family:'Sora';font-weight:800;color:var(--signal);font-size:14px;letter-spacing:.08em}
.about-page .belief h3{font-size:18px;margin:8px 0 8px}
.about-page .belief p{font-size:14.5px;color:var(--ink-600)}
.about-page .note{background:#fff;border:1px solid var(--line);border-radius:20px;padding:38px;display:flex;gap:24px;align-items:flex-start}
@media(max-width:700px){.about-page .note{flex-direction:column}}
.about-page .note .face{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#5B5BD6,#7C7CF0);color:#fff;font-family:'Sora';font-weight:800;font-size:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.about-page .note p{color:#1F2745;margin-bottom:14px}
.about-page .note .sig{font-family:'Sora';font-weight:700}
.about-page .note .role{font-size:13px;color:var(--ink-600)}
.about-page .final{text-align:center;padding:70px 0 96px}
.about-page .final h2{max-width:18em;margin:0 auto 14px}
.about-page .final p{color:var(--ink-600);margin-bottom:28px}
.about-footer{border-top:1px solid #E4E7F2;padding:26px 0;font-size:13px;color:#3A4470;text-align:center;background:#F7F8FC}
`;
