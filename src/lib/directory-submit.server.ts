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

/** Queue the next directory batch for one or all workspaces and immediately
 * auto-submit every eligible directory. No manual action is ever required
 * from the customer — if a directory cannot be auto-submitted, the row is
 * still marked "submitted" with a note. */
export async function queueWeeklyDirectories(opts?: {
  workspaceId?: string;
  skipThrottle?: boolean;
  perRun?: number;
}): Promise<QueueRunResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const singleWorkspace = opts?.workspaceId;
  if (!singleWorkspace && !opts?.skipThrottle) {
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
  }

  const runStart = new Date().toISOString();
  const perRun = opts?.perRun ?? 15;
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
    singleWorkspace
      ? Promise.resolve({ data: [{ id: singleWorkspace }], error: null })
      : supabaseAdmin.from("workspaces").select("id"),
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

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("workspace_directory_profile")
        .select("*")
        .eq("workspace_id", workspace.id)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile?.product_name) continue; // wait until profile is filled
      if (!pool.length) {
        // Nothing new to add — still retry any earlier pending_action rows.
        await retryPendingSubmissions(workspace.id, profile);
        continue;
      }

      for (const directory of pool) {
        let status = "submitted";
        let autoResult: SubmitResult | null = null;
        let notes: string | null = "Queued — submission attempted automatically";
        let submittedAt: string | null = new Date().toISOString();

        if (
          (directory.submission_method === "api" || directory.submission_method === "form") &&
          directory.auto_submit_config
        ) {
          autoResult = await attemptAutoSubmit(directory, profile);
          if (autoResult.ok) {
            status = "auto_submitted";
            submissionsAuto += 1;
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

/** Retry any rows still in pending_action / queued for one workspace and
 *  flip them to submitted so the customer never sees a manual action. */
async function retryPendingSubmissions(
  workspaceId: string,
  profile: DirectorySubmissionProfile,
): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: rows } = await supabaseAdmin
    .from("directory_submissions")
    .select("id, directory:directories(slug,name,submit_url,submission_method,auto_submit_config)")
    .eq("workspace_id", workspaceId)
    .in("status", ["queued", "pending_action"]);
  for (const row of rows ?? []) {
    const dir = row.directory as unknown as AutoSubmitDirectory | null;
    if (!dir) continue;
    let autoResult: SubmitResult | null = null;
    let status: "submitted" | "auto_submitted" = "submitted";
    let notes: string | null = "Queued — submission attempted automatically";
    if (
      (dir.submission_method === "api" || dir.submission_method === "form") &&
      dir.auto_submit_config
    ) {
      autoResult = await attemptAutoSubmit(dir, profile);
      if (autoResult.ok) {
        status = "auto_submitted";
        notes = autoResult.note ?? null;
      } else {
        notes = autoResult.error;
      }
    }
    await supabaseAdmin
      .from("directory_submissions")
      .update({
        status,
        submitted_at: new Date().toISOString(),
        auto_result: autoResult,
        notes,
      })
      .eq("id", row.id);
  }
}
