import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function getActiveWorkspaceId(supabase: any, userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_workspace_id")
    .eq("id", userId)
    .maybeSingle();
  if (!profile?.current_workspace_id) throw new Error("No active workspace");
  return profile.current_workspace_id as string;
}

/** Seed the global directories table from the code catalog (idempotent). */
export const seedDirectories = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { SEED_DIRECTORIES } = await import("@/data/directories");
    const rows = SEED_DIRECTORIES.map((d) => ({
      slug: d.slug,
      name: d.name,
      homepage_url: d.homepage_url,
      submit_url: d.submit_url,
      category: d.category,
      tier: d.tier,
      submission_method: d.submission_method,
      auto_submit_config: d.auto_submit_config ?? null,
      domain_authority: d.domain_authority ?? null,
      notes: d.notes ?? null,
    }));
    const { error } = await supabase.from("directories").upsert(rows, { onConflict: "slug" });
    if (error) throw error;
    return { seeded: rows.length };
  });

export const getDirectoryProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    const { data } = await supabase
      .from("workspace_directory_profile")
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    return { workspaceId, profile: data ?? null };
  });

const ProfileSchema = z.object({
  product_name: z.string().max(80).nullish(),
  tagline: z.string().max(120).nullish(),
  short_description: z.string().max(280).nullish(),
  long_description: z.string().max(3000).nullish(),
  website_url: z.string().url().nullish(),
  logo_url: z.string().url().nullish().or(z.literal("")),
  category: z.string().max(80).nullish(),
  contact_email: z.string().email().nullish(),
  pricing_model: z.string().max(60).nullish(),
  twitter_handle: z.string().max(40).nullish(),
  founder_name: z.string().max(80).nullish(),
});

export const saveDirectoryProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    const clean = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
    );
    const { error } = await supabase
      .from("workspace_directory_profile")
      .upsert({ workspace_id: workspaceId, ...clean }, { onConflict: "workspace_id" });
    if (error) throw error;
    return { ok: true };
  });

/** Everything the /backlinks dashboard needs in one call. */
export const listBacklinkQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);

    const [submissionsRes, profileRes, totalRes] = await Promise.all([
      supabase
        .from("directory_submissions")
        .select("id, status, scheduled_for, submitted_at, live_url, notes, auto_result, directory:directories(id, name, slug, homepage_url, submit_url, category, tier, submission_method, domain_authority, notes)")
        .eq("workspace_id", workspaceId)
        .order("scheduled_for", { ascending: false }),
      supabase
        .from("workspace_directory_profile")
        .select("*")
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
      supabase.from("directories").select("id", { count: "exact", head: true }),
    ]);
    if (submissionsRes.error) throw submissionsRes.error;

    const submissions = (submissionsRes.data ?? []) as any[];
    const submittedDirIds = new Set(submissions.map((s) => s.directory?.id).filter(Boolean));

    const counts = submissions.reduce(
      (acc, s) => {
        acc.total += 1;
        acc[s.status] = (acc[s.status] ?? 0) + 1;
        return acc;
      },
      { total: 0 } as Record<string, number>,
    );

    const totalCatalog = totalRes.count ?? 0;
    const remaining = totalCatalog - submittedDirIds.size;

    return {
      workspaceId,
      profile: profileRes.data ?? null,
      submissions,
      counts,
      totalCatalog,
      remaining,
    };
  });

const SubmissionIdSchema = z.object({ submissionId: z.string().uuid() });

/** User clicked "Mark submitted" or "Mark live" — writes state. */
export const updateSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        submissionId: z.string().uuid(),
        status: z.enum(["queued", "submitted", "live", "rejected", "skipped", "pending_action"]),
        live_url: z.string().url().nullish().or(z.literal("")),
        notes: z.string().max(500).nullish(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "submitted" || data.status === "live") {
      patch.submitted_at = new Date().toISOString();
    }
    if (data.live_url !== undefined) patch.live_url = data.live_url || null;
    if (data.notes !== undefined) patch.notes = data.notes ?? null;
    const { error } = await supabase.from("directory_submissions").update(patch).eq("id", data.submissionId);
    if (error) throw error;
    return { ok: true };
  });

/** Trigger the auto-submit for a single queued row (user-initiated retry). */
export const triggerAutoSubmit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SubmissionIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const workspaceId = await getActiveWorkspaceId(supabase, userId);
    const { data: sub, error } = await supabase
      .from("directory_submissions")
      .select("id, workspace_id, directory:directories(*)")
      .eq("id", data.submissionId)
      .maybeSingle();
    if (error || !sub) throw new Error("Submission not found");
    if (sub.workspace_id !== workspaceId) throw new Error("Forbidden");

    const { data: profile } = await supabase
      .from("workspace_directory_profile")
      .select("*")
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    const { attemptAutoSubmit } = await import("./directory-submit.server");
    const result = await attemptAutoSubmit(sub.directory as any, profile as any);
    const patch = result.ok
      ? {
          status: "auto_submitted" as const,
          submitted_at: new Date().toISOString(),
          auto_result: result,
          notes: result.note ?? null,
        }
      : {
          status: "pending_action" as const,
          auto_result: result,
          notes: result.error,
        };
    await supabase.from("directory_submissions").update(patch).eq("id", data.submissionId);
    return result;
  });
