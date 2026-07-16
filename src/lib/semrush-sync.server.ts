import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY = "https://connector-gateway.lovable.dev/semrush";

type Client = { id: string; website: string };

// Strip protocol, www, path, query, fragment, trailing slash. Return null if the
// remaining hostname is not a valid public root domain (needs at least one dot
// and only hostname-legal characters).
export function normalizeHostname(website: string | null | undefined): string | null {
  if (!website) return null;
  let raw = website.trim().toLowerCase();
  if (!raw) return null;
  raw = raw.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  raw = raw.split("/")[0].split("?")[0].split("#")[0];
  raw = raw.replace(/^www\./, "");
  raw = raw.replace(/\.+$/, "");
  if (!raw || !/^[a-z0-9.-]+$/.test(raw)) return null;
  if (!raw.includes(".")) return null;
  return raw;
}

async function callSemrush(path: string, params: Record<string, string>) {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const semrushKey = process.env.SEMRUSH_API_KEY;
  if (!lovableKey || !semrushKey) throw new Error("Semrush connector not configured");
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GATEWAY}${path}?${qs}`, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": semrushKey,
    },
  });
  const body = await res.text();
  const preview = body.slice(0, 400);
  if (!res.ok) {
    console.error("[semrush-sync] gateway error", { endpoint: path, params, status: res.status, body: preview });
    throw new Error(`Semrush ${path} failed [${res.status}]: ${preview}`);
  }
  let json: { data?: { columnNames?: string[]; rows?: (string | number)[][] } };
  try {
    json = JSON.parse(body);
  } catch {
    console.error("[semrush-sync] non-JSON response", { endpoint: path, params, body: preview });
    throw new Error(`Semrush ${path} returned non-JSON: ${preview}`);
  }
  // Semrush wraps in-band errors in columnNames like "ERROR 50 :: NOTHING FOUND".
  const cols = json.data?.columnNames ?? [];
  const inBandError = cols.find((c) => c.startsWith("ERROR "));
  if (inBandError) {
    console.error("[semrush-sync] provider error", { endpoint: path, params, error: inBandError });
    throw new Error(`Semrush ${path} provider error: ${inBandError}`);
  }
  return json;
}

function firstRow(payload: {
  data?: { columnNames?: string[]; rows?: (string | number)[][] };
}): Record<string, string> {
  const cols = payload.data?.columnNames ?? [];
  const row = payload.data?.rows?.[0] ?? [];
  const out: Record<string, string> = {};
  cols.forEach((col, i) => {
    out[col] = row[i] == null ? "" : String(row[i]);
  });
  return out;
}

const num = (v: string | undefined) => {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

async function syncClient(client: Client) {
  const domain = normalizeHostname(client.website);
  if (!domain) throw new Error(`Invalid website hostname: ${client.website}`);
  const [overviewPayload, ranksPayload] = await Promise.all([
    callSemrush("/backlinks/backlinks_overview", {
      target: domain,
      target_type: "root_domain",
      // domains_new/domains_lost are not accepted by backlinks_overview (returns 400).
      // We derive new/lost link counts by diffing against the prior snapshot below.
      export_columns: "ascore,total,domains_num",
    }),
    callSemrush("/domains/domain_ranks", {
      domain,
      database: "us",
      export_columns: "Db,Dn,Rk,Or,Ot,Oc",
    }),
  ]);
  const overview = firstRow(overviewPayload);
  const ranks = firstRow(ranksPayload);

  const today = new Date().toISOString().slice(0, 10);

  // Diff total backlinks against most recent prior snapshot to derive new/lost link counts.
  const { data: prior } = await supabaseAdmin
    .from("seo_semrush_snapshots" as never)
    .select("total_backlinks,day")
    .eq("client_id", client.id)
    .lt("day", today)
    .order("day", { ascending: false })
    .limit(1)
    .maybeSingle();
  const priorTotal =
    (prior as { total_backlinks?: number | null } | null)?.total_backlinks ?? null;
  const totalBacklinks = num(overview.total);
  let newBacklinks: number | null = null;
  let lostBacklinks: number | null = null;
  if (priorTotal != null && totalBacklinks != null) {
    const delta = totalBacklinks - priorTotal;
    newBacklinks = delta > 0 ? delta : 0;
    lostBacklinks = delta < 0 ? -delta : 0;
  }

  const record = {
    client_id: client.id,
    day: today,
    domain,
    authority_score: num(overview.ascore),
    total_backlinks: totalBacklinks,
    referring_domains: num(overview.domains_num),
    new_backlinks: newBacklinks,
    lost_backlinks: lostBacklinks,
    // domain_ranks returns display names, not the request codes.
    organic_keywords: num(ranks["Organic Keywords"]),
    organic_traffic: num(ranks["Organic Traffic"]),
    raw: { overview, ranks },
    synced_at: new Date().toISOString(),
    sync_status: "success" as const,
    sync_error: null as string | null,
  };

  const { error } = await supabaseAdmin
    .from("seo_semrush_snapshots" as never)
    .upsert(record as never, { onConflict: "client_id,day" });
  if (error) throw error;
  return record;
}

async function recordFailure(clientId: string, domain: string, message: string) {
  const today = new Date().toISOString().slice(0, 10);
  await supabaseAdmin
    .from("seo_semrush_snapshots" as never)
    .upsert(
      {
        client_id: clientId,
        day: today,
        domain,
        synced_at: new Date().toISOString(),
        sync_status: "failed",
        sync_error: message.slice(0, 1000),
      } as never,
      { onConflict: "client_id,day" },
    );
}

export async function syncAllSemrushClients() {
  const { data, error } = await supabaseAdmin
    .from("seo_clients" as never)
    .select("id,website");
  if (error) throw error;
  const results = [];
  for (const client of (data ?? []) as unknown as Client[]) {
    const domain = normalizeHostname(client.website);
    if (!domain) {
      console.warn(`[semrush-sync] skipping client ${client.id}: no valid hostname in ${client.website}`);
      results.push({ clientId: client.id, ok: false, skipped: true, error: "Invalid website hostname" });
      continue;
    }
    try {
      const snapshot = await syncClient(client);
      results.push({ clientId: client.id, ok: true, domain: snapshot.domain });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      console.error(`[semrush-sync] client ${client.id} failed:`, message);
      try {
        await recordFailure(client.id, domain, message);
      } catch (recErr) {
        console.error(`[semrush-sync] failed to record failure for ${client.id}:`, recErr);
      }
      results.push({ clientId: client.id, ok: false, error: message });
    }
  }
  return results;
}

export async function syncSemrushClient(clientId: string) {
  const { data, error } = await supabaseAdmin
    .from("seo_clients" as never)
    .select("id,website")
    .eq("id", clientId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Client not found");
  return syncClient(data as unknown as Client);
}