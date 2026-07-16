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
  start.setUTCDate(start.getUTCDate() - 31);
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
  await supabaseAdmin
    .from("seo_gsc_connections" as never)
    .update({ last_synced_at: new Date().toISOString(), last_error: null } as never)
    .eq("client_id", connection.client_id);
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
      const message = cause instanceof Error ? cause.message : String(cause);
      await supabaseAdmin
        .from("seo_gsc_connections" as never)
        .update({ last_error: message } as never)
        .eq("client_id", connection.client_id);
      results.push({ clientId: connection.client_id, days: 0, ok: false, error: message });
    }
  }
  return results;
}
