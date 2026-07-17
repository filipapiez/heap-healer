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
    const { data: delivery } = await supabaseAdmin
      .from("website_connections" as never)
      .select("id,platform,external_id,display_name,status,last_tested_at,last_error,metadata")
      .eq("workspace_id", workspaceId)
      .neq("status", "disconnected");
    return { gsc: gsc ?? null, github: githubRow, repositories, delivery: delivery ?? [] };
  });

export const startGscConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ origin: z.string().url(), website: z.string().url() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const clientId =
      process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID ?? process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId)
      throw new Error(
        "Google Search Console is not configured yet. Add the Google OAuth client ID and secret in Lovable Cloud, then publish again.",
      );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: workspace } = await context.supabase
      .from("workspaces")
      .select("name")
      .eq("id", workspaceId)
      .single();
    const { data: seoClient, error: seoClientError } = await supabaseAdmin
      .from("seo_clients" as never)
      .upsert(
      {
        workspace_id: workspaceId,
        name: workspace?.name ?? "Website",
        website: data.website,
        baseline_date: new Date().toISOString().slice(0, 10),
      } as never,
      { onConflict: "workspace_id" },
      )
      .select("id")
      .single();
    if (seoClientError) throw seoClientError;
    if (!(seoClient as unknown as { id?: string } | null)?.id)
      throw new Error("Could not create the SEO customer record for this workspace");
    const state = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    const origin = new URL(data.origin).origin;
    const { error } = await supabaseAdmin.from("oauth_states" as never).insert({
      state,
      provider: "gsc",
      workspace_id: workspaceId,
      user_id: context.userId,
      redirect_origin: origin,
    } as never);
    if (error) throw error;
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

export const connectWordpress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        siteUrl: z.string().url(),
        username: z.string().min(1),
        applicationPassword: z.string().min(8),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const siteUrl = data.siteUrl.replace(/\/$/, "");
    const response = await fetch(`${siteUrl}/wp-json/wp/v2/users/me?context=edit`, {
      headers: { authorization: `Basic ${btoa(`${data.username}:${data.applicationPassword}`)}` },
    });
    if (!response.ok)
      throw new Error(
        `WordPress rejected the connection (${response.status}). Use an Application Password, not your login password.`,
      );
    const user = (await response.json()) as { name?: string };
    const { encryptCredentials } = await import("@/lib/credentials.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const encrypted = await encryptCredentials({
      username: data.username,
      applicationPassword: data.applicationPassword,
    });
    const { error } = await supabaseAdmin.from("website_connections" as never).upsert(
      {
        workspace_id: workspaceId,
        platform: "wordpress",
        external_id: siteUrl,
        display_name: user.name ?? data.username,
        encrypted_credentials: encrypted,
        status: "connected",
        last_tested_at: new Date().toISOString(),
        last_error: null,
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "workspace_id,platform,external_id" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const startShopifyConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ origin: z.string().url(), shop: z.string().min(3) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const shop = data.shop
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop))
      throw new Error("Enter your .myshopify.com store domain");
    const apiKey = process.env.SHOPIFY_API_KEY;
    if (!apiKey) throw new Error("Shopify app is not configured");
    const origin = new URL(data.origin).origin;
    const state = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("oauth_states" as never).insert({
      state,
      provider: "shopify",
      workspace_id: workspaceId,
      user_id: context.userId,
      redirect_origin: origin,
      metadata: { shop },
    } as never);
    if (error) throw error;
    const redirectUri = `${origin}/api/public/oauth/shopify/callback`;
    return {
      url: `https://${shop}/admin/oauth/authorize?${new URLSearchParams({ client_id: apiKey, scope: "read_content,write_content", redirect_uri: redirectUri, state })}`,
    };
  });

export const selectGithubRepository = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ repository: z.string().regex(/^[^/]+\/[^/]+$/) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: installation } = await supabaseAdmin
      .from("github_app_installations" as never)
      .select("installation_id")
      .eq("workspace_id", workspaceId)
      .single();
    const installationId = Number(
      (installation as unknown as { installation_id: number }).installation_id,
    );
    const { listInstallationRepositories } = await import("@/lib/github-app.server");
    if (
      !(await listInstallationRepositories(installationId)).some(
        (repo) => repo.full_name === data.repository,
      )
    )
      throw new Error("Repository is not available to the GitHub App");
    const { error } = await supabaseAdmin.from("website_connections" as never).upsert(
      {
        workspace_id: workspaceId,
        platform: "github",
        external_id: data.repository,
        display_name: data.repository,
        metadata: { installation_id: installationId },
        status: "connected",
        last_tested_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "workspace_id,platform,external_id" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const queueWebsitePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        connectionId: z.string().uuid(),
        title: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        html: z.string().min(1),
        excerpt: z.string().optional(),
        publishMode: z.enum(["draft", "publish", "pull_request"]).default("draft"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: connection } = await supabaseAdmin
      .from("website_connections" as never)
      .select("id")
      .eq("id", data.connectionId)
      .eq("workspace_id", workspaceId)
      .eq("status", "connected")
      .maybeSingle();
    if (!connection) throw new Error("Website connection is unavailable");
    const { data: job, error } = await supabaseAdmin
      .from("website_publish_jobs" as never)
      .insert({
        workspace_id: workspaceId,
        connection_id: data.connectionId,
        title: data.title,
        slug: data.slug,
        html: data.html,
        excerpt: data.excerpt ?? null,
        publish_mode: data.publishMode,
        status: "queued",
      } as never)
      .select("id")
      .single();
    if (error) throw error;
    return { id: (job as unknown as { id: string }).id };
  });
