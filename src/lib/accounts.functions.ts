import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PlatformSchema = z.enum([
  "youtube","x","instagram","facebook","pinterest",
  "linkedin","tiktok","threads","bluesky","reddit","google_business",
]);

/** Returns all connected accounts for the active workspace. */
export const listAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles")
      .select("current_workspace_id").eq("id", userId).maybeSingle();
    const workspaceId = profile?.current_workspace_id;
    if (!workspaceId) return { workspaceId: null, accounts: [] as const };
    const { data, error } = await supabase.from("connected_accounts")
      .select("id, platform, handle, display_name, avatar_url, status, error_message, last_synced_at, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { workspaceId, accounts: data ?? [] };
  });

/**
 * Kick off connect flow: asks Zernio for a hosted auth URL, records a pending
 * account row, and returns the URL for the browser to open.
 */
export const startConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    platform: PlatformSchema,
    origin: z.string().url(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles")
      .select("current_workspace_id").eq("id", userId).maybeSingle();
    const workspaceId = profile?.current_workspace_id;
    if (!workspaceId) throw new Error("No active workspace");

    const role = await supabase.from("workspace_members")
      .select("role").eq("workspace_id", workspaceId).eq("user_id", userId).maybeSingle();
    if (!role.data || (role.data.role !== "owner" && role.data.role !== "admin")) {
      throw new Error("Only workspace owners and admins can connect accounts");
    }

    const { createConnectLink } = await import("./zernio.server");
    const link = await createConnectLink({
      platform: data.platform,
      workspaceId,
      userId,
      redirectUri: `${data.origin}/accounts`,
      webhookUrl: `${data.origin}/api/public/zernio`,
    });
    return { url: link.url };
  });

export const disconnectAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ accountId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase.from("connected_accounts")
      .select("id, zernio_account_id").eq("id", data.accountId).maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Account not found");
    if (row.zernio_account_id) {
      try {
        const { disconnectZernioAccount } = await import("./zernio.server");
        await disconnectZernioAccount(row.zernio_account_id);
      } catch (e) {
        console.warn("[accounts] Zernio disconnect failed; removing locally", e);
      }
    }
    const { error: delErr } = await supabase.from("connected_accounts")
      .delete().eq("id", data.accountId);
    if (delErr) throw delErr;
    return { ok: true };
  });