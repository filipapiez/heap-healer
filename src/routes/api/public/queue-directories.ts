import { createFileRoute } from "@tanstack/react-router";

// Weekly cron endpoint. pg_cron POSTs here every Monday with the CRON_SECRET.
// For each workspace, picks the next 15 unsubmitted directories (top tier + DA)
// and inserts them as queued rows. Attempts auto-submit for directories with a
// whitelisted config; others land in the manual queue.

export const Route = createFileRoute("/api/public/queue-directories")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { attemptAutoSubmit } = await import("@/lib/directory-submit.server");

        const runStart = new Date().toISOString();
        const perRun = 15;
        const errors: unknown[] = [];
        let workspacesProcessed = 0;
        let submissionsQueued = 0;
        let submissionsAuto = 0;

        // All directories, ranked: tier asc (1 best), then DA desc.
        const { data: dirs } = await supabaseAdmin
          .from("directories")
          .select("id, slug, name, submit_url, submission_method, auto_submit_config, tier, domain_authority")
          .eq("active", true)
          .order("tier", { ascending: true })
          .order("domain_authority", { ascending: false, nullsFirst: false });

        // All workspaces.
        const { data: workspaces } = await supabaseAdmin.from("workspaces").select("id");

        for (const ws of workspaces ?? []) {
          try {
            workspacesProcessed += 1;

            const { data: existing } = await supabaseAdmin
              .from("directory_submissions")
              .select("directory_id")
              .eq("workspace_id", ws.id);
            const done = new Set((existing ?? []).map((r: any) => r.directory_id));

            const pool = (dirs ?? []).filter((d) => !done.has(d.id)).slice(0, perRun);
            if (pool.length === 0) continue;

            const { data: profile } = await supabaseAdmin
              .from("workspace_directory_profile")
              .select("*")
              .eq("workspace_id", ws.id)
              .maybeSingle();

            for (const d of pool) {
              let status = "queued";
              let auto_result: unknown = null;
              let notes: string | null = null;
              let submitted_at: string | null = null;

              if (
                (d.submission_method === "api" || d.submission_method === "form") &&
                d.auto_submit_config
              ) {
                const result = await attemptAutoSubmit(d as any, profile as any);
                auto_result = result;
                if (result.ok) {
                  status = "auto_submitted";
                  submissionsAuto += 1;
                  submitted_at = new Date().toISOString();
                  notes = (result as any).note ?? null;
                } else {
                  status = "pending_action";
                  notes = (result as any).error ?? null;
                }
              } else {
                status = "pending_action";
              }

              const { error: insErr } = await supabaseAdmin
                .from("directory_submissions")
                .insert({
                  workspace_id: ws.id,
                  directory_id: d.id,
                  status,
                  scheduled_for: new Date().toISOString().slice(0, 10),
                  auto_result,
                  notes,
                  submitted_at,
                });
              if (insErr) {
                errors.push({ workspace: ws.id, directory: d.slug, error: insErr.message });
              } else {
                submissionsQueued += 1;
              }
            }
          } catch (err) {
            errors.push({ workspace: ws.id, error: err instanceof Error ? err.message : String(err) });
          }
        }

        await supabaseAdmin.from("directory_queue_runs").insert({
          ran_at: runStart,
          workspaces_processed: workspacesProcessed,
          submissions_queued: submissionsQueued,
          submissions_auto: submissionsAuto,
          errors: errors.length ? errors : null,
        });

        return Response.json({
          ok: true,
          workspacesProcessed,
          submissionsQueued,
          submissionsAuto,
          errors: errors.length,
        });
      },
    },
  },
});
