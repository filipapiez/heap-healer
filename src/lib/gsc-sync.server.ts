import { supabaseAdmin } from "@/integrations/supabase/client.server";

type GscConnection = {
  client_id: string;
  property_url: string;
  refresh_token: string;
};

type SearchRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
};

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const value = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };
    const parts = [value.message, value.details, value.hint]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
      .map((part) => part.trim());
    if (parts.length) return [...new Set(parts)].join(" ");
    if (typeof value.code === "string") return `Database error (${value.code})`;
  }
  return "Search Console sync failed";
}

async function accessToken(refreshToken: string) {
  const clientId =
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID ?? process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret =
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET ?? process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    throw new Error("Missing Google Search Console OAuth environment variables");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error(`Google token refresh failed (${response.status})`);
  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Google did not return an access token");
  return json.access_token;
}

async function syncConnection(connection: GscConnection) {
  const token = await accessToken(connection.refresh_token);
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  // Search Console exposes up to 16 months of performance history. Import the
  // full window so customers can switch between meaningful reporting ranges
  // immediately after connecting instead of waiting months for daily rows.
  start.setUTCMonth(start.getUTCMonth() - 16);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  const response = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(connection.property_url)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        startDate: iso(start),
        endDate: iso(end),
        dimensions: ["date"],
        rowLimit: 25000,
        dataState: "final",
      }),
    },
  );
  if (!response.ok) throw new Error(`Search Console query failed (${response.status})`);
  const payload = (await response.json()) as { rows?: SearchRow[] };
  const { data: lastMetric } = await supabaseAdmin
    .from("seo_metrics_daily" as never)
    .select("indexed_pages")
    .eq("client_id", connection.client_id)
    .order("day", { ascending: false })
    .limit(1)
    .maybeSingle();
  const indexedPages =
    (lastMetric as { indexed_pages?: number | null } | null)?.indexed_pages ?? null;
  const rows = (payload.rows ?? []).flatMap((row) =>
    row.keys?.[0]
      ? [
          {
            client_id: connection.client_id,
            day: row.keys[0],
            clicks: Math.round(row.clicks ?? 0),
            impressions: Math.round(row.impressions ?? 0),
            indexed_pages: indexedPages,
          },
        ]
      : [],
  );
  if (rows.length) {
    const { error } = await supabaseAdmin
      .from("seo_metrics_daily" as never)
      .upsert(rows as never, { onConflict: "client_id,day" });
    if (error) throw error;
  }
  const baselineRows = rows.slice(-28);
  const baselineClicks = baselineRows.reduce((sum, row) => sum + row.clicks, 0);
  const baselineImpressions = baselineRows.reduce((sum, row) => sum + row.impressions, 0);
  const capturedAt = new Date().toISOString();
  const { error: baselineError } = await supabaseAdmin
    .from("seo_clients" as never)
    .update({
      baseline_clicks: baselineClicks,
      baseline_impressions: baselineImpressions,
      baseline_date: capturedAt.slice(0, 10),
      baseline_captured_at: capturedAt,
    } as never)
    .eq("id", connection.client_id)
    .is("baseline_captured_at", null);
  if (baselineError) throw baselineError;
  const { error: connectionError } = await supabaseAdmin
    .from("seo_gsc_connections" as never)
    .update({ last_synced_at: new Date().toISOString(), last_error: null } as never)
    .eq("client_id", connection.client_id);
  if (connectionError) throw connectionError;
  return rows.length;
}

export async function syncAllGscClients() {
  const { data, error } = await supabaseAdmin
    .from("seo_gsc_connections" as never)
    .select("client_id,property_url,refresh_token")
    .eq("active", true);
  if (error) throw error;
  const results = [];
  for (const connection of (data ?? []) as unknown as GscConnection[]) {
    try {
      results.push({
        clientId: connection.client_id,
        days: await syncConnection(connection),
        ok: true,
      });
    } catch (cause) {
      const message = errorMessage(cause);
      await supabaseAdmin
        .from("seo_gsc_connections" as never)
        .update({ last_error: message } as never)
        .eq("client_id", connection.client_id);
      results.push({ clientId: connection.client_id, days: 0, ok: false, error: message });
    }
  }
  return results;
}
