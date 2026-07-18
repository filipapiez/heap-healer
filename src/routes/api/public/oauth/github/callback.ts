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
        if (!installationId) return finish(url.origin, "error", "missing_installation");
        // GitHub's post-install "Setup URL" redirect only sends installation_id +
        // setup_action, not our `state`. Fall back to the most recent pending
        // github_app oauth_state row when state is absent.
        const query = supabaseAdmin
          .from("oauth_states" as never)
          .select("state,provider,workspace_id,redirect_origin,expires_at")
          .eq("provider", "github_app")
          .order("created_at", { ascending: false })
          .limit(1);
        const { data } = state
          ? await supabaseAdmin
              .from("oauth_states" as never)
              .select("state,provider,workspace_id,redirect_origin,expires_at")
              .eq("state", state)
              .maybeSingle()
          : await query.maybeSingle();
        const row = data as unknown as {
          state: string;
          provider: string;
          workspace_id: string;
          redirect_origin: string;
          expires_at: string;
        } | null;
        if (!row) return finish(url.origin, "error", "invalid_state");
        await supabaseAdmin
          .from("oauth_states" as never)
          .delete()
          .eq("state", row.state);
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
