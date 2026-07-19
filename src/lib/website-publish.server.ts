import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { decryptCredentials } from "@/lib/credentials.server";

type Connection = {
  id: string;
  platform: string;
  external_id: string;
  encrypted_credentials: string | null;
  metadata: Record<string, unknown>;
};
type Job = {
  id: string;
  workspace_id: string;
  connection_id: string;
  title: string;
  slug: string;
  html: string;
  excerpt: string | null;
  publish_mode: string;
  metadata: Record<string, unknown>;
};
type PublishResult = { id: string; url: string };

async function wordpress(connection: Connection, job: Job): Promise<PublishResult> {
  if (!connection.encrypted_credentials) throw new Error("WordPress credentials are unavailable");
  const credentials = await decryptCredentials<{ username: string; applicationPassword: string }>(
    connection.encrypted_credentials,
  );
  const response = await fetch(`${connection.external_id.replace(/\/$/, "")}/wp-json/wp/v2/posts`, {
    method: "POST",
    redirect: "error",
    headers: {
      authorization: `Basic ${btoa(`${credentials.username}:${credentials.applicationPassword}`)}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      title: job.title,
      slug: job.slug,
      content: job.html,
      excerpt: job.excerpt,
      status: job.publish_mode === "publish" ? "publish" : "draft",
    }),
  });
  if (!response.ok) throw new Error(`WordPress publishing failed (${response.status})`);
  const post = (await response.json()) as { id?: number; link?: string };
  if (post.id == null || !post.link) throw new Error("WordPress did not return a post URL");
  return { id: String(post.id), url: post.link };
}

async function shopify(connection: Connection, job: Job): Promise<PublishResult> {
  if (!connection.encrypted_credentials) throw new Error("Shopify credentials are unavailable");
  const credentials = await decryptCredentials<{ accessToken: string }>(
    connection.encrypted_credentials,
  );
  const blogId = String(connection.metadata.blog_id ?? "");
  const blogs = Array.isArray(connection.metadata.blogs)
    ? (connection.metadata.blogs as Array<{ id?: number; handle?: string }>)
    : [];
  const blogHandle = String(
    connection.metadata.blog_handle ??
      blogs.find((blog) => String(blog.id ?? "") === blogId)?.handle ??
      "",
  );
  if (!blogId || !blogHandle) {
    throw new Error("Reconnect Shopify so MentionMyApp can identify the selected blog URL");
  }
  const response = await fetch(
    `https://${connection.external_id}/admin/api/2026-07/blogs/${blogId}/articles.json`,
    {
      method: "POST",
      headers: {
        "x-shopify-access-token": credentials.accessToken,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        article: {
          title: job.title,
          body_html: job.html,
          summary_html: job.excerpt,
          handle: job.slug,
          published: job.publish_mode === "publish",
        },
      }),
    },
  );
  if (!response.ok) throw new Error(`Shopify publishing failed (${response.status})`);
  const { article } = (await response.json()) as {
    article?: { id?: number; handle?: string };
  };
  if (article?.id == null || !article.handle) throw new Error("Shopify did not return an article");
  return {
    id: String(article.id),
    url: `https://${connection.external_id}/blogs/${blogHandle}/${article.handle}`,
  };
}

async function github(connection: Connection, job: Job): Promise<PublishResult> {
  const installationId = Number(connection.metadata.installation_id);
  if (!Number.isSafeInteger(installationId) || installationId <= 0) {
    throw new Error("GitHub installation metadata is unavailable");
  }
  const { openSeoPullRequest } = await import("@/lib/github-app.server");
  const pull = await openSeoPullRequest({
    installationId,
    repository: connection.external_id,
    title: job.title,
    slug: job.slug,
    html: job.html,
    base: connection.metadata.base_branch as string | undefined,
  });
  return { id: String(pull.number), url: pull.html_url };
}

async function publish(connection: Connection, job: Job): Promise<PublishResult> {
  if (connection.platform === "wordpress") return wordpress(connection, job);
  if (connection.platform === "shopify") return shopify(connection, job);
  if (connection.platform === "github") return github(connection, job);
  throw new Error(`Unsupported publishing platform: ${connection.platform}`);
}

async function recordPublishedPage(job: Job, connection: Connection, url: string) {
  if (job.publish_mode !== "publish" || connection.platform === "github") return;
  const { data: client, error: clientError } = await supabaseAdmin
    .from("seo_clients" as never)
    .select("id")
    .eq("workspace_id", job.workspace_id)
    .maybeSingle();
  if (clientError) throw clientError;
  const clientId = (client as unknown as { id?: string } | null)?.id;
  if (!clientId) return;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("seo_pages" as never)
    .select("id")
    .eq("client_id", clientId)
    .eq("url", url)
    .limit(1)
    .maybeSingle();
  if (existingError) throw existingError;
  const page = {
    client_id: clientId,
    url,
    keyword: typeof job.metadata.keyword === "string" ? job.metadata.keyword : null,
    indexed: false,
    published_at: new Date().toISOString(),
  };
  const result = existing
    ? await supabaseAdmin
        .from("seo_pages" as never)
        .update(page as never)
        .eq("id", (existing as unknown as { id: string }).id)
    : await supabaseAdmin.from("seo_pages" as never).insert(page as never);
  if (result.error) throw result.error;
}

export async function processWebsitePublishJobs(options: { jobId?: string } = {}) {
  let query = supabaseAdmin
    .from("website_publish_jobs" as never)
    .select("*")
    .eq("status", "queued")
    .order("created_at")
    .limit(options.jobId ? 1 : 10);
  if (options.jobId) query = query.eq("id", options.jobId);
  const { data, error: jobsError } = await query;
  if (jobsError) throw jobsError;

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  const errors: Array<{ jobId: string; message: string }> = [];
  for (const raw of data ?? []) {
    const job = raw as unknown as Job;
    const { data: claimed, error: claimError } = await supabaseAdmin
      .from("website_publish_jobs" as never)
      .update({ status: "processing" } as never)
      .eq("id", job.id)
      .eq("status", "queued")
      .select("id")
      .maybeSingle();
    if (claimError) {
      errors.push({ jobId: job.id, message: claimError.message });
      continue;
    }
    if (!claimed) continue;
    processed += 1;

    try {
      const { data: row, error: connectionError } = await supabaseAdmin
        .from("website_connections" as never)
        .select("*")
        .eq("id", job.connection_id)
        .eq("workspace_id", job.workspace_id)
        .eq("status", "connected")
        .single();
      if (connectionError) throw connectionError;
      const connection = row as unknown as Connection;
      const result = await publish(connection, job);
      const { error: updateError } = await supabaseAdmin
        .from("website_publish_jobs" as never)
        .update({
          status: "published",
          external_id: result.id,
          external_url: result.url,
          processed_at: new Date().toISOString(),
          error_message: null,
        } as never)
        .eq("id", job.id);
      if (updateError) throw updateError;
      succeeded += 1;

      try {
        await recordPublishedPage(job, connection, result.url);
      } catch (trackingError) {
        const message = `Published, but content-plan tracking failed: ${trackingError instanceof Error ? trackingError.message : String(trackingError)}`;
        errors.push({ jobId: job.id, message });
        await supabaseAdmin
          .from("website_publish_jobs" as never)
          .update({ error_message: message } as never)
          .eq("id", job.id);
      }
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ jobId: job.id, message });
      const { error: failureUpdateError } = await supabaseAdmin
        .from("website_publish_jobs" as never)
        .update({
          status: "failed",
          error_message: message,
          processed_at: new Date().toISOString(),
        } as never)
        .eq("id", job.id);
      if (failureUpdateError) {
        errors.push({ jobId: job.id, message: failureUpdateError.message });
      }
    }
  }
  return { processed, succeeded, failed, errors };
}
