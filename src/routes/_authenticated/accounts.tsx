import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { listAccounts, startConnect, disconnectAccount } from "@/lib/accounts.functions";

type Platform =
  | "youtube" | "x" | "instagram" | "facebook" | "pinterest"
  | "linkedin" | "tiktok" | "threads" | "bluesky" | "reddit" | "google_business";

const PLATFORMS: { id: Platform; label: string; icon: string }[] = [
  { id: "youtube", label: "YouTube", icon: "▶" },
  { id: "x", label: "X (Twitter)", icon: "𝕏" },
  { id: "facebook", label: "Facebook + Instagram", icon: "f" },
  { id: "threads", label: "Threads", icon: "@" },
  { id: "pinterest", label: "Pinterest", icon: "P" },
  { id: "linkedin", label: "LinkedIn", icon: "in" },
  { id: "tiktok", label: "TikTok", icon: "♪" },
  { id: "bluesky", label: "Bluesky", icon: "☁" },
  { id: "reddit", label: "Reddit", icon: "r/" },
  { id: "google_business", label: "Google Business", icon: "G" },
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
    onSuccess: (r) => { window.location.href = r.url; },
    onError: (e) => { setConnecting(null); setError(toMessage(e)); console.error("[accounts] connect failed", e); },
  });

  const remove = useMutation({
    mutationFn: (accountId: string) => disconnectAccount({ data: { accountId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
    onError: (e) => { setError(toMessage(e)); console.error("[accounts] disconnect failed", e); },
  });

  const accounts = q.data?.accounts ?? [];
  const connectedPlatforms = new Set(accounts.filter((a) => a.status === "connected").map((a) => a.platform));

  return (
    <div>
      <PageHeader
        title="Connected accounts"
        subtitle="Link a platform once — MentionMyApp publishes to it from every post."
      />

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>
      )}
      {notice && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</div>
      )}

      <section className="mb-8">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
          Available platforms
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PLATFORMS.map((p) => {
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
                    {isBusy ? "Opening…" : isConnected ? "Add another" : "Connect"}
                  </div>
                </div>
              </button>
            );
          })}
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
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusPill(a.status)}`}>
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
  return PLATFORMS.find((x) => x.id === p)?.label ?? p;
}

function toMessage(e: unknown): string {
  if (!e) return "Something went wrong";
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (typeof e === "object") {
    const anyE = e as { message?: unknown; error?: unknown };
    if (typeof anyE.message === "string") return anyE.message;
    if (typeof anyE.error === "string") return anyE.error;
    try { return JSON.stringify(e); } catch { return String(e); }
  }
  return String(e);
}

function statusPill(s: string) {
  switch (s) {
    case "connected": return "bg-emerald-100 text-emerald-800";
    case "error": return "bg-rose-100 text-rose-800";
    case "disconnected": return "bg-[var(--color-mist-100)] text-[var(--color-ink-700)]";
    default: return "bg-amber-100 text-amber-800";
  }
}