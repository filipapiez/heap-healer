import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { checkMyPagesLive } from "@/lib/growth-dashboard.functions";

type Host = "vercel" | "netlify" | "cloudflare";

const HOSTS: Record<Host, { name: string; url: (repo: string) => string; domainHelp: string }> = {
  vercel: {
    name: "Vercel",
    url: (repo) => `https://vercel.com/new/import?s=${encodeURIComponent(`https://github.com/${repo}`)}`,
    domainHelp: "Project → Settings → Domains → add your domain, then copy the DNS records it shows.",
  },
  netlify: {
    name: "Netlify",
    url: () => "https://app.netlify.com/start",
    domainHelp: "Site configuration → Domain management → Add a domain, then copy the DNS records it shows.",
  },
  cloudflare: {
    name: "Cloudflare Pages",
    url: () => "https://dash.cloudflare.com/?to=/:account/workers-and-pages/create/pages",
    domainHelp: "Your Pages project → Custom domains → Set up a domain.",
  },
};

/** Guides a customer to host their GitHub repo somewhere that re-deploys on every commit. */
export function AutoHostingSetup({ repositories }: { repositories: string[] }) {
  const [host, setHost] = useState<Host>("vercel");
  const [repo, setRepo] = useState(repositories[0] ?? "");
  const [checking, setChecking] = useState(false);
  const check = useServerFn(checkMyPagesLive);
  if (!repositories.length) return null;
  const h = HOSTS[host];

  const steps = [
    <>Open <a className="font-semibold text-[#6C5CE7] underline" href={h.url(repo)} target="_blank" rel="noreferrer">{h.name} with your repository</a> and sign in with GitHub.</>,
    <>Pick <b>{repo}</b>. Leave the settings as they are (build command <code>npm run build</code>, output folder <code>dist</code>) and press <b>Deploy</b>.</>,
    <>Add your domain: {h.domainHelp} Paste those records where you bought the domain, and remove it from Lovable's domain settings.</>,
    <>Done. Keep editing in Lovable as usual. Every change and every new page now goes live by itself within about a minute.</>,
  ];

  return (
    <section className="mb-6 rounded-2xl border border-[#e4e3e7] bg-white p-5">
      <h2 className="font-display text-lg font-bold">Make new pages go live automatically</h2>
      <p className="mt-1 text-sm text-[#6B7086]">
        Sites hosted by Lovable only update when someone clicks Publish. Host the same site on a free service that updates
        itself whenever we add a page. It's a one-time setup that takes about 10 minutes.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(HOSTS) as Host[]).map((key) => (
          <button
            key={key}
            onClick={() => setHost(key)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${host === key ? "border-[#6C5CE7] bg-[#f3f1ff] text-[#6C5CE7]" : "border-[#e4e3e7]"}`}
          >
            {HOSTS[key].name}{key === "vercel" ? " (recommended)" : ""}
          </button>
        ))}
        {repositories.length > 1 && (
          <select value={repo} onChange={(e) => setRepo(e.target.value)} className="rounded-lg border border-[#e4e3e7] px-2 text-xs">
            {repositories.map((r) => <option key={r}>{r}</option>)}
          </select>
        )}
      </div>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0C0E1A] text-xs font-bold text-white">{i + 1}</span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      <button
        disabled={checking}
        onClick={async () => {
          setChecking(true);
          try {
            const r = (await check()) as { live?: number; pending?: number } | undefined;
            toast.success(`Checked your pages: ${r?.live ?? 0} live, ${r?.pending ?? 0} not live yet.`);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Check failed");
          } finally {
            setChecking(false);
          }
        }}
        className="mt-5 rounded-lg bg-[#0C0E1A] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
      >
        {checking ? "Checking…" : "I've finished — check my pages"}
      </button>
    </section>
  );
}
