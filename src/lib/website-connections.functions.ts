import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function activeWorkspace(context: {
  supabase: import("@supabase/supabase-js").SupabaseClient;
  userId: string;
}) {
  const { data, error } = await context.supabase
    .from("profiles")
    .select("current_workspace_id")
    .eq("id", context.userId)
    .maybeSingle();
  if (error) throw error;
  if (!data?.current_workspace_id) throw new Error("No active workspace");
  return data.current_workspace_id as string;
}

export const getWebsiteConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: client, error: clientError } = await supabaseAdmin
      .from("seo_clients" as never)
      .select("id,website")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (clientError) throw clientError;
    const clientRow = client as unknown as { id: string; website: string } | null;
    const [gscResult, githubResult] = await Promise.all([
      clientRow
        ? supabaseAdmin
            .from("seo_gsc_connections" as never)
            .select("property_url,last_synced_at,last_error,active")
            .eq("client_id", clientRow.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      supabaseAdmin
        .from("github_app_installations" as never)
        .select("installation_id,account_login,updated_at")
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
    ]);
    if (gscResult.error) throw gscResult.error;
    if (githubResult.error) throw githubResult.error;
    const gsc = gscResult.data;
    const github = githubResult.data;
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
    const { data: delivery, error: deliveryError } = await supabaseAdmin
      .from("website_connections" as never)
      .select("id,platform,external_id,display_name,status,last_tested_at,last_error,metadata")
      .eq("workspace_id", workspaceId)
      .neq("status", "disconnected");
    if (deliveryError) throw deliveryError;
    const deliveryRows =
      (delivery as unknown as Array<{ platform: string; external_id: string }> | null) ?? [];
    const hasGithubDelivery = deliveryRows.some((row) => row.platform === "github");
    if (githubRow && repositories.length === 1 && !hasGithubDelivery) {
      const repo = repositories[0];
      const { data: inserted, error: autoErr } = await supabaseAdmin
        .from("website_connections" as never)
        .upsert(
          {
            workspace_id: workspaceId,
            platform: "github",
            external_id: repo.full_name,
            display_name: repo.full_name,
            metadata: { installation_id: githubRow.installation_id },
            status: "connected",
            last_tested_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as never,
          { onConflict: "workspace_id,platform,external_id" },
        )
        .select("id,platform,external_id,display_name,status,last_tested_at,last_error,metadata")
        .maybeSingle();
      if (autoErr) {
        console.error("[github-app] auto-select repository failed", autoErr);
      } else if (inserted) {
        deliveryRows.push(inserted as never);
      }
    }
    const githubConfigured = Boolean(
      process.env.GITHUB_APP_SLUG &&
      process.env.GITHUB_APP_ID &&
      process.env.GITHUB_APP_PRIVATE_KEY,
    );
    return {
      gsc: gsc ?? null,
      github: githubRow,
      githubConfigured,
      repositories,
      delivery: deliveryRows,
    };
  });

export const startGscConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ origin: z.string().url(), website: z.string().min(1) }).parse(input),
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
    const { data: existingClient } = await supabaseAdmin
      .from("seo_clients" as never)
      .select("id,website")
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    const existingClientRow = existingClient as unknown as {
      id: string;
      website: string;
    } | null;
    const { data: existingConnection } = existingClientRow
      ? await supabaseAdmin
          .from("seo_gsc_connections" as never)
          .select("property_url")
          .eq("client_id", existingClientRow.id)
          .maybeSingle()
      : { data: null };
    const lockedProperty = (existingConnection as unknown as { property_url?: string } | null)
      ?.property_url;
    const comparableDomain = (value: string) =>
      value
        .replace(/^sc-domain:/, "")
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/.*$/, "")
        .toLowerCase();
    if (lockedProperty && comparableDomain(lockedProperty) !== comparableDomain(data.website)) {
      throw new Error(
        `This workspace is locked to ${lockedProperty}. Create another workspace to connect a different domain.`,
      );
    }
    if (!lockedProperty) {
      try {
        new URL(data.website);
      } catch {
        throw new Error("Enter a valid website URL before connecting Search Console.");
      }
    }
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
          website: existingClientRow?.website ?? data.website,
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
    let appSlug: string;
    try {
      appSlug = requireGithubAppSlug();
    } catch {
      throw new Error(
        "GitHub publishing is not available yet. Finish the GitHub App setup in Lovable Cloud first.",
      );
    }
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
      url: `https://github.com/apps/${appSlug}/installations/new?state=${encodeURIComponent(state)}`,
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
    const { assertPublicHttpUrl } = await import("@/backlink-verification.server");
    await assertPublicHttpUrl(siteUrl);
    const response = await fetch(`${siteUrl}/wp-json/wp/v2/users/me?context=edit`, {
      redirect: "error",
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

export const selectShopifyBlog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ connectionId: z.string().uuid(), blogId: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: connection, error: lookupError } = await supabaseAdmin
      .from("website_connections" as never)
      .select("id,metadata")
      .eq("id", data.connectionId)
      .eq("workspace_id", workspaceId)
      .eq("platform", "shopify")
      .eq("status", "connected")
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!connection) throw new Error("Shopify connection not found");
    const metadata = ((connection as unknown as { metadata?: Record<string, unknown> }).metadata ??
      {}) as Record<string, unknown>;
    const blogs = Array.isArray(metadata.blogs)
      ? (metadata.blogs as Array<{ id?: number; title?: string; handle?: string }>)
      : [];
    const blog = blogs.find((item) => String(item.id ?? "") === data.blogId);
    if (!blog?.id || !blog.handle) throw new Error("That Shopify blog is unavailable");
    const { error } = await supabaseAdmin
      .from("website_connections" as never)
      .update({
        metadata: { ...metadata, blog_id: blog.id, blog_handle: blog.handle },
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", data.connectionId)
      .eq("workspace_id", workspaceId);
    if (error) throw error;
    return { ok: true };
  });

export const disconnectWebsiteConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .discriminatedUnion("provider", [
        z.object({ provider: z.literal("gsc") }),
        z.object({ provider: z.literal("github") }),
        z.object({ provider: z.literal("delivery"), connectionId: z.string().uuid() }),
      ])
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.provider === "gsc") {
      const { data: client, error: clientError } = await supabaseAdmin
        .from("seo_clients" as never)
        .select("id")
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      if (clientError) throw clientError;
      if (client) {
        const { error } = await supabaseAdmin
          .from("seo_gsc_connections" as never)
          .delete()
          .eq("client_id", (client as { id: string }).id);
        if (error) throw error;
      }
      return { ok: true, warning: null as string | null };
    }

    if (data.provider === "github") {
      const { data: installation, error: installationError } = await supabaseAdmin
        .from("github_app_installations" as never)
        .select("installation_id")
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      if (installationError) throw installationError;
      let warning: string | null = null;
      if (installation) {
        const { deleteInstallation } = await import("@/lib/github-app.server");
        try {
          await deleteInstallation(
            Number((installation as { installation_id: number }).installation_id),
          );
        } catch (error) {
          warning = `Local GitHub access was removed, but GitHub could not confirm the uninstall: ${error instanceof Error ? error.message : String(error)}. Remove the app from GitHub settings too.`;
        }
      }
      const [{ error: connectionError }, { error: deleteError }] = await Promise.all([
        supabaseAdmin
          .from("website_connections" as never)
          .update({
            status: "disconnected",
            encrypted_credentials: null,
            metadata: {},
            updated_at: new Date().toISOString(),
          } as never)
          .eq("workspace_id", workspaceId)
          .eq("platform", "github"),
        supabaseAdmin
          .from("github_app_installations" as never)
          .delete()
          .eq("workspace_id", workspaceId),
      ]);
      if (connectionError) throw connectionError;
      if (deleteError) throw deleteError;
      return { ok: true, warning };
    }

    const { data: connection, error: connectionLookupError } = await supabaseAdmin
      .from("website_connections" as never)
      .select("id")
      .eq("id", data.connectionId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (connectionLookupError) throw connectionLookupError;
    if (!connection) throw new Error("Website connection not found");
    const { error } = await supabaseAdmin
      .from("website_connections" as never)
      .update({
        status: "disconnected",
        encrypted_credentials: null,
        metadata: {},
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", data.connectionId)
      .eq("workspace_id", workspaceId);
    if (error) throw error;
    return { ok: true, warning: null as string | null };
  });

export const listWebsitePublishJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("website_publish_jobs" as never)
      .select(
        "id,title,slug,publish_mode,status,external_url,error_message,created_at,processed_at,connection:website_connections(id,platform,display_name,external_id)",
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw error;
    return { jobs: data ?? [] };
  });

export const queueWebsitePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        connectionId: z.string().uuid(),
        title: z.string().min(1).max(200),
        slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        html: z.string().min(1).max(2_000_000),
        excerpt: z.string().max(1_000).optional(),
        keyword: z.string().max(200).optional(),
        publishMode: z.enum(["draft", "publish", "pull_request"]).default("draft"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: connection, error: connectionError } = await supabaseAdmin
      .from("website_connections" as never)
      .select("id,platform")
      .eq("id", data.connectionId)
      .eq("workspace_id", workspaceId)
      .eq("status", "connected")
      .maybeSingle();
    if (connectionError) throw connectionError;
    if (!connection) throw new Error("Website connection is unavailable");
    const platform = (connection as unknown as { platform: string }).platform;
    if (platform === "github" && data.publishMode !== "pull_request") {
      throw new Error("GitHub delivery must use pull-request mode");
    }
    if (platform !== "github" && data.publishMode === "pull_request") {
      throw new Error("Pull-request mode is only available for GitHub repositories");
    }
    const { data: job, error } = await supabaseAdmin
      .from("website_publish_jobs" as never)
      .insert({
        workspace_id: workspaceId,
        connection_id: data.connectionId,
        title: data.title,
        slug: data.slug,
        html: data.html,
        excerpt: data.excerpt ?? null,
        metadata: data.keyword ? { keyword: data.keyword } : {},
        publish_mode: data.publishMode,
        status: "queued",
      } as never)
      .select("id")
      .single();
    if (error) throw error;
    const id = (job as unknown as { id: string }).id;
    const { processWebsitePublishJobs } = await import("@/lib/website-publish.server");
    await processWebsitePublishJobs({ jobId: id });
    const { data: completed, error: completedError } = await supabaseAdmin
      .from("website_publish_jobs" as never)
      .select("status,error_message,external_url")
      .eq("id", id)
      .single();
    if (completedError) throw completedError;
    return {
      id,
      ...(completed as unknown as {
        status: string;
        error_message: string | null;
        external_url: string | null;
      }),
    };
  });

export const retryWebsitePublishJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ jobId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const workspaceId = await activeWorkspace(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reset, error: resetError } = await supabaseAdmin
      .from("website_publish_jobs" as never)
      .update({
        status: "queued",
        error_message: null,
        processed_at: null,
      } as never)
      .eq("id", data.jobId)
      .eq("workspace_id", workspaceId)
      .eq("status", "failed")
      .select("id")
      .maybeSingle();
    if (resetError) throw resetError;
    if (!reset) throw new Error("Only failed delivery jobs can be retried");
    const { processWebsitePublishJobs } = await import("@/lib/website-publish.server");
    await processWebsitePublishJobs({ jobId: data.jobId });
    const { data: completed, error: completedError } = await supabaseAdmin
      .from("website_publish_jobs" as never)
      .select("status,error_message,external_url")
      .eq("id", data.jobId)
      .eq("workspace_id", workspaceId)
      .single();
    if (completedError) throw completedError;
    return completed as unknown as {
      status: string;
      error_message: string | null;
      external_url: string | null;
    };
  });
