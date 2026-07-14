import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getEngagementStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles")
      .select("current_workspace_id").eq("id", userId).maybeSingle();
    const workspaceId = profile?.current_workspace_id;
    if (!workspaceId) {
      return { workspaceId: null, totals: { scheduled: 0, publishing: 0, published: 0, failed: 0, accounts: 0 }, byPlatform: [] as { platform: string; published: number; failed: number }[] };
    }

    const [posts, targets, accounts] = await Promise.all([
      supabase.from("posts").select("status").eq("workspace_id", workspaceId),
      supabase.from("post_targets")
        .select("platform, status, post:posts!inner(workspace_id)")
        .eq("post.workspace_id", workspaceId),
      supabase.from("connected_accounts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId).eq("status", "connected"),
    ]);

    const totals = { scheduled: 0, publishing: 0, published: 0, failed: 0, accounts: accounts.count ?? 0 };
    for (const p of posts.data ?? []) {
      if (p.status === "scheduled") totals.scheduled++;
      else if (p.status === "publishing") totals.publishing++;
      else if (p.status === "published" || p.status === "partial") totals.published++;
      else if (p.status === "failed") totals.failed++;
    }

    const byPlatformMap = new Map<string, { platform: string; published: number; failed: number }>();
    for (const t of targets.data ?? []) {
      const row = byPlatformMap.get(t.platform) ?? { platform: t.platform, published: 0, failed: 0 };
      if (t.status === "published") row.published++;
      else if (t.status === "failed") row.failed++;
      byPlatformMap.set(t.platform, row);
    }

    return {
      workspaceId,
      totals,
      byPlatform: Array.from(byPlatformMap.values()).sort((a, b) => b.published - a.published),
    };
  });

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles")
      .select("current_workspace_id").eq("id", userId).maybeSingle();
    const workspaceId = profile?.current_workspace_id;

    let accountsByPlatform: { platform: string; count: number }[] = [];
    let scheduledCount = 0;
    if (workspaceId) {
      const { data: accts } = await supabase.from("connected_accounts")
        .select("platform, status").eq("workspace_id", workspaceId).eq("status", "connected");
      const map = new Map<string, number>();
      for (const a of accts ?? []) map.set(a.platform, (map.get(a.platform) ?? 0) + 1);
      accountsByPlatform = Array.from(map.entries()).map(([platform, count]) => ({ platform, count }));

      const { count } = await supabase.from("posts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId).eq("status", "scheduled");
      scheduledCount = count ?? 0;
    }

    return {
      workspaceId,
      accountsByPlatform,
      scheduledCount,
    };
  });