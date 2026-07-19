import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { PageHeader, EmptyState } from "@/components/PageHeader";
import { MediaUploader } from "@/components/MediaUploader";
import { listMedia, deleteMedia } from "@/lib/media.functions";

export const Route = createFileRoute("/_authenticated/media")({
  head: () => ({ meta: [{ title: "Content assets — MentionMyApp" }] }),
  component: MediaPage,
});

function MediaPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["media"], queryFn: () => listMedia() });
  const del = useMutation({
    mutationFn: (id: string) => deleteMedia({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["media"] }),
  });

  return (
    <div>
      <PageHeader
        title="Content assets"
        subtitle="Reusable images, screenshots and brand files for website content."
        actions={
          q.data?.workspaceId ? (
            <MediaUploader
              workspaceId={q.data.workspaceId}
              onUploaded={() => qc.invalidateQueries({ queryKey: ["media"] })}
            />
          ) : null
        }
      />
      {q.isLoading ? (
        <div className="text-sm text-[var(--color-ink-700)]/60">Loading…</div>
      ) : (q.data?.items ?? []).length === 0 ? (
        <EmptyState
          title="No content assets yet"
          body="Upload brand visuals to reuse in SEO pages and articles."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(q.data?.items ?? []).map((m) => (
            <div key={m.id} className="card group relative overflow-hidden">
              <div className="aspect-square bg-[var(--color-mist-100)]">
                {m.kind === "video" ? (
                  m.url ? (
                    <video src={m.url} className="h-full w-full object-cover" muted />
                  ) : null
                ) : m.url ? (
                  <img
                    src={m.url}
                    alt={m.original_name ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 p-2 text-xs">
                <span className="truncate">{m.original_name ?? m.kind}</span>
                <button
                  onClick={() => confirm("Delete this asset?") && del.mutate(m.id)}
                  className="text-rose-700 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
