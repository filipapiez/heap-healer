import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type MetricRow = {
  day: string;
  clicks: number | null;
  impressions: number | null;
  indexed_pages: number | null;
};

function emptyGrowthDashboard() {
  return {
    connected: false,
    website: null,
    baselineDate: null,
    baselineClicks: 0,
    baselineImpressions: 0,
    baselineCapturedAt: null,
    propertyUrl: null,
    lastSyncedAt: null,
    syncError: null,
    metrics: [] as MetricRow[],
    backlinksLive: 0,
    aiMentions: 0,
    workPlan: {
      audit: null,
      pages: { published: 0, indexed: 0 },
      placements: { queued: 0, live: 0 },
    },
  };
}

export const getGrowthDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error: profileError } = await context.supabase
      .from("profiles")
      .select("current_workspace_id")
      .eq("id", context.userId)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile?.current_workspace_id) return emptyGrowthDashboard();

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: client, error: clientError } = await supabaseAdmin
      .from("seo_clients" as never)
      .select("id,website,baseline_date,baseline_clicks,baseline_impressions,baseline_captured_at")
      .eq("workspace_id", profile.current_workspace_id)
      .maybeSingle();
    if (clientError) throw clientError;
    const clientRow = client as unknown as {
      id: string;
      website: string | null;
      baseline_date: string | null;
      baseline_clicks: number;
      baseline_impressions: number;
      baseline_captured_at: string | null;
    } | null;
    if (!clientRow) return emptyGrowthDashboard();

    const start = new Date();
    start.setUTCDate(start.getUTCDate() - 90);
    const [
      connectionResult,
      metricsResult,
      backlinksResult,
      mentionsResult,
      auditRunResult,
      placementsResult,
      livePlacementsResult,
      publishedPagesResult,
      indexedPagesResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("seo_gsc_connections" as never)
        .select("property_url,last_synced_at,last_error,active")
        .eq("client_id", clientRow.id)
        .maybeSingle(),
      supabaseAdmin
        .from("seo_metrics_daily" as never)
        .select("day,clicks,impressions,indexed_pages")
        .eq("client_id", clientRow.id)
        .gte("day", start.toISOString().slice(0, 10))
        .order("day", { ascending: true }),
      supabaseAdmin
        .from("seo_backlinks" as never)
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientRow.id)
        .eq("status", "live"),
      supabaseAdmin
        .from("seo_geo_checks" as never)
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientRow.id)
        .eq("mentioned", true),
      supabaseAdmin
        .from("seo_audit_runs" as never)
        .select("score,checks_passed,checks_failed,created_at")
        .eq("workspace_id", profile.current_workspace_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("directory_submissions" as never)
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", profile.current_workspace_id)
        .in("status", ["queued", "auto_submitted", "pending_action", "submitted", "live"]),
      supabaseAdmin
        .from("directory_submissions" as never)
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", profile.current_workspace_id)
        .eq("status", "live"),
      supabaseAdmin
        .from("seo_pages" as never)
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientRow.id),
      supabaseAdmin
        .from("seo_pages" as never)
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientRow.id)
        .eq("indexed", true),
    ]);
    const queryError = [
      connectionResult.error,
      metricsResult.error,
      backlinksResult.error,
      mentionsResult.error,
      auditRunResult.error,
      placementsResult.error,
      livePlacementsResult.error,
      publishedPagesResult.error,
      indexedPagesResult.error,
    ].find(Boolean);
    if (queryError) throw queryError;

    const connectionRow = connectionResult.data as unknown as {
      property_url: string;
      last_synced_at: string | null;
      last_error: string | null;
      active: boolean;
    } | null;
    const auditRow = auditRunResult.data as unknown as {
      score: number;
      checks_passed: number;
      checks_failed: number;
      created_at: string;
    } | null;

    return {
      connected: Boolean(connectionRow?.active),
      website: clientRow.website,
      baselineDate: clientRow.baseline_date,
      baselineClicks: clientRow.baseline_clicks,
      baselineImpressions: clientRow.baseline_impressions,
      baselineCapturedAt: clientRow.baseline_captured_at,
      propertyUrl: connectionRow?.property_url ?? null,
      lastSyncedAt: connectionRow?.last_synced_at ?? null,
      syncError: connectionRow?.last_error ?? null,
      metrics: (metricsResult.data ?? []) as unknown as MetricRow[],
      backlinksLive: backlinksResult.count ?? 0,
      aiMentions: mentionsResult.count ?? 0,
      workPlan: {
        audit: auditRow
          ? {
              score: Number(auditRow.score),
              passed: auditRow.checks_passed,
              failed: auditRow.checks_failed,
              ranAt: auditRow.created_at,
            }
          : null,
        pages: {
          published: publishedPagesResult.count ?? 0,
          indexed: indexedPagesResult.count ?? 0,
        },
        placements: {
          queued: placementsResult.count ?? 0,
          live: livePlacementsResult.count ?? 0,
        },
      },
    };
  });
