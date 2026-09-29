import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function workspaceOf(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase
    .from("profiles")
    .select("current_workspace_id")
    .eq("id", context.userId)
    .maybeSingle();
  if (!data?.current_workspace_id) throw new Error("No active workspace");
  return data.current_workspace_id as string;
}

export const startSeoFix = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ issue: z.string().min(3).max(500), category: z.string().max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const workspaceId = await workspaceOf(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: client } = await supabaseAdmin
      .from("seo_clients" as never)
      .select("website")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    const website = (client as unknown as { website?: string } | null)?.website ?? "";
    const { runFix } = await import("@/lib/seo-fix.server");
    return runFix({ workspaceId, issue: data.issue, category: data.category, website });
  });

export const listSeoFixes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const workspaceId = await workspaceOf(context);
    const [{ data: jobs }, { data: audit }, { data: gh }] = await Promise.all([
      context.supabase
        .from("seo_fix_jobs")
        .select("id,issue,status,estimate_minutes,error,saved_at,created_at,commit_sha")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(200),
      context.supabase
        .from("seo_audit_runs")
        .select("created_at,result")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      (await import("@/integrations/supabase/client.server")).supabaseAdmin
        .from("website_connections" as never)
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("platform", "github")
        .eq("status", "connected")
        .limit(1),
    ]);
    const auditAt = audit?.created_at ? new Date(audit.created_at).getTime() : 0;
    const cats = ((audit?.result as { categories?: { bad?: string[] }[] } | null)?.categories ?? []);
    const open = new Set(cats.flatMap((c) => c.bad ?? []));
    // Latest job per issue, with truthful verification against the newest audit.
    const byIssue: Record<string, { status: string; error: string | null; estimate: number; savedAt: string | null }> = {};
    for (const j of jobs ?? []) {
      if (byIssue[j.issue]) continue;
      let status = j.status as string;
      if (status === "saved" && j.saved_at && auditAt > new Date(j.saved_at).getTime()) {
        status = open.has(j.issue) ? "didnt_take" : "verified";
      }
      byIssue[j.issue] = { status, error: j.error, estimate: j.estimate_minutes, savedAt: j.saved_at };
    }
    return { byIssue, githubConnected: ((gh as unknown[]) ?? []).length > 0 };
  });
