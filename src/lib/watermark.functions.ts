import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const WATERMARK_POSITIONS = [
  "top-left", "top-right", "bottom-left", "bottom-right", "center",
] as const;
export type WatermarkPosition = (typeof WATERMARK_POSITIONS)[number];

export type WatermarkSettings = {
  enabled: boolean;
  position: WatermarkPosition;
  opacity: number;
  text: string | null;
  image_url: string | null;
};

const WatermarkSchema = z.object({
  enabled: z.boolean(),
  position: z.enum(WATERMARK_POSITIONS),
  opacity: z.number().min(0).max(1),
  text: z.string().trim().max(60).nullable(),
  image_url: z.string().url().nullable(),
});

async function activeWorkspaceId(supabase: import("@supabase/supabase-js").SupabaseClient, userId: string) {
  const { data } = await supabase.from("profiles").select("current_workspace_id").eq("id", userId).maybeSingle();
  const id = data?.current_workspace_id as string | null | undefined;
  if (!id) throw new Error("No active workspace");
  return id;
}

export const getWatermark = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WatermarkSettings> => {
    const { supabase, userId } = context;
    const workspaceId = await activeWorkspaceId(supabase, userId);
    const { data, error } = await supabase.from("workspaces").select("watermark").eq("id", workspaceId).maybeSingle();
    if (error) throw error;
    return WatermarkSchema.parse(data?.watermark);
  });

export const updateWatermark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => WatermarkSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await activeWorkspaceId(supabase, userId);
    const { data: mem } = await supabase.from("workspace_members")
      .select("role").eq("workspace_id", workspaceId).eq("user_id", userId).maybeSingle();
    if (!mem || (mem.role !== "owner" && mem.role !== "admin")) {
      throw new Error("Only workspace owners and admins can change the watermark");
    }
    const { error } = await supabase.from("workspaces").update({ watermark: data }).eq("id", workspaceId);
    if (error) throw error;
    return { ok: true };
  });