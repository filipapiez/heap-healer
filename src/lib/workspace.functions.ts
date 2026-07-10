import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

function slugify(s: string) {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "workspace";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Returns every workspace the current user belongs to, plus which one is
 * currently "active" (from profiles.current_workspace_id).
 * If the user has no workspaces yet, creates a default one and returns it.
 */
export const listWorkspaces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;

    // Load profile (pointer to current workspace)
    const { data: profile } = await supabase.from("profiles").select("current_workspace_id, display_name").eq("id", userId).maybeSingle();

    // Load memberships (RLS scopes to this user's rows via workspaces policies)
    const { data: memberships, error } = await supabase
      .from("workspace_members")
      .select("role, workspace:workspaces(id, name, slug, created_at)")
      .eq("user_id", userId);
    if (error) throw error;

    let rows = (memberships ?? [])
      .filter((m) => m.workspace)
      .map((m) => ({
        id: (m.workspace as { id: string }).id,
        name: (m.workspace as { name: string }).name,
        slug: (m.workspace as { slug: string }).slug,
        role: m.role as "owner" | "admin" | "member",
      }));

    // First-run: create a default workspace so the app is usable immediately.
    if (rows.length === 0) {
      const defaultName = (profile?.display_name || (claims.email as string | undefined)?.split("@")[0] || "My") + "'s workspace";
      const slug = slugify(defaultName);
      const { data: ws, error: wsErr } = await supabase
        .from("workspaces").insert({ name: defaultName, slug, created_by: userId })
        .select("id, name, slug").single();
      if (wsErr) throw wsErr;
      const { error: memErr } = await supabase
        .from("workspace_members").insert({ workspace_id: ws.id, user_id: userId, role: "owner" });
      if (memErr) throw memErr;
      await supabase.from("profiles").update({ current_workspace_id: ws.id }).eq("id", userId);
      rows = [{ id: ws.id, name: ws.name, slug: ws.slug, role: "owner" }];
    }

    let activeId = profile?.current_workspace_id ?? null;
    if (!activeId || !rows.some((r) => r.id === activeId)) {
      activeId = rows[0].id;
      await supabase.from("profiles").update({ current_workspace_id: activeId }).eq("id", userId);
    }

    return {
      workspaces: rows.map((r) => ({ ...r, active: r.id === activeId })),
      activeId,
    };
  });

export const setActiveWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspaceId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Verify membership before switching (RLS also enforces, but return a clean error)
    const { data: mem } = await supabase.from("workspace_members")
      .select("id").eq("workspace_id", data.workspaceId).eq("user_id", userId).maybeSingle();
    if (!mem) throw new Error("You are not a member of that workspace");
    const { error } = await supabase.from("profiles").update({ current_workspace_id: data.workspaceId }).eq("id", userId);
    if (error) throw error;
    return { ok: true };
  });

export const createWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ name: z.string().trim().min(1).max(60) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const slug = slugify(data.name);
    const { data: ws, error } = await supabase
      .from("workspaces").insert({ name: data.name, slug, created_by: userId })
      .select("id, name, slug").single();
    if (error) throw error;
    const { error: memErr } = await supabase
      .from("workspace_members").insert({ workspace_id: ws.id, user_id: userId, role: "owner" });
    if (memErr) throw memErr;
    await supabase.from("profiles").update({ current_workspace_id: ws.id }).eq("id", userId);
    return { workspace: { ...ws, role: "owner" as const } };
  });

/**
 * Returns current workspace + role. Central helper for every dashboard page.
 * Throws if the user has no workspace (shouldn't happen; listWorkspaces creates one).
 */
export const getCurrentWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles")
      .select("current_workspace_id, display_name, email, avatar_url").eq("id", userId).maybeSingle();
    if (!profile?.current_workspace_id) return null;
    const { data: ws } = await supabase.from("workspaces")
      .select("id, name, slug").eq("id", profile.current_workspace_id).maybeSingle();
    if (!ws) return null;
    const { data: mem } = await supabase.from("workspace_members")
      .select("role").eq("workspace_id", ws.id).eq("user_id", userId).maybeSingle();
    return {
      workspace: ws,
      role: (mem?.role ?? "member") as "owner" | "admin" | "member",
      user: {
        id: userId,
        email: profile.email,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
      },
    };
  });