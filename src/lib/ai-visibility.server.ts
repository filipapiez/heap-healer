import { supabaseAdmin } from "@/integrations/supabase/client.server";

const MODEL = "google/gemini-3.7-flash";
const ENGINE = "gemini";
const QUERIES_PER_RUN = 5;
const MIN_HOURS_BETWEEN_RUNS = 20;

type ClientRow = { id: string; name: string; website: string };

function hostOf(website: string) {
  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

async function callModel(system: string, user: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI visibility check failed (${response.status}): ${body.slice(0, 300)}`);
  }
  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return payload.choices?.[0]?.message?.content?.trim() ?? "";
}

async function buildQueries(client: ClientRow): Promise<string[]> {
  const host = hostOf(client.website);
  const { data } = await supabaseAdmin
    .from("seo_pages" as never)
    .select("keyword")
    .eq("client_id", client.id)
    .not("keyword", "is", null)
    .limit(12);
  const keywords = ((data ?? []) as unknown as { keyword: string | null }[])
    .map((row) => row.keyword)
    .filter((keyword): keyword is string => Boolean(keyword));

  const raw = await callModel(
    "You write short buyer-intent questions people type into AI assistants. Reply with one question per line, no numbering, no commentary.",
    `Website: ${host}\nCompany: ${client.name}\n${keywords.length ? `Topics the site covers: ${keywords.slice(0, 10).join(", ")}` : ""}\n\nWrite ${QUERIES_PER_RUN} realistic questions a potential customer would ask an AI assistant when looking for this kind of product or service. Do NOT name the company in the questions — they must be neutral category questions.`,
  );
  return raw
    .split("\n")
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter((line) => line.length > 8)
    .slice(0, QUERIES_PER_RUN);
}

async function runCheck(client: ClientRow, query: string) {
  const host = hostOf(client.website);
  const answer = await callModel(
    "You are a helpful assistant recommending products and services. Answer briefly and name specific brands and their websites.",
    query,
  );
  const haystack = answer.toLowerCase();
  const mentioned = haystack.includes(host.toLowerCase()) || haystack.includes(client.name.toLowerCase());
  const citedUrl = mentioned && haystack.includes(host.toLowerCase()) ? `https://${host}` : null;
  await supabaseAdmin.from("seo_geo_checks" as never).insert({
    client_id: client.id,
    engine: ENGINE,
    query,
    mentioned,
    cited_url: citedUrl,
  } as never);
  return mentioned;
}

export async function runAiVisibilityChecks() {
  const { data, error } = await supabaseAdmin
    .from("seo_clients" as never)
    .select("id,name,website")
    .limit(50);
  if (error) throw error;
  const clients = (data ?? []) as unknown as ClientRow[];
  const summary: Array<{ client: string; checks: number; mentions: number; skipped?: string }> = [];

  for (const client of clients) {
    try {
      const { data: latest } = await supabaseAdmin
        .from("seo_geo_checks" as never)
        .select("checked_at")
        .eq("client_id", client.id)
        .order("checked_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const lastAt = (latest as unknown as { checked_at: string } | null)?.checked_at;
      if (lastAt && Date.now() - new Date(lastAt).getTime() < MIN_HOURS_BETWEEN_RUNS * 3600_000) {
        summary.push({ client: client.website, checks: 0, mentions: 0, skipped: "recently checked" });
        continue;
      }

      const queries = await buildQueries(client);
      let mentions = 0;
      for (const query of queries) {
        if (await runCheck(client, query)) mentions += 1;
      }
      summary.push({ client: client.website, checks: queries.length, mentions });
    } catch (cause) {
      summary.push({
        client: client.website,
        checks: 0,
        mentions: 0,
        skipped: cause instanceof Error ? cause.message : String(cause),
      });
    }
  }

  return { clients: clients.length, results: summary };
}
