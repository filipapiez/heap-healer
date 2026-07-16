import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function activeWorkspace(context: {
  supabase: import("@supabase/supabase-js").SupabaseClient;
  userId: string;
}) {
  const { data } = await context.supabase
    .from("profiles")
    .select("current_workspace_id")
    .eq("id", context.userId)
    .maybeSingle();
  if (!data?.current_workspace_id) throw new Error("No active workspace");
  return data.current_workspace_id as string;
}

export const getWebsiteConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: client } = await supabaseAdmin
      .from("seo_clients" as never)
      .select("id,website")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    const clientRow = client as unknown as { id: string; website: string } | null;
    const [{ data: gsc }, { data: github }] = await Promise.all([
      clientRow
        ? supabaseAdmin
            .from("seo_gsc_connections" as never)
            .select("property_url,last_synced_at,last_error")
            .eq("client_id", clientRow.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabaseAdmin
        .from("github_app_installations" as never)
        .select("installation_id,account_login,updated_at")
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
    ]);
    let repositories: { id: number; full_name: string; html_url: string; private: boolean }[] = [];
    const githubRow = github as unknown as {
      installation_id: number;
      account_login: string | null;
    } | null;
    if (githubRow) {
      try {
        const { listInstallationRepositories } = await import("@/lib/github-app.server");
        repositories = await listInstallationRepositories(githubRow.installation_id);
      } catch (error) {
        console.error("[github-app] repository list failed", error);
      }
    }
    return { gsc: gsc ?? null, github: githubRow, repositories };
  });

export const startGscConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ origin: z.string().url(), website: z.string().url() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: workspace } = await context.supabase
      .from("workspaces")
      .select("name")
      .eq("id", workspaceId)
      .single();
    await supabaseAdmin.from("seo_clients" as never).upsert(
      {
        workspace_id: workspaceId,
        name: workspace?.name ?? "Website",
        website: data.website,
        baseline_date: new Date().toISOString().slice(0, 10),
      } as never,
      { onConflict: "workspace_id" },
    );
    const state = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    const origin = new URL(data.origin).origin;
    const { error } = await supabaseAdmin.from("oauth_states" as never).insert({
      state,
      provider: "gsc",
      workspace_id: workspaceId,
      user_id: context.userId,
      redirect_origin: origin,
      metadata: { website: data.website },
    } as never);
    if (error) throw error;
    const clientId =
      process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID ?? process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) throw new Error("Google Search Console OAuth client is not configured");
    const redirectUri = `${origin}/api/public/oauth/gsc/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
    });
    return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` };
  });

export const startGithubInstallation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ origin: z.string().url() }).parse(input))
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { requireGithubAppSlug } = await import("@/lib/github-app.server");
    const state = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    const origin = new URL(data.origin).origin;
    const { error } = await supabaseAdmin.from("oauth_states" as never).insert({
      state,
      provider: "github_app",
      workspace_id: workspaceId,
      user_id: context.userId,
      redirect_origin: origin,
    } as never);
    if (error) throw error;
    return {
      url: `https://github.com/apps/${requireGithubAppSlug()}/installations/new?state=${encodeURIComponent(state)}`,
    };
  });
