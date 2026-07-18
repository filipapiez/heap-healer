import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { signBrandAssetUrl } from "@/lib/directories.functions";

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
const MAX_BYTES = 2 * 1024 * 1024;

export function LogoUploader({
  workspaceId,
  value,
  onChange,
}: {
  workspaceId: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [manual, setManual] = useState(false);

  async function checkDimensions(file: File): Promise<{ w: number; h: number } | null> {
    if (file.type === "image/svg+xml") return null;
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  async function handleFile(file: File | null | undefined) {
    if (!file) return;
    setError(""); setWarning("");
    if (!ACCEPTED.includes(file.type)) {
      setError("Logo must be PNG, JPG, or SVG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Logo must be 2 MB or smaller.");
      return;
    }
    const dims = await checkDimensions(file);
    if (dims && (dims.w < 200 || dims.h < 200)) {
      setWarning(`Heads up: ${dims.w}×${dims.h} is smaller than 200×200 — some directories may reject it.`);
    }

    setBusy(true);
    try {
      const ext =
        file.type === "image/svg+xml" ? "svg"
        : file.type === "image/png" ? "png"
        : "jpg";
      const path = `logos/${workspaceId}/logo.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("brand-assets")
        .upload(path, file, { contentType: file.type, upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { url } = await signBrandAssetUrl({ data: { path } });
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Logo
      </label>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          <img
            src={value}
            alt="Logo preview"
            className="h-16 w-16 rounded-lg border border-slate-200 bg-white object-contain p-1"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-[10px] text-slate-400">
            No logo
          </div>
        )}
        <div className="flex flex-col gap-1">
          <input
            ref={ref}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            disabled={busy}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => ref.current?.click()}
            disabled={busy}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy ? "Uploading…" : value ? "Replace" : "Upload logo"}
          </button>
          <button
            type="button"
            onClick={() => setManual((m) => !m)}
            className="text-left text-[11px] text-slate-500 hover:text-slate-700"
          >
            {manual ? "Hide URL input" : "Paste a URL instead"}
          </button>
        </div>
      </div>
      {manual && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…/logo.png"
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#5b5bd6] focus:outline-none"
        />
      )}
      <div className="mt-1 text-[11px] text-slate-500">
        PNG, JPG, or SVG · up to 2 MB · 200×200 or larger recommended.
      </div>
      {warning && <div className="mt-1 text-[11px] text-amber-700">{warning}</div>}
      {error && <div className="mt-1 text-[11px] text-rose-700">{error}</div>}
    </div>
  );
}