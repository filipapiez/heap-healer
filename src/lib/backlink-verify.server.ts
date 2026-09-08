import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeHostname } from "./semrush-sync.server";

const GATEWAY = "https://connector-gateway.lovable.dev/semrush";

type Row = { columnNames?: string[]; rows?: (string | number)[][] };

async function callSemrush(path: string, params: Record<string, string>): Promise<Row> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const semrushKey = process.env["SEMRUSH_API_KEY"];
  if (!lovableKey || !semrushKey) throw new Error("Semrush connector not configured");
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${GATEWAY}${path}?${qs}`, {
    headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": semrushKey },
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Semrush ${path} failed [${res.status}]: ${body.slice(0, 300)}`);
  const json = JSON.parse(body) as { data?: Row };
  const cols = json.data?.columnNames ?? [];
  if (cols.some((c) => c.startsWith("ERROR "))) return { columnNames: [], rows: [] };
  return json.data ?? {};
}

function toObjects(data: Row): Record<string, string>[] {
  const cols = data.columnNames ?? [];
  return (data.rows ?? []).map((row) => {
    const out: Record<string, string> = {};
    cols.forEach((c, i) => {
      out[c] = row[i] == null ? "" : String(row[i]);
    });
    return out;
  });
}

/**
 * A submission only counts as a live backlink once the directory domain actually
 * shows up in the site's referring-domain profile. This reads real referring
 * domains from Semrush and flips matching submissions to "live".
 */
export async function verifyDirectoryBacklinks() {
  const { data: clients } = await supabaseAdmin
    .from("seo_clients")
    .select("id, website, workspace_id")
    .not("workspace_id", "is", null);

  const { data: directories } = await supabaseAdmin
    .from("directories")
    .select("id, homepage_url");

  const dirByHost = new Map<string, string>();
  for (const d of directories ?? []) {
    const host = normalizeHostname(d.homepage_url);
    if (host) dirByHost.set(host, d.id);
  }

  const results: Array<{ workspace: string; refDomains: number; verified: number }> = [];

  for (const client of clients ?? []) {
    const domain = normalizeHostname(client.website);
    if (!domain || !client.workspace_id) continue;

    let refs: Record<string, string>[] = [];
    try {
      refs = toObjects(
        await callSemrush("/backlinks/backlinks_refdomains", {
          target: domain,
          target_type: "root_domain",
          export_columns: "domain,domain_ascore,backlinks_num",
          display_limit: "1000",
        }),
      );
    } catch (e) {
      console.error("[backlink-verify] semrush failed", domain, e);
      continue;
    }

    const refHosts = new Set(
      refs.map((r) => normalizeHostname(r["domain"])).filter((h): h is string => !!h),
    );

    const matchedDirIds = [...refHosts]
      .map((h) => dirByHost.get(h))
      .filter((id): id is string => !!id);

    let verified = 0;
    if (matchedDirIds.length) {
      const { data: updated } = await supabaseAdmin
        .from("directory_submissions")
        .update({ status: "live", submitted_at: new Date().toISOString() })
        .eq("workspace_id", client.workspace_id)
        .in("directory_id", matchedDirIds)
        .neq("status", "live")
        .select("id");
      verified = updated?.length ?? 0;
    }

    results.push({ workspace: client.workspace_id, refDomains: refHosts.size, verified });
  }

  return { clients: results.length, results };
}
