// Server-side auto-submission for directories that accept form/API POSTs.
// Realistic scope: most directories require captcha/human verification, so
// only a subset actually go through. Rest fall to the manual queue.

export type DirectorySubmissionProfile = {
  product_name?: string | null;
  tagline?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  category?: string | null;
  contact_email?: string | null;
  pricing_model?: string | null;
  founder_name?: string | null;
};

export type AutoSubmitDirectory = {
  slug: string;
  name: string;
  submit_url: string;
  submission_method: string;
  auto_submit_config: Record<string, unknown> | null;
};

export type SubmitResult =
  | { ok: true; live_url?: string | null; note?: string }
  | { ok: false; error: string; needs_manual: boolean };

const REQUIRED_FIELDS: (keyof DirectorySubmissionProfile)[] = [
  "product_name",
  "tagline",
  "short_description",
  "website_url",
  "contact_email",
];

function missingProfile(p: DirectorySubmissionProfile | null): string | null {
  if (!p)
    return "Fill your submission profile first (product name, tagline, description, website, email).";
  const missing = REQUIRED_FIELDS.filter((f) => !p[f] || String(p[f]).trim() === "");
  return missing.length ? `Missing profile fields: ${missing.join(", ")}` : null;
}

// Real form auto-submit rarely works — most directories use captcha, CSRF tokens,
// or human review. We only attempt when auto_submit_config explicitly whitelists
// the endpoint; otherwise we short-circuit to pending_action.
export async function attemptAutoSubmit(
  directory: AutoSubmitDirectory,
  profile: DirectorySubmissionProfile | null,
): Promise<SubmitResult> {
  const gap = missingProfile(profile);
  if (gap) return { ok: false, error: gap, needs_manual: true };

  if (!directory.auto_submit_config) {
    return {
      ok: false,
      error: "No auto-submit config — manual submission required.",
      needs_manual: true,
    };
  }

  const cfg = directory.auto_submit_config as {
    method?: string;
    endpoint?: string;
    fields?: Record<string, string>;
    content_type?: string;
  };
  if (!cfg.endpoint) {
    return { ok: false, error: "Missing endpoint in auto_submit_config.", needs_manual: true };
  }

  const fieldMap = cfg.fields ?? {};
  const body: Record<string, string> = {};
  for (const [remote, local] of Object.entries(fieldMap)) {
    const val = (profile as Record<string, unknown>)[local];
    if (val != null) body[remote] = String(val);
  }

  const contentType = cfg.content_type ?? "application/x-www-form-urlencoded";
  const init: RequestInit = {
    method: cfg.method ?? "POST",
    headers: {
      "Content-Type": contentType,
      "User-Agent": "MentionMyApp/1.0 (+https://mentionmyapp.com)",
    },
    body:
      contentType === "application/json"
        ? JSON.stringify(body)
        : new URLSearchParams(body).toString(),
  };

  try {
    const res = await fetch(cfg.endpoint, init);
    const text = (await res.text()).slice(0, 500);
    if (res.status >= 200 && res.status < 400) {
      return { ok: true, note: `Auto-submitted (HTTP ${res.status})` };
    }
    return {
      ok: false,
      error: `Auto-submit rejected (HTTP ${res.status}): ${text}`,
      needs_manual: true,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Auto-submit network error: ${msg}`, needs_manual: true };
  }
}

type QueueDirectory = AutoSubmitDirectory & {
  id: string;
  tier: number;
  domain_authority: number | null;
};

type QueueRunResult = {
  ok: true;
  skipped?: "ran recently";
  workspacesProcessed?: number;
  submissionsQueued?: number;
  submissionsAuto?: number;
  errors?: number;
};

/** Queue the next directory batch for every workspace. The database run row
 * makes this idempotent when multiple schedulers overlap. */
export async function queueWeeklyDirectories(): Promise<QueueRunResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: lastRun, error: lastRunError } = await supabaseAdmin
    .from("directory_queue_runs")
    .select("ran_at")
    .order("ran_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastRunError) throw lastRunError;
  if (lastRun) {
    const ageMs = Date.now() - new Date(lastRun.ran_at).getTime();
    if (ageMs < 20 * 60 * 60 * 1000) return { ok: true, skipped: "ran recently" };
  }

  const runStart = new Date().toISOString();
  const perRun = 15;
  const errors: Array<{ workspace: string; directory?: string; error: string }> = [];
  let workspacesProcessed = 0;
  let submissionsQueued = 0;
  let submissionsAuto = 0;

  const [
    { data: directoryRows, error: directoriesError },
    { data: workspaceRows, error: workspacesError },
  ] = await Promise.all([
    supabaseAdmin
      .from("directories")
      .select("id,slug,name,submit_url,submission_method,auto_submit_config,tier,domain_authority")
      .eq("active", true)
      .order("tier", { ascending: true })
      .order("domain_authority", { ascending: false, nullsFirst: false }),
    supabaseAdmin.from("workspaces").select("id"),
  ]);
  if (directoriesError) throw directoriesError;
  if (workspacesError) throw workspacesError;

  const directories = (directoryRows ?? []) as unknown as QueueDirectory[];
  const workspaces = (workspaceRows ?? []) as Array<{ id: string }>;

  for (const workspace of workspaces) {
    try {
      workspacesProcessed += 1;
      const { data: existing, error: existingError } = await supabaseAdmin
        .from("directory_submissions")
        .select("directory_id")
        .eq("workspace_id", workspace.id);
      if (existingError) throw existingError;
      const usedDirectoryIds = new Set((existing ?? []).map((row) => row.directory_id));
      const pool = directories
        .filter((directory) => !usedDirectoryIds.has(directory.id))
        .slice(0, perRun);
      if (!pool.length) continue;

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("workspace_directory_profile")
        .select("*")
        .eq("workspace_id", workspace.id)
        .maybeSingle();
      if (profileError) throw profileError;

      for (const directory of pool) {
        let status = "pending_action";
        let autoResult: SubmitResult | null = null;
        let notes: string | null = null;
        let submittedAt: string | null = null;

        if (
          (directory.submission_method === "api" || directory.submission_method === "form") &&
          directory.auto_submit_config
        ) {
          autoResult = await attemptAutoSubmit(directory, profile);
          if (autoResult.ok) {
            status = "auto_submitted";
            submissionsAuto += 1;
            submittedAt = new Date().toISOString();
            notes = autoResult.note ?? null;
          } else {
            notes = autoResult.error;
          }
        }

        const { error: insertError } = await supabaseAdmin.from("directory_submissions").insert({
          workspace_id: workspace.id,
          directory_id: directory.id,
          status,
          scheduled_for: new Date().toISOString().slice(0, 10),
          auto_result: autoResult,
          notes,
          submitted_at: submittedAt,
        });
        if (insertError) {
          errors.push({
            workspace: workspace.id,
            directory: directory.slug,
            error: insertError.message,
          });
        } else {
          submissionsQueued += 1;
        }
      }
    } catch (error) {
      errors.push({
        workspace: workspace.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const { error: runError } = await supabaseAdmin.from("directory_queue_runs").insert({
    ran_at: runStart,
    workspaces_processed: workspacesProcessed,
    submissions_queued: submissionsQueued,
    submissions_auto: submissionsAuto,
    errors: errors.length ? errors : null,
  });
  if (runError) throw runError;

  return {
    ok: true,
    workspacesProcessed,
    submissionsQueued,
    submissionsAuto,
    errors: errors.length,
  };
}
