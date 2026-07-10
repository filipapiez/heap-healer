import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { MediaUploader } from "@/components/MediaUploader";
import { listMedia } from "@/lib/media.functions";
import { listAccounts } from "@/lib/accounts.functions";
import { createPost } from "@/lib/posts.functions";

export const Route = createFileRoute("/_authenticated/new-post")({
  head: () => ({ meta: [{ title: "New post — SocialFlow" }] }),
  component: NewPostPage,
});

function NewPostPage() {
  const router = useRouter();
  const media = useQuery({ queryKey: ["media"], queryFn: () => listMedia() });
  const accountsQ = useQuery({ queryKey: ["accounts"], queryFn: () => listAccounts() });

  const [caption, setCaption] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [schedule, setSchedule] = useState("");
  const [overrides, setOverrides] = useState<Record<string, { caption?: string }>>({});
  const [error, setError] = useState("");

  const connected = useMemo(
    () => (accountsQ.data?.accounts ?? []).filter((a) => a.status === "connected"),
    [accountsQ.data],
  );

  const submit = useMutation({
    mutationFn: async () => {
      setError("");
      const scheduledAt = schedule ? new Date(schedule).toISOString() : null;
      return createPost({
        data: {
          caption,
          mediaAssetIds: selectedMedia,
          overrides,
          accountIds: selectedAccounts,
          scheduledAt,
        },
      });
    },
    onSuccess: (r) => router.navigate({ to: "/history" }),
    onError: (e) => setError(e instanceof Error ? e.message : String(e)),
  });

  const toggle = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const canSubmit = selectedAccounts.length > 0 && (caption.trim().length > 0 || selectedMedia.length > 0);

  return (
    <div className="max-w-3xl">
      <PageHeader title="New post" subtitle="Compose once, publish to every selected account." />

      {error && <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>}

      <section className="card mb-4 p-4">
        <div className="label">Caption</div>
        <textarea
          className="input min-h-28"
          placeholder="What's on your mind?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={4000}
        />
        <div className="mt-1 text-right text-xs text-[var(--color-ink-700)]/50">{caption.length}/4000</div>
      </section>

      <section className="card mb-4 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="label !mb-0">Media</div>
          {media.data?.workspaceId && (
            <MediaUploader workspaceId={media.data.workspaceId} onUploaded={() => media.refetch()} />
          )}
        </div>
        {(media.data?.items ?? []).length === 0 ? (
          <p className="text-sm text-[var(--color-ink-700)]/60">No media yet. Upload above to attach.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {media.data!.items.map((m) => {
              const active = selectedMedia.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMedia((cur) => toggle(cur, m.id))}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 ${active ? "border-[var(--color-signal-500)]" : "border-transparent"}`}
                >
                  {m.kind === "video" ? (
                    <video src={m.url ?? undefined} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={m.url ?? ""} alt="" className="h-full w-full object-cover" />
                  )}
                  {active && (
                    <span className="absolute right-1 top-1 rounded-full bg-[var(--color-signal-500)] px-1.5 text-[10px] font-bold text-white">
                      {selectedMedia.indexOf(m.id) + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="card mb-4 p-4">
        <div className="label">Publish to</div>
        {connected.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-700)]/60">
            No connected accounts yet. Add some on the Connected Accounts page.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {connected.map((a) => {
              const active = selectedAccounts.includes(a.id);
              return (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 text-sm ${active ? "border-[var(--color-signal-500)] bg-[var(--color-signal-500)]/5" : "border-[var(--color-mist-200)]"}`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => setSelectedAccounts((cur) => toggle(cur, a.id))}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{a.display_name || a.handle || a.platform}</div>
                    <div className="text-xs text-[var(--color-ink-700)]/60">{a.platform}</div>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {selectedAccounts.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-700)]/60">
              Per-platform caption overrides
            </summary>
            <div className="mt-2 space-y-2">
              {Array.from(new Set(
                connected.filter((a) => selectedAccounts.includes(a.id)).map((a) => a.platform),
              )).map((p) => (
                <div key={p}>
                  <div className="mb-1 text-xs font-medium uppercase text-[var(--color-ink-700)]/70">{p}</div>
                  <textarea
                    className="input min-h-16"
                    placeholder={`Override caption for ${p} (leave empty to use main caption)`}
                    value={overrides[p]?.caption ?? ""}
                    onChange={(e) => setOverrides((cur) => ({ ...cur, [p]: { caption: e.target.value } }))}
                    maxLength={4000}
                  />
                </div>
              ))}
            </div>
          </details>
        )}
      </section>

      <section className="card mb-6 p-4">
        <div className="label">Schedule (optional)</div>
        <input
          type="datetime-local"
          className="input max-w-xs"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
        />
        <p className="mt-1 text-xs text-[var(--color-ink-700)]/60">
          Leave empty to publish now.
        </p>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="btn-primary"
          disabled={!canSubmit || submit.isPending}
          onClick={() => submit.mutate()}
        >
          {submit.isPending ? "Publishing…" : schedule ? "Schedule post" : "Publish now"}
        </button>
      </div>
    </div>
  );
}