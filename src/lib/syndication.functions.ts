import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SyndicationPlatform = "devto" | "hashnode" | "medium";

export type SyndicationAccountView = {
  id: string;
  platform: SyndicationPlatform;
  handle: string | null;
  publication_id: string | null;
  status: string;
  last_error: string | null;
  last_used_at: string | null;
};

export type SyndicationPostView = {
  id: string;
  platform: string;
  title: string | null;
  external_url: string | null;
  status: string;
  error: string | null;
  created_at: string;
};

export const listSyndication = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [{ data: accounts }, { data: posts }] = await Promise.all([
      supabase
        .from("syndication_accounts")
        .select("id,platform,handle,publication_id,status,last_error,last_used_at")
        .eq("workspace_id", data.workspaceId),
      supabase
        .from("syndication_posts")
        .select("id,platform,title,external_url,status,error,created_at")
        .eq("workspace_id", data.workspaceId)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    return {
      accounts: (accounts ?? []) as SyndicationAccountView[],
      posts: (posts ?? []) as SyndicationPostView[],
    };
  });

export const connectSyndication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      workspaceId: string;
      platform: SyndicationPlatform;
      apiToken: string;
      handle?: string;
      publicationId?: string;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: member } = await supabase.rpc("is_workspace_member", {
      _workspace_id: data.workspaceId,
      _user_id: context.userId,
    });
    if (!member) throw new Error("Forbidden");
    if (!data.apiToken.trim()) throw new Error("Access token is required");
    if (data.platform === "hashnode" && !data.publicationId?.trim()) {
      throw new Error("Hashnode needs your publication id");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("syndication_accounts").upsert(
      {
        workspace_id: data.workspaceId,
        platform: data.platform,
        api_token: data.apiToken.trim(),
        handle: data.handle?.trim() || null,
        publication_id: data.publicationId?.trim() || null,
        status: "connected",
        last_error: null,
      },
      { onConflict: "workspace_id,platform" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const disconnectSyndication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string; platform: SyndicationPlatform }) => input)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("syndication_accounts")
      .delete()
      .eq("workspace_id", data.workspaceId)
      .eq("platform", data.platform);
    if (error) throw error;
    return { ok: true };
  });

/** Run syndication immediately for one workspace (used by the dashboard button). */
export const runSyndicationNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { workspaceId: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: member } = await context.supabase.rpc("is_workspace_member", {
      _workspace_id: data.workspaceId,
      _user_id: context.userId,
    });
    if (!member) throw new Error("Forbidden");
    const { runDailySyndication } = await import("./syndication.server");
    return runDailySyndication({ workspaceId: data.workspaceId });
  });
