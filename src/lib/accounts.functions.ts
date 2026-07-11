import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PlatformSchema = z.enum([
  "youtube","x","instagram","facebook","pinterest",
  "linkedin","tiktok","threads","bluesky","reddit","google_business",
]);

function slugify(s: string) {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "workspace";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Returns the user's active workspace id, creating a default one if needed. */
async function ensureActiveWorkspaceId(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  claims: { email?: unknown },
): Promise<string> {
  const { data: profile } = await supabase.from("profiles")
    .select("current_workspace_id, display_name").eq("id", userId).maybeSingle();
  if (profile?.current_workspace_id) {
    // Verify membership still exists
    const { data: mem } = await supabase.from("workspace_members")
      .select("id").eq("workspace_id", profile.current_workspace_id).eq("user_id", userId).maybeSingle();
    if (mem) return profile.current_workspace_id;
  }
  // Try any existing membership
  const { data: memberships } = await supabase.from("workspace_members")
    .select("workspace_id").eq("user_id", userId).limit(1);
  if (memberships && memberships.length > 0) {
    const wsId = memberships[0].workspace_id;
    await supabase.from("profiles").update({ current_workspace_id: wsId }).eq("id", userId);
    return wsId;
  }
  // Create default workspace
  const defaultName = (profile?.display_name || (claims.email as string | undefined)?.split("@")[0] || "My") + "'s workspace";
  const slug = slugify(defaultName);
  const { data: ws, error: wsErr } = await supabase
    .from("workspaces").insert({ name: defaultName, slug, created_by: userId })
    .select("id").single();
  if (wsErr) throw wsErr;
  const { error: memErr } = await supabase
    .from("workspace_members").insert({ workspace_id: ws.id, user_id: userId, role: "owner" });
  if (memErr) throw memErr;
  await supabase.from("profiles").update({ current_workspace_id: ws.id }).eq("id", userId);
  return ws.id;
}

/** Returns all connected accounts for the active workspace. */
export const listAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const workspaceId = await ensureActiveWorkspaceId(supabase, userId, claims);
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
    const { supabase, userId, claims } = context;
    const workspaceId = await ensureActiveWorkspaceId(supabase, userId, claims);

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