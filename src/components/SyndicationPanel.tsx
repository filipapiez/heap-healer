import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, RefreshCw } from "lucide-react";
import {
  connectSyndication,
  disconnectSyndication,
  listSyndication,
  runSyndicationNow,
  type SyndicationPlatform,
} from "@/lib/syndication.functions";

const PLATFORMS: Array<{
  id: SyndicationPlatform;
  name: string;
  help: string;
  tokenLabel: string;
  needsPublication?: boolean;
}> = [
  {
    id: "devto",
    name: "Dev.to",
    help: "Settings → Extensions → DEV Community API Keys → Generate API Key.",
    tokenLabel: "API key",
  },
  {
    id: "hashnode",
    name: "Hashnode",
    help: "Account settings → Developer → Generate new token. Your publication id is in the blog dashboard URL.",
    tokenLabel: "Personal access token",
    needsPublication: true,
  },
  {
    id: "medium",
    name: "Medium",
    help: "Settings → Security and apps → Integration tokens.",
    tokenLabel: "Integration token",
  },
];

export function SyndicationPanel({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["syndication", workspaceId],
    queryFn: () => listSyndication({ data: { workspaceId } }),
  });

  const runMut = useMutation({
    mutationFn: () => runSyndicationNow({ data: { workspaceId } }),
    onSuccess: (r) => {
      toast.success(`Republished ${r.published} article${r.published === 1 ? "" : "s"}`);
      qc.invalidateQueries({ queryKey: ["syndication", workspaceId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (query.isLoading) return <div className="p-8 text-sm text-slate-500">Loading…</div>;
  if (query.error)
    return <div className="p-8 text-sm text-red-600">{(query.error as Error).message}</div>;

  const accounts = query.data?.accounts ?? [];
  const posts = query.data?.posts ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-2xl border border-[#e4e3e7] bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-[#201d24]">
          Republish every new page
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#85818b]">
          Each page we publish to your site is also posted to the writing platforms you connect
          here, with a link back to the original. These links go live the same day — no review
          queue, no captcha.
        </p>

        <div className="mt-5 space-y-3">
          {PLATFORMS.map((platform) => (
            <PlatformRow
              key={platform.id}
              platform={platform}
              workspaceId={workspaceId}
              connected={accounts.find((a) => a.platform === platform.id) ?? null}
            />
          ))}
        </div>

        <button
          onClick={() => runMut.mutate()}
          disabled={runMut.isPending || accounts.length === 0}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#5b5bd6] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <RefreshCw className={"h-4 w-4 " + (runMut.isPending ? "animate-spin" : "")} />
          {runMut.isPending ? "Republishing…" : "Republish now"}
        </button>
      </section>

      <section className="rounded-2xl border border-[#e4e3e7] bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-[#201d24]">Recent republications</h2>
        {posts.length === 0 ? (
          <p className="mt-3 text-sm text-[#85818b]">
            Nothing yet. Connect a platform above and the next daily page appears here.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-xl border border-[#eceaf0] px-3 py-2.5 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate font-medium text-[#302d34]">
                    {post.title ?? "Untitled"}
                  </span>
                  <span className="shrink-0 text-[11px] uppercase tracking-wide text-[#8b8794]">
                    {post.platform}
                  </span>
                </div>
                {post.external_url ? (
                  <a
                    href={post.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-[#5b5bd6] hover:underline"
                  >
                    View live link <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-red-600">{post.error ?? post.status}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PlatformRow({
  platform,
  workspaceId,
  connected,
}: {
  platform: (typeof PLATFORMS)[number];
  workspaceId: string;
  connected: { id: string; status: string; last_error: string | null } | null;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [publicationId, setPublicationId] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["syndication", workspaceId] });

  const connectMut = useMutation({
    mutationFn: () =>
      connectSyndication({
        data: {
          workspaceId,
          platform: platform.id,
          apiToken: token,
          publicationId: publicationId || undefined,
        },
      }),
    onSuccess: () => {
      toast.success(`${platform.name} connected`);
      setOpen(false);
      setToken("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const disconnectMut = useMutation({
    mutationFn: () => disconnectSyndication({ data: { workspaceId, platform: platform.id } }),
    onSuccess: () => {
      toast.success(`${platform.name} disconnected`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-xl border border-[#eceaf0] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#302d34]">{platform.name}</div>
          <div className="text-xs text-[#8b8794]">
            {connected
              ? connected.status === "error"
                ? (connected.last_error ?? "Needs attention")
                : "Connected — republishing daily"
              : "Not connected"}
          </div>
        </div>
        {connected ? (
          <button
            onClick={() => disconnectMut.mutate()}
            className="rounded-lg border border-[#e4e3e7] px-3 py-1.5 text-xs font-semibold text-[#57535d]"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg bg-[#f0f0fb] px-3 py-1.5 text-xs font-semibold text-[#5b5bd6]"
          >
            {open ? "Cancel" : "Connect"}
          </button>
        )}
      </div>

      {open && !connected && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-[#8b8794]">{platform.help}</p>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={platform.tokenLabel}
            className="w-full rounded-lg border border-[#e4e3e7] px-3 py-2 text-sm"
          />
          {platform.needsPublication && (
            <input
              value={publicationId}
              onChange={(e) => setPublicationId(e.target.value)}
              placeholder="Publication id"
              className="w-full rounded-lg border border-[#e4e3e7] px-3 py-2 text-sm"
            />
          )}
          <button
            onClick={() => connectMut.mutate()}
            disabled={connectMut.isPending || !token.trim()}
            className="rounded-lg bg-[#5b5bd6] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {connectMut.isPending ? "Saving…" : "Save connection"}
          </button>
        </div>
      )}
    </div>
  );
}

export default SyndicationPanel;
