import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function activeWorkspaceId(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
) {
  const { data } = await supabase.from("profiles").select("current_workspace_id").eq("id", userId).maybeSingle();
  const id = data?.current_workspace_id as string | null | undefined;
  if (!id) throw new Error("No active workspace");
  return id;
}

export const listMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await activeWorkspaceId(supabase, userId);
    const { data, error } = await supabase.from("media_assets")
      .select("id, storage_path, kind, mime_type, size_bytes, width, height, duration_seconds, original_name, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;

    // sign download URLs (private bucket)
    const signed = await Promise.all(
      (data ?? []).map(async (row) => {
        const { data: url } = await supabase.storage.from("media").createSignedUrl(row.storage_path, 3600);
        return { ...row, url: url?.signedUrl ?? null };
      }),
    );
    return { workspaceId, items: signed };
  });

/** Called by the browser AFTER it uploads the file directly to storage, to
 *  record the asset row. Server verifies the object exists in storage. */
export const recordMediaAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      storagePath: z.string().min(1),
      kind: z.enum(["image", "video"]),
      mimeType: z.string().max(120).optional(),
      sizeBytes: z.number().int().nonnegative().optional(),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
      durationSeconds: z.number().nonnegative().optional(),
      originalName: z.string().max(255).optional(),
    }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await activeWorkspaceId(supabase, userId);

    // Storage path must be scoped to this workspace (RLS enforces on upload too)
    if (!data.storagePath.startsWith(`${workspaceId}/`)) {
      throw new Error("Storage path must live under the active workspace");
    }

    const { data: row, error } = await supabase.from("media_assets").insert({
      workspace_id: workspaceId,
      uploaded_by: userId,
      storage_path: data.storagePath,
      kind: data.kind,
      mime_type: data.mimeType ?? null,
      size_bytes: data.sizeBytes ?? null,
      width: data.width ?? null,
      height: data.height ?? null,
      duration_seconds: data.durationSeconds ?? null,
      original_name: data.originalName ?? null,
    }).select("id, storage_path, kind, original_name, created_at").single();
    if (error) throw error;
    return { asset: row };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase.from("media_assets")
      .select("id, storage_path").eq("id", data.id).maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Not found");
    await supabase.storage.from("media").remove([row.storage_path]).catch(() => undefined);
    const { error: delErr } = await supabase.from("media_assets").delete().eq("id", data.id);
    if (delErr) throw delErr;
    return { ok: true };
  });