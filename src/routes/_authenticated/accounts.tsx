import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import {
  connectWordpress,
  getWebsiteConnectionStatus,
  selectGithubRepository,
  startGithubInstallation,
  startGscConnection,
  startShopifyConnection,
} from "@/lib/website-connections.functions";

const CMS = [
  {
    label: "Lovable",
    icon: "L",
    github: true,
    description:
      "Connect the GitHub repository behind your Lovable project. MentionMyApp opens reviewable pull requests that Lovable deploys through your normal workflow.",
    setup: "GitHub App",
  },
  {
    label: "Cursor",
    icon: "C",
    github: true,
    description:
      "Connect the website repository you edit in Cursor. We create a branch and pull request with pages, metadata, schema, and internal links.",
    setup: "GitHub App",
  },
  {
    label: "WordPress",
    icon: "W",
    description: "Publish and update SEO pages using a WordPress application password or plugin.",
    setup: "Application password",
  },
  {
    label: "Shopify",
    icon: "S",
    description: "Create optimized articles, collection copy, and internal links in your store.",
    setup: "Shopify app",
  },
  {
    label: "Webflow",
    icon: "w",
    description: "Publish directly into a selected Webflow CMS collection.",
    setup: "Workspace OAuth",
  },
  {
    label: "Framer",
    icon: "F",
    description: "Send approved SEO pages and metadata into your Framer CMS.",
    setup: "CMS API",
  },
  {
    label: "Ghost",
    icon: "G",
    description: "Publish search-focused posts through the Ghost Admin API.",
    setup: "Admin API key",
  },
  {
    label: "Notion",
    icon: "N",
    description: "Use a Notion database as the approval and content staging area.",
    setup: "Workspace integration",
  },
];

function errorMessage(cause: unknown): string {
  if (cause instanceof Error && cause.message) return cause.message;
  if (typeof cause === "string" && cause.trim()) return cause;
  if (cause && typeof cause === "object") {
    const value = cause as Record<string, unknown>;
    for (const key of ["message", "error", "data", "cause"]) {
      if (key in value) {
        const nested = errorMessage(value[key]);
        if (nested !== "Something went wrong. Please try again.") return nested;
      }
    }
  }
  return "Something went wrong. Please try again.";
}

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({ meta: [{ title: "Website connections — MentionMyApp" }] }),
  component: WebsiteConnections,
});

function WebsiteConnections() {
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const callbackStatus = params.get("gsc") ?? params.get("github") ?? params.get("shopify");
  const callbackMessage = params.get("msg");
  const status = useQuery({
    queryKey: ["website-connections"],
    queryFn: () => getWebsiteConnectionStatus(),
  });
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [wp, setWp] = useState({ siteUrl: "", username: "", applicationPassword: "" });
  const [shop, setShop] = useState("");
  const gsc = useMutation({
    mutationFn: () => startGscConnection({ data: { origin: window.location.origin, website } }),
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (cause) => setError(errorMessage(cause)),
  });
  const github = useMutation({
    mutationFn: () => startGithubInstallation({ data: { origin: window.location.origin } }),
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (cause) => setError(errorMessage(cause)),
  });
  const wordpress = useMutation({
    mutationFn: () => connectWordpress({ data: wp }),
    onSuccess: () => status.refetch(),
    onError: (cause) => setError(errorMessage(cause)),
  });
  const shopify = useMutation({
    mutationFn: () => startShopifyConnection({ data: { origin: window.location.origin, shop } }),
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (cause) => setError(errorMessage(cause)),
  });
  const chooseRepo = useMutation({
    mutationFn: (repository: string) => selectGithubRepository({ data: { repository } }),
    onSuccess: () => status.refetch(),
    onError: (cause) => setError(errorMessage(cause)),
  });
  const gscRow = status.data?.gsc as
    { property_url?: string; last_synced_at?: string; last_error?: string } | null | undefined;
  const githubRow = status.data?.github;
  const githubConfigured = status.data?.githubConfigured ?? false;

  useEffect(() => {
    if (gscRow?.property_url) setWebsite(gscRow.property_url);
  }, [gscRow?.property_url]);

  return (
    <div className="max-w-7xl">
      <PageHeader
        title="Website connections"
        subtitle="Connect measurement first, then choose where MentionMyApp should deliver approved SEO work."
      />
      {(callbackMessage || error) && (
        <div
          role="alert"
          className={`mb-5 rounded-xl border px-4 py-3 text-sm ${callbackStatus === "error" || error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        >
          {error || callbackMessage}
        </div>
      )}

      <section className="mb-8 overflow-hidden rounded-2xl border border-[#dfe1eb] bg-white shadow-[0_10px_30px_rgba(23,26,43,.05)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div className="flex gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[conic-gradient(#4285f4_0_25%,#ea4335_25%_50%,#fbbc05_50%_75%,#34a853_75%)] text-xl font-black text-white">
              G
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold">Google Search Console</h2>
                <span className="rounded-full bg-[#efefff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#5558d8]">
                  Required
                </span>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[var(--color-ink-700)]/65">
                Read-only access supplies daily clicks, impressions, indexing data, and the day-one
                baseline used by your SEO Growth report.
              </p>
              {gscRow?.property_url && (
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  Connected: {gscRow.property_url}
                  {gscRow.last_synced_at
                    ? ` · synced ${new Date(gscRow.last_synced_at).toLocaleString()}`
                    : ""}
                </p>
              )}
              {gscRow?.last_error && (
                <p className="mt-2 text-xs text-red-600">Last sync: {gscRow.last_error}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <input
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              disabled={Boolean(gscRow?.property_url)}
              placeholder="https://yourwebsite.com"
              className="w-full rounded-xl border border-[#dfe1eb] px-4 py-3 text-sm outline-none focus:border-[#6366f1] disabled:cursor-not-allowed disabled:bg-[#f5f5f8] disabled:text-[#737889]"
            />
            {gscRow?.property_url && (
              <p className="text-xs text-[#737889]">
                This workspace is locked to this Search Console property.
              </p>
            )}
            <button
              type="button"
              disabled={gsc.isPending || !website}
              onClick={() => gsc.mutate()}
              className="w-full rounded-xl bg-[#111426] px-5 py-3 text-sm font-bold text-white disabled:opacity-45"
            >
              {gsc.isPending
                ? "Opening Google…"
                : gscRow
                  ? "Reconnect Search Console"
                  : "Connect Search Console"}
            </button>
          </div>
        </div>
        <div className="border-t border-[#ececf2] bg-[#fafafe] px-6 py-3 text-xs text-[#737889]">
          Once connected, verified metrics sync automatically every day into the SEO Growth
          dashboard.
        </div>
      </section>

      <div className="mb-4">
        <h2 className="font-display text-xl font-bold">Choose your website platform or workflow</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-700)]/55">
          Lovable and Cursor use one secure GitHub App connection. Choose only the repositories
          MentionMyApp may access.
        </p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CMS.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-[#e1e3eb] bg-white p-5 shadow-[0_8px_24px_rgba(23,26,43,.04)]"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full border border-[#dfe2ec] font-display text-lg font-black">
                {item.icon}
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.github && githubRow ? "bg-emerald-50 text-emerald-700" : "bg-[#f2f2f7] text-[#777c8c]"}`}
              >
                {item.github
                  ? githubRow
                    ? "Connected"
                    : githubConfigured
                      ? "Available"
                      : "Setup required"
                  : "Coming next"}
              </span>
            </div>
            <h3 className="font-display text-lg font-bold">{item.label}</h3>
            <p className="mt-2 min-h-16 text-sm leading-6 text-[var(--color-ink-700)]/60">
              {item.description}
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-[#ececf2] pt-4">
              <span className="text-xs font-semibold text-[#777c8c]">{item.setup}</span>
              {item.github ? (
                <button
                  type="button"
                  onClick={() => github.mutate()}
                  disabled={github.isPending || !githubConfigured}
                  className="text-xs font-bold text-[#6366f1] disabled:opacity-50"
                >
                  {!githubConfigured
                    ? "Owner setup required"
                    : githubRow
                      ? "Manage repositories →"
                      : "Connect GitHub →"}
                </button>
              ) : (
                <span className="text-xs font-bold text-[#9a9eaa]">Connect soon</span>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#e1e3eb] bg-white p-5">
          <h3 className="font-display text-lg font-bold">Connect WordPress</h3>
          <p className="mt-1 text-xs text-[#737889]">
            Use a revocable Application Password—not the normal login password.
          </p>
          <div className="mt-4 grid gap-2">
            <input
              className="rounded-xl border border-[#dfe1eb] px-3 py-2.5 text-sm"
              placeholder="https://example.com"
              value={wp.siteUrl}
              onChange={(event) => setWp({ ...wp, siteUrl: event.target.value })}
            />
            <input
              className="rounded-xl border border-[#dfe1eb] px-3 py-2.5 text-sm"
              placeholder="WordPress username"
              value={wp.username}
              onChange={(event) => setWp({ ...wp, username: event.target.value })}
            />
            <input
              type="password"
              className="rounded-xl border border-[#dfe1eb] px-3 py-2.5 text-sm"
              placeholder="Application Password"
              value={wp.applicationPassword}
              onChange={(event) => setWp({ ...wp, applicationPassword: event.target.value })}
            />
            <button
              onClick={() => wordpress.mutate()}
              disabled={
                wordpress.isPending || !wp.siteUrl || !wp.username || !wp.applicationPassword
              }
              className="rounded-xl bg-[#111426] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {wordpress.isPending ? "Testing connection…" : "Test and connect WordPress"}
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-[#e1e3eb] bg-white p-5">
          <h3 className="font-display text-lg font-bold">Connect Shopify</h3>
          <p className="mt-1 text-xs text-[#737889]">
            Customers approve access in Shopify. No password is shared.
          </p>
          <div className="mt-4 grid gap-2">
            <input
              className="rounded-xl border border-[#dfe1eb] px-3 py-2.5 text-sm"
              placeholder="your-store.myshopify.com"
              value={shop}
              onChange={(event) => setShop(event.target.value)}
            />
            <button
              onClick={() => shopify.mutate()}
              disabled={shopify.isPending || !shop}
              className="rounded-xl bg-[#111426] px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {shopify.isPending ? "Opening Shopify…" : "Connect Shopify securely"}
            </button>
          </div>
        </div>
      </section>

      {!!status.data?.repositories.length && (
        <section className="mt-6 rounded-2xl border border-[#e1e3eb] bg-white p-5">
          <h3 className="font-display text-lg font-bold">Choose delivery repositories</h3>
          <p className="mt-1 text-sm text-[#737889]">
            MentionMyApp can open SEO pull requests only in the repositories selected during GitHub
            installation.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {status.data.repositories.map((repo) => (
              <button
                key={repo.id}
                onClick={() => chooseRepo.mutate(repo.full_name)}
                className="rounded-lg border border-[#e1e3eb] px-3 py-2 text-xs font-semibold hover:border-[#6366f1]"
              >
                {repo.full_name}
                {repo.private ? " · private" : ""}
                {" +"}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 rounded-2xl bg-[#111426] p-6 text-white">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.15em] text-[#9ea4bd]">
              Don’t see your website platform?
            </div>
            <h2 className="mt-2 font-display text-xl font-bold">
              We can start with a manual setup.
            </h2>
            <p className="mt-2 text-sm text-[#b8bdd0]">
              Your Search Console reporting works independently of publishing. More direct CMS
              connections are coming next.
            </p>
          </div>
          <Link
            to="/contact"
            className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-[#111426]"
          >
            Request a platform
          </Link>
        </div>
      </section>
    </div>
  );
}
