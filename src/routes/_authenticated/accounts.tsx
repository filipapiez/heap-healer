import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { listAccounts, startConnect, disconnectAccount } from "@/lib/accounts.functions";

type Platform =
  | "youtube"
  | "x"
  | "instagram"
  | "facebook"
  | "pinterest"
  | "linkedin"
  | "tiktok"
  | "threads"
  | "bluesky"
  | "reddit"
  | "google_business";

const ACTIVE_PLATFORMS: { id: Platform; label: string; icon: string; note: string }[] = [
  { id: "youtube", label: "YouTube", icon: "▶" },
  { id: "facebook", label: "Facebook + Instagram", icon: "f" },
  { id: "threads", label: "Threads", icon: "@" },
  { id: "linkedin", label: "LinkedIn", icon: "in" },
  { id: "tiktok", label: "TikTok", icon: "♪" },
].map((item) => ({ ...item, note: "Secure OAuth" }));

const CMS = [
  { label: "WordPress", icon: "W", note: "Plugin or application password" },
  { label: "Shopify", icon: "S", note: "Store app authorization" },
  { label: "Webflow", icon: "w", note: "Workspace OAuth" },
  { label: "Framer", icon: "F", note: "CMS API token" },
  { label: "Ghost", icon: "G", note: "Admin API key" },
  { label: "Notion", icon: "N", note: "Workspace integration" },
];

const UPCOMING = [
  { label: "X", icon: "𝕏" },
  { label: "Pinterest", icon: "P" },
  { label: "Reddit", icon: "r/" },
  { label: "Bluesky", icon: "☁" },
  { label: "Google Business", icon: "G" },
];

export const Route = createFileRoute("/_authenticated/accounts")({
  head: () => ({ meta: [{ title: "Connected accounts — MentionMyApp" }] }),
  component: AccountsPage,
});

function AccountsPage() {
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [connecting, setConnecting] = useState<Platform | null>(null);

  // Surface OAuth callback result from URL (?meta=ok|error&msg=...).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const providers = ["meta", "threads", "youtube", "linkedin", "tiktok"] as const;
    for (const p of providers) {
      const status = params.get(p);
      if (!status) continue;
      const msg = params.get("msg") ?? "";
      const text = `${p}: ${status}${msg ? ` — ${msg}` : ""}`;
      if (status === "ok") setNotice(text);
      else setError(text);
      params.delete(p);
      params.delete("msg");
      const qs = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
      qc.invalidateQueries({ queryKey: ["accounts"] });
      break;
    }
  }, [qc]);

  const q = useQuery({ queryKey: ["accounts"], queryFn: () => listAccounts() });

  const connect = useMutation({
    mutationFn: async (platform: Platform) => {
      setError("");
      setConnecting(platform);
      return startConnect({ data: { platform, origin: window.location.origin } });
    },
    onSuccess: (r) => {
      window.location.href = r.url;
    },
    onError: (e) => {
      setConnecting(null);
      setError(toMessage(e));
      console.error("[accounts] connect failed", e);
    },
  });

  const remove = useMutation({
    mutationFn: (accountId: string) => disconnectAccount({ data: { accountId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
    onError: (e) => {
      setError(toMessage(e));
      console.error("[accounts] disconnect failed", e);
    },
  });

  const accounts = q.data?.accounts ?? [];
  const connectedPlatforms = new Set(
    accounts.filter((a) => a.status === "connected").map((a) => a.platform),
  );

  return (
    <div>
      <PageHeader
        title="Connections"
        subtitle="Connect your analytics, publishing channels, and website CMS in one place."
      />

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>
      )}
      {notice && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      <section className="mb-8 rounded-2xl border border-[#e9eaf2] bg-white p-5 shadow-[0_8px_24px_rgba(23,26,43,.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold">Google Search Console</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-700)]/60">
              Required for daily clicks, impressions, indexed-page tracking, and the 90-day
              baseline.
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
            OAuth setup required
          </span>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Publishing channels available now
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ACTIVE_PLATFORMS.map((p) => {
            const isConnected = connectedPlatforms.has(p.id);
            const isBusy = connecting === p.id && connect.isPending;
            return (
              <button
                key={p.id}
                onClick={() => connect.mutate(p.id)}
                disabled={isBusy}
                className="card flex items-center gap-3 p-4 text-left transition-colors hover:border-[var(--color-ink-900)]/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-mist-100)] font-display text-lg">
                  {p.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.label}</div>
                  <div className="text-xs text-[var(--color-ink-700)]/60">
                    {isBusy ? "Opening…" : isConnected ? "Add another" : p.note}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Website & CMS publishing
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CMS.map((item) => (
            <div key={item.label} className="card flex items-center gap-3 p-4">
              <div className="grid h-11 w-11 place-items-center rounded-full border border-[#dfe2ec] bg-white font-display text-lg font-bold">
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{item.label}</div>
                <div className="text-xs text-[var(--color-ink-700)]/55">{item.note}</div>
              </div>
              <span className="rounded-full bg-[#f1f1f7] px-2 py-1 text-[10px] font-bold text-[#777c8c]">
                Coming next
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Additional channels
        </h2>
        <div className="flex flex-wrap gap-2">
          {UPCOMING.map((item) => (
            <span
              key={item.label}
              className="rounded-full border border-[#e2e4eb] bg-white px-3 py-2 text-xs font-semibold text-[#737889]"
            >
              {item.icon} {item.label} · coming soon
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Connected
        </h2>
        {q.isLoading ? (
          <div className="text-sm text-[var(--color-ink-700)]/60">Loading…</div>
        ) : accounts.length === 0 ? (
          <EmptyState
            title="No accounts yet"
            body="Pick a platform above to open its secure login and link it to this workspace."
          />
        ) : (
          <ul className="space-y-2">
            {accounts.map((a) => (
              <li key={a.id} className="card flex items-center gap-3 p-3">
                {a.avatar_url ? (
                  <img src={a.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[var(--color-mist-100)]" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {a.display_name || a.handle || "Untitled account"}
                  </div>
                  <div className="text-xs text-[var(--color-ink-700)]/60">
                    {labelFor(a.platform as Platform)}
                    {a.handle ? ` · ${a.handle}` : ""}
                  </div>
                  {a.status === "error" && a.error_message && (
                    <div className="mt-0.5 text-xs text-rose-700">{a.error_message}</div>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusPill(a.status)}`}
                >
                  {a.status}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`Disconnect ${a.display_name || a.handle || "this account"}?`)) {
                      remove.mutate(a.id);
                    }
                  }}
                  disabled={remove.isPending}
                  className="btn-ghost !py-1 !text-xs"
                >
                  Disconnect
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function labelFor(p: Platform) {
  if (p === "instagram") return "Instagram";
  if (p === "facebook") return "Facebook Page";
  return ACTIVE_PLATFORMS.find((x) => x.id === p)?.label ?? p;
}

function toMessage(e: unknown): string {
  if (!e) return "Something went wrong";
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (typeof e === "object") {
    const anyE = e as { message?: unknown; error?: unknown };
    if (typeof anyE.message === "string") return anyE.message;
    if (typeof anyE.error === "string") return anyE.error;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
  return String(e);
}

function statusPill(s: string) {
  switch (s) {
    case "connected":
      return "bg-emerald-100 text-emerald-800";
    case "error":
      return "bg-rose-100 text-rose-800";
    case "disconnected":
      return "bg-[var(--color-mist-100)] text-[var(--color-ink-700)]";
    default:
      return "bg-amber-100 text-amber-800";
  }
}
