import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — MentionMyApp" },
      { name: "description", content: "Sign in to your MentionMyApp account." },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" },
    ],
  }),
  component: AuthPage,
});

const STYLES = `
.mma-auth{--ink:#0B1020;--ink-800:#1A2242;--ink-600:#3A4470;--signal:#5B5BD6;--signal-deep:#4747C2;--signal-soft:#EDEDFB;--mist:#F7F8FC;--line:#E4E7F2;--ok:#12B981;font-family:'Inter',system-ui,sans-serif;color:var(--ink);background:var(--mist);min-height:100vh;display:grid;grid-template-columns:1fr 1.1fr}
@media(max-width:920px){.mma-auth{grid-template-columns:1fr}.mma-auth .side{display:none}}
.mma-auth h1,.mma-auth h2,.mma-auth .logo{font-family:'Sora',sans-serif;letter-spacing:-.02em}
.mma-auth a{color:inherit}
.mma-auth :focus-visible{outline:3px solid var(--signal);outline-offset:2px;border-radius:8px}
.mma-auth .side{background:radial-gradient(120% 120% at 0% 0%, #171F45 0%, var(--ink) 55%);color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:48px 52px;position:relative;overflow:hidden}
.mma-auth .side::after{content:"";position:absolute;width:520px;height:520px;border-radius:50%;border:1px dashed rgba(124,124,240,.35);right:-200px;bottom:-200px}
.mma-auth .side::before{content:"";position:absolute;width:340px;height:340px;border-radius:50%;border:1px dashed rgba(124,124,240,.22);right:-110px;bottom:-110px}
.mma-auth .logo{font-weight:800;font-size:21px;color:#fff}
.mma-auth .logo em{font-style:normal;color:#7C7CF0}
.mma-auth .side h2{font-size:clamp(26px,2.8vw,36px);font-weight:800;line-height:1.15;max-width:12em}
.mma-auth .side h2 .accent{color:#7C7CF0}
.mma-auth .checks{margin-top:26px;display:flex;flex-direction:column;gap:12px}
.mma-auth .checks span{display:flex;align-items:center;gap:10px;font-size:15px;color:#C6CBE2}
.mma-auth .checks b{width:22px;height:22px;border-radius:50%;background:rgba(18,185,129,.18);color:#4BE3AC;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.mma-auth .side-foot{font-size:13px;color:#8A93B8;display:flex;align-items:center;gap:10px;position:relative;z-index:1}
.mma-auth .gbadge{width:44px;height:44px;border-radius:50%;background:rgba(18,185,129,.16);border:1.5px solid rgba(18,185,129,.5);color:#4BE3AC;font-family:'Sora';font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mma-auth .pane{display:flex;align-items:center;justify-content:center;padding:40px 24px}
.mma-auth .card{width:100%;max-width:440px;background:transparent;border:0;box-shadow:none;padding:0}
.mma-auth .card .head{text-align:center;margin-bottom:26px}
.mma-auth .card .head .logo{color:var(--ink);font-size:24px}
.mma-auth .card .head p{margin-top:6px;font-size:14px;color:var(--ink-600)}
.mma-auth .tabs{display:flex;background:var(--signal-soft);border-radius:12px;padding:4px;margin-bottom:22px}
.mma-auth .tabs button{flex:1;border:0;background:transparent;font:inherit;font-weight:600;font-size:14.5px;padding:10px;border-radius:9px;cursor:pointer;color:var(--signal-deep)}
.mma-auth .tabs button.on{background:var(--signal);color:#fff;box-shadow:0 6px 16px rgba(91,91,214,.35)}
.mma-auth .btn-google{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:13px;font:inherit;font-weight:600;font-size:15px;cursor:pointer;transition:border-color .15s;color:var(--ink)}
.mma-auth .btn-google:hover{border-color:#C9CEE4}
.mma-auth .or{display:flex;align-items:center;gap:14px;margin:20px 0;color:var(--ink-600);font-size:12px;font-weight:600;letter-spacing:.08em}
.mma-auth .or::before,.mma-auth .or::after{content:"";flex:1;height:1px;background:var(--line)}
.mma-auth label{display:block;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-600);margin:16px 0 7px}
.mma-auth input{width:100%;font:inherit;font-size:15px;padding:13px 15px;border:1px solid var(--line);border-radius:12px;background:#fff;transition:border-color .15s, box-shadow .15s;color:var(--ink)}
.mma-auth input:focus{outline:0;border-color:var(--signal);box-shadow:0 0 0 4px rgba(91,91,214,.15)}
.mma-auth .row{display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:13px}
.mma-auth .row a{color:var(--signal-deep);font-weight:600;text-decoration:none;cursor:pointer}
.mma-auth .row a:hover{text-decoration:underline}
.mma-auth .submit{width:100%;margin-top:20px;background:var(--signal);color:#fff;border:0;border-radius:12px;padding:14px;font:inherit;font-family:'Sora';font-weight:700;font-size:15.5px;cursor:pointer;box-shadow:0 10px 26px rgba(91,91,214,.35);transition:background .15s, transform .15s}
.mma-auth .submit:hover{background:var(--signal-deep);transform:translateY(-1px)}
.mma-auth .submit:disabled{opacity:.6;cursor:not-allowed;transform:none}
.mma-auth .foot{text-align:center;margin-top:22px;font-size:13px;color:var(--ink-600)}
.mma-auth .foot b{color:var(--ok)}
.mma-auth .msg{margin-top:12px;padding:10px 12px;border-radius:10px;font-size:13px}
.mma-auth .msg.err{background:#FEF2F2;color:#991B1B}
.mma-auth .msg.ok{background:#ECFDF5;color:#065F46}
`;

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setInfo("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: email.split("@")[0] },
          },
        });
        if (error) throw error;
        setInfo("Check your inbox to confirm your email, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  async function google() {
    setBusy(true); setError("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) { setError(result.error.message ?? "Google sign-in failed"); setBusy(false); return; }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="mma-auth">
        <aside className="side">
          <Link to="/" className="logo">Mention<em>My</em>App</Link>
          <div>
            <h2>Post once.<br />Show up everywhere —<br /><span className="accent">including Google.</span></h2>
            <div className="checks">
              <span><b>✓</b> Publish to 11 platforms in one click</span>
              <span><b>✓</b> Every like, comment &amp; DM in one inbox</span>
              <span><b>✓</b> Backlinks + indexable pages, automatically</span>
            </div>
          </div>
          <div className="side-foot">
            <div className="gbadge">90</div>
            <span>90-day guarantee — rank better on Google or get every dollar back, and keep all the work.</span>
          </div>
        </aside>

        <main className="pane">
          <div className="card">
            <div className="head">
              <Link to="/" className="logo">Mention<em style={{ fontStyle: "normal", color: "var(--signal)" }}>My</em>App</Link>
              <p>{mode === "signin" ? "Welcome back — your platforms are waiting." : "Create your account in seconds."}</p>
            </div>

            <div className="tabs" role="tablist">
              <button type="button" className={mode === "signin" ? "on" : ""} onClick={() => { setMode("signin"); setError(""); setInfo(""); }} role="tab" aria-selected={mode === "signin"}>Sign in</button>
              <button type="button" className={mode === "signup" ? "on" : ""} onClick={() => { setMode("signup"); setError(""); setInfo(""); }} role="tab" aria-selected={mode === "signup"}>Create account</button>
            </div>

            <button type="button" className="btn-google" onClick={google} disabled={busy}>
              <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.2a9.8 9.8 0 0 0 3-7.5Z"/><path fill="#34A853" d="M12 22a9.6 9.6 0 0 0 6.6-2.4l-3.2-2.5a6 6 0 0 1-9-3.2H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9Z"/><path fill="#EA4335" d="M12 5.9a5.4 5.4 0 0 1 3.8 1.5l2.9-2.8A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.5l3.3 2.6A6 6 0 0 1 12 5.9Z"/></svg>
              Continue with Google
            </button>

            <div className="or">OR</div>

            <form onSubmit={submit}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label htmlFor="pw">Password</label>
              <input id="pw" type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className="row"><span></span>{mode === "signin" && <a>Forgot password?</a>}</div>
              {error && <div className="msg err">{error}</div>}
              {info && <div className="msg ok">{info}</div>}
              <button className="submit" type="submit" disabled={busy}>
                {busy ? "…" : mode === "signin" ? "Sign in →" : "Create account →"}
              </button>
            </form>

            <div className="foot"><b>●</b> We never ask for your social media passwords — platforms connect via their official sign-in.</div>
          </div>
        </main>
      </div>
    </>
  );
}