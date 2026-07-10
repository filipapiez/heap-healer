import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { recordMediaAsset } from "@/lib/media.functions";

export function MediaUploader({
  workspaceId,
  onUploaded,
}: {
  workspaceId: string;
  onUploaded: (asset: { id: string; storage_path: string; kind: "image" | "video"; original_name: string | null }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<string>("");
  const ref = useRef<HTMLInputElement | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true); setError("");
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(`Uploading ${i + 1}/${files.length}: ${file.name}`);
        const kind: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
        const ext = file.name.split(".").pop() || (kind === "video" ? "mp4" : "jpg");
        const key = crypto.randomUUID();
        const path = `${workspaceId}/${key}.${ext.toLowerCase()}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
          contentType: file.type || undefined, upsert: false,
        });
        if (upErr) throw upErr;
        const { asset } = await recordMediaAsset({
          data: {
            storagePath: path,
            kind,
            mimeType: file.type || undefined,
            sizeBytes: file.size,
            originalName: file.name,
          },
        });
        onUploaded(asset as never);
      }
      setProgress("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div>
      <label className="btn-ghost cursor-pointer">
        <input
          ref={ref}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {busy ? "Uploading…" : "Upload media"}
      </label>
      {progress && <span className="ml-3 text-xs text-[var(--color-ink-700)]/60">{progress}</span>}
      {error && <div className="mt-2 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</div>}
    </div>
  );
}