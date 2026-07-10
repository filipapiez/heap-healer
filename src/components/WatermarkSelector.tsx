import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWatermark, updateWatermark,
  WATERMARK_POSITIONS, type WatermarkPosition, type WatermarkSettings,
} from "@/lib/watermark.functions";

const POSITION_LABEL: Record<WatermarkPosition, string> = {
  "top-left": "Top left",
  "top-right": "Top right",
  "bottom-left": "Bottom left",
  "bottom-right": "Bottom right",
  "center": "Center",
};

export function WatermarkSelector() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["watermark"], queryFn: () => getWatermark() });
  const [draft, setDraft] = useState<WatermarkSettings | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => { if (q.data && !draft) setDraft(q.data); }, [q.data, draft]);

  const save = useMutation({
    mutationFn: (v: WatermarkSettings) => updateWatermark({ data: v }),
    onSuccess: () => {
      setStatus({ kind: "ok", msg: "Saved" });
      qc.invalidateQueries({ queryKey: ["watermark"] });
    },
    onError: (e) => setStatus({ kind: "err", msg: e instanceof Error ? e.message : String(e) }),
  });

  if (!draft) {
    return <div className="card p-5 text-sm text-[var(--color-ink-700)]/60">Loading watermark…</div>;
  }

  const patch = (p: Partial<WatermarkSettings>) => setDraft((d) => ({ ...(d as WatermarkSettings), ...p }));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Video watermark</div>
          <div className="mt-0.5 text-xs text-[var(--color-ink-700)]/60">
            Applied to every video published from this workspace.
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox" className="h-4 w-4"
            checked={draft.enabled}
            onChange={(e) => patch({ enabled: e.target.checked })}
          />
          {draft.enabled ? "Enabled" : "Off"}
        </label>
      </div>

      <div className={`mt-5 grid gap-5 lg:grid-cols-[1fr_minmax(220px,280px)] ${draft.enabled ? "" : "opacity-50 pointer-events-none"}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Position</label>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {WATERMARK_POSITIONS.map((pos) => (
                <button
                  key={pos} type="button"
                  onClick={() => patch({ position: pos })}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                    draft.position === pos
                      ? "border-[var(--color-ink-900)] bg-[var(--color-ink-900)] text-white"
                      : "border-[var(--color-mist-200)] hover:border-[var(--color-ink-900)]/30"
                  }`}
                >
                  {POSITION_LABEL[pos]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Opacity — {Math.round(draft.opacity * 100)}%</label>
            <input
              type="range" min={0.1} max={1} step={0.05}
              value={draft.opacity}
              onChange={(e) => patch({ opacity: Number(e.target.value) })}
              className="mt-1 w-full"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Text</label>
              <input
                className="input" placeholder="@yourbrand"
                value={draft.text ?? ""}
                maxLength={60}
                onChange={(e) => patch({ text: e.target.value || null })}
              />
            </div>
            <div>
              <label className="label">Image URL (optional)</label>
              <input
                className="input" placeholder="https://…/logo.png"
                value={draft.image_url ?? ""}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  patch({ image_url: v || null });
                }}
              />
            </div>
          </div>
          <p className="text-xs text-[var(--color-ink-700)]/50">
            If both are set, the image takes precedence and text is used as fallback.
          </p>
        </div>

        <WatermarkPreview settings={draft} />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={() => save.mutate(draft)}
          disabled={save.isPending}
          className="btn-primary"
        >
          {save.isPending ? "Saving…" : "Save watermark"}
        </button>
        {status && (
          <span className={`text-xs ${status.kind === "ok" ? "text-emerald-700" : "text-rose-700"}`}>
            {status.msg}
          </span>
        )}
      </div>
    </div>
  );
}

function WatermarkPreview({ settings }: { settings: WatermarkSettings }) {
  const pos = settings.position;
  const posClass =
    pos === "top-left" ? "top-3 left-3" :
    pos === "top-right" ? "top-3 right-3" :
    pos === "bottom-left" ? "bottom-3 left-3" :
    pos === "bottom-right" ? "bottom-3 right-3" :
    "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";

  return (
    <div>
      <div className="label mb-1">Preview</div>
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-[var(--color-ink-900)] to-[var(--color-mist-200)]">
        {settings.enabled && (
          <div
            className={`absolute ${posClass} max-w-[70%]`}
            style={{ opacity: settings.opacity }}
          >
            {settings.image_url ? (
              <img
                src={settings.image_url} alt=""
                className="max-h-10 object-contain drop-shadow-lg"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <span className="rounded bg-black/40 px-2 py-1 font-display text-sm font-semibold text-white drop-shadow">
                {settings.text || "@yourbrand"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}