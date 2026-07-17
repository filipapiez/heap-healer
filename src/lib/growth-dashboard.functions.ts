import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type MetricRow = {
  day: string;
  clicks: number | null;
  impressions: number | null;
  indexed_pages: number | null;
};

export const getGrowthDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error: profileError } = await context.supabase
      .from("profiles")
      .select("current_workspace_id")
      .eq("id", context.userId)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile?.current_workspace_id) return { connected: false, metrics: [] };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: client, error: clientError } = await supabaseAdmin
      .from("seo_clients" as never)
      .select("id,website,baseline_date")
      .eq("workspace_id", profile.current_workspace_id)
      .maybeSingle();
    if (clientError) throw clientError;
    const clientRow = client as unknown as {
      id: string;
      website: string | null;
      baseline_date: string | null;
    } | null;
    if (!clientRow) return { connected: false, metrics: [] };

    const start = new Date();
    start.setUTCDate(start.getUTCDate() - 90);
    const [{ data: connection }, { data: metrics, error: metricsError }, backlinks, mentions] =
      await Promise.all([
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
      ]);
    if (metricsError) throw metricsError;
    const connectionRow = connection as unknown as {
      property_url: string;
      last_synced_at: string | null;
      last_error: string | null;
      active: boolean;
    } | null;

    return {
      connected: Boolean(connectionRow?.active),
      website: clientRow.website,
      baselineDate: clientRow.baseline_date,
      propertyUrl: connectionRow?.property_url ?? null,
      lastSyncedAt: connectionRow?.last_synced_at ?? null,
      syncError: connectionRow?.last_error ?? null,
      metrics: (metrics ?? []) as unknown as MetricRow[],
      backlinksLive: backlinks.count ?? 0,
      aiMentions: mentions.count ?? 0,
    };
  });
