import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { commitRepositoryFiles, getRepositoryMeta, readRepositoryFile } from "@/lib/github-app.server";
import { planFix } from "@/lib/seo-fix";

const MODEL = "google/gemini-3.1-pro-preview";
const BLOCKED = /(^|\/)(node_modules|\.git|\.github|dist|build)\/|(^|\/)\.env|lock|\.gen\./i;

async function ai(system: string, user: string, retry = 1): Promise<Record<string, unknown>> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (res.status === 429) throw new Error("Too many requests right now — try again in a minute");
  if (res.status === 402) throw new Error("AI credits are used up");
  if (res.status >= 500 && retry > 0) return ai(system, user, retry - 1);
  if (!res.ok) throw new Error(res.status >= 500 ? "The AI took too long — press Try again" : `AI request failed (${res.status})`);
  const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = (payload.choices?.[0]?.message?.content ?? "").replace(/^```(json)?|```$/g, "").trim();
  return JSON.parse(text);
}

type Connection = {
  id: string;
  external_id: string;
  metadata: Record<string, unknown>;
  framework: string | null;
  router_type: string | null;
  publish_path: string | null;
};

export async function getGithubConnection(workspaceId: string) {
  const { data } = await supabaseAdmin
    .from("website_connections" as never)
    .select("id,external_id,metadata,framework,router_type,publish_path")
    .eq("workspace_id", workspaceId)
    .eq("platform", "github")
    .eq("status", "connected")
    .limit(1)
    .maybeSingle();
  return data as unknown as Connection | null;
}

export async function runFix(input: { workspaceId: string; issue: string; category: string; website: string }) {
  const plan = planFix(input.issue);
  const connection = await getGithubConnection(input.workspaceId);
  const { data: job, error } = await supabaseAdmin
    .from("seo_fix_jobs" as never)
    .insert({
      workspace_id: input.workspaceId,
      connection_id: connection?.id ?? null,
      issue: input.issue,
      category: input.category,
      fix_type: plan.fixType,
      estimate_minutes: plan.minutes,
      status: plan.auto ? "fixing" : "needs_user",
      error: plan.auto ? null : plan.steps,
    } as never)
    .select("id")
    .single();
  if (error) throw error;
  const jobId = (job as unknown as { id: string }).id;
  const update = (patch: Record<string, unknown>) =>
    supabaseAdmin.from("seo_fix_jobs" as never).update(patch as never).eq("id", jobId);

  if (!plan.auto) return { status: "needs_user" as const };
  if (!connection) {
    await update({ status: "failed", error: "Connect your website's GitHub to fix this automatically" });
    return { status: "failed" as const };
  }

  try {
    const installationId = Number(connection.metadata?.installation_id);
    if (!Number.isSafeInteger(installationId) || installationId <= 0) throw new Error("GitHub connection is incomplete");
    const repo = await getRepositoryMeta(installationId, connection.external_id);
    const files = repo.files.filter((f) => !BLOCKED.test(f));
    const context = `Website: ${input.website}
Framework: ${connection.framework ?? "unknown"} (router: ${connection.router_type ?? "unknown"}, pages folder: ${connection.publish_path ?? "unknown"})
Audit problem (${input.category}): ${input.issue}`;

    const pick = await ai(
      "You are a senior web developer fixing SEO problems in a repository. Reply only with JSON.",
      `${context}\n\nRepository files:\n${files.slice(0, 600).join("\n")}\n\nChoose up to 5 existing files you must read to fix this problem correctly (layout/head files, router/route table, an example page, public/ files). Reply {"read":["path"]}.`,
    );
    const toRead = ((pick.read as string[]) ?? []).filter((p) => files.includes(p)).slice(0, 5);
    const current: Record<string, string> = {};
    for (const path of toRead) {
      const text = await readRepositoryFile(installationId, connection.external_id, path, repo.defaultBranch);
      if (text != null) current[path] = text;
    }

    const result = await ai(
      `You are a senior web developer fixing one SEO problem in a live website repository. Rules:
- Make the smallest correct change that fully fixes the problem. Keep existing code, style and behaviour intact.
- Return the COMPLETE new content of every file you change or create — never partial snippets or "..." placeholders.
- Only touch files you were shown, or create new files that follow the project's conventions (new pages must also be registered in the router if the project needs it).
- Never invent customers, reviews, ratings, prices or statistics. Use only facts visible in the code.
- Never use AggregateRating, Review or Offer structured data.
Reply {"files":[{"path":"","content":""}],"summary":"one short sentence"}. If it cannot be fixed in code, reply {"files":[],"summary":"why"}.`,
      `${context}\n\nOther files in the repository:\n${files.slice(0, 400).join("\n")}\n\n${Object.entries(current)
        .map(([p, c]) => `===== ${p} =====\n${c.slice(0, 40_000)}`)
        .join("\n\n")}`,
    );

    const edits = ((result.files as { path: string; content: string }[]) ?? []).slice(0, 6);
    if (!edits.length) throw new Error(String(result.summary || "This one can't be fixed in the code"));
    for (const edit of edits) {
      if (!edit.path || edit.path.includes("..") || edit.path.startsWith("/") || BLOCKED.test(edit.path)) {
        throw new Error(`Refused unsafe file path ${edit.path}`);
      }
      if (!edit.content?.trim() || edit.content.length > 250_000) throw new Error(`Empty or oversized change for ${edit.path}`);
      if (/\n\s*(\.\.\.|\/\/ \.\.\.|\/\* \.\.\. \*\/)\s*\n|rest of (the )?(file|code)/i.test(edit.content)) {
        throw new Error(`AI returned a partial file for ${edit.path}`);
      }
      const before = current[edit.path];
      if (before && edit.content.length < before.length * 0.5) throw new Error(`Change would delete too much of ${edit.path}`);
      if (!before && files.includes(edit.path)) throw new Error(`Refused to overwrite unread file ${edit.path}`);
    }

    const commit = await commitRepositoryFiles({
      installationId,
      repository: connection.external_id,
      message: `fix(seo): ${input.issue.slice(0, 60)}`,
      files: edits.map((e) => ({ path: e.path, content: e.content })),
    });
    const sha = (commit as { sha?: string } | undefined)?.sha ?? null;
    await update({ status: "saved", commit_sha: sha, files_changed: edits.map((e) => e.path), saved_at: new Date().toISOString(), error: null });
    return { status: "saved" as const };
  } catch (cause) {
    await update({ status: "failed", error: cause instanceof Error ? cause.message : String(cause) });
    return { status: "failed" as const };
  }
}
