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
  connection_id: string;
  title: string;
  slug: string;
  html: string;
  excerpt: string | null;
  publish_mode: string;
  metadata: Record<string, unknown>;
};

async function wordpress(connection: Connection, job: Job) {
  const credentials = await decryptCredentials<{ username: string; applicationPassword: string }>(
    connection.encrypted_credentials!,
  );
  const response = await fetch(`${connection.external_id.replace(/\/$/, "")}/wp-json/wp/v2/posts`, {
    method: "POST",
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
  const post = (await response.json()) as { id: number; link: string };
  return { id: String(post.id), url: post.link };
}

async function shopify(connection: Connection, job: Job) {
  const credentials = await decryptCredentials<{ accessToken: string }>(
    connection.encrypted_credentials!,
  );
  const blogId = String(connection.metadata.blog_id ?? "");
  if (!blogId) throw new Error("Choose a Shopify blog before publishing");
  const response = await fetch(
    `https://${connection.external_id}/admin/api/2025-07/blogs/${blogId}/articles.json`,
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
  const { article } = (await response.json()) as { article: { id: number; handle: string } };
  return {
    id: String(article.id),
    url: `https://${connection.external_id}/blogs/${blogId}/${article.handle}`,
  };
}

async function github(connection: Connection, job: Job) {
  const installationId = Number(connection.metadata.installation_id);
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

export async function processWebsitePublishJobs() {
  const { data } = await supabaseAdmin
    .from("website_publish_jobs" as never)
    .select("*")
    .eq("status", "queued")
    .order("created_at")
    .limit(10);
  let processed = 0;
  for (const raw of data ?? []) {
    const job = raw as unknown as Job;
    const { data: claimed } = await supabaseAdmin
      .from("website_publish_jobs" as never)
      .update({ status: "processing" } as never)
      .eq("id", job.id)
      .eq("status", "queued")
      .select("id")
      .maybeSingle();
    if (!claimed) continue;
    processed++;
    try {
      const { data: row } = await supabaseAdmin
        .from("website_connections" as never)
        .select("*")
        .eq("id", job.connection_id)
        .eq("status", "connected")
        .single();
      const connection = row as unknown as Connection;
      const result =
        connection.platform === "wordpress"
          ? await wordpress(connection, job)
          : connection.platform === "shopify"
            ? await shopify(connection, job)
            : await github(connection, job);
      await supabaseAdmin
        .from("website_publish_jobs" as never)
        .update({
          status: "published",
          external_id: result.id,
          external_url: result.url,
          processed_at: new Date().toISOString(),
          error_message: null,
        } as never)
        .eq("id", job.id);
    } catch (error) {
      await supabaseAdmin
        .from("website_publish_jobs" as never)
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
          processed_at: new Date().toISOString(),
        } as never)
        .eq("id", job.id);
    }
  }
  return processed;
}
