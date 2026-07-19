import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/oauth/github/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const state = url.searchParams.get("state");
        const installationId = Number(url.searchParams.get("installation_id"));
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const finish = (origin: string, status: "ok" | "error", message: string) => {
          const target = new URL("/accounts", origin);
          target.searchParams.set("github", status);
          target.searchParams.set("msg", message);
          return Response.redirect(target, 302);
        };
        if (!Number.isSafeInteger(installationId) || installationId <= 0)
          return finish(url.origin, "error", "missing_installation");
        if (!state) return finish(url.origin, "error", "missing_state");
        const { data, error: stateError } = await supabaseAdmin
          .from("oauth_states" as never)
          .select("state,provider,workspace_id,redirect_origin,expires_at")
          .eq("state", state)
          .maybeSingle();
        if (stateError) return finish(url.origin, "error", "state_lookup_failed");
        const row = data as unknown as {
          state: string;
          provider: string;
          workspace_id: string;
          redirect_origin: string;
          expires_at: string;
        } | null;
        if (!row) return finish(url.origin, "error", "invalid_state");
        const { error: consumeError } = await supabaseAdmin
          .from("oauth_states" as never)
          .delete()
          .eq("state", row.state);
        if (consumeError) return finish(row.redirect_origin, "error", "state_consume_failed");
        if (row.provider !== "github_app")
          return finish(row.redirect_origin, "error", "provider_mismatch");
        if (new Date(row.expires_at) < new Date())
          return finish(row.redirect_origin, "error", "state_expired");
        try {
          const { getInstallation } = await import("@/lib/github-app.server");
          const installation = await getInstallation(installationId);
          const { error } = await supabaseAdmin.from("github_app_installations" as never).upsert(
            {
              workspace_id: row.workspace_id,
              installation_id: installationId,
              account_login: installation.account?.login ?? null,
              account_type: installation.account?.type ?? null,
              updated_at: new Date().toISOString(),
            } as never,
            { onConflict: "workspace_id" },
          );
          if (error) throw error;
          return finish(row.redirect_origin, "ok", "GitHub repository access connected");
        } catch (error) {
          console.error("[github-app] callback failed", error);
          return finish(
            row.redirect_origin,
            "error",
            error instanceof Error ? error.message : "connection_failed",
          );
        }
      },
    },
  },
});
