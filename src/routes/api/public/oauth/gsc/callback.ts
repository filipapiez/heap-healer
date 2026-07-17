import { createFileRoute } from "@tanstack/react-router";

type StateRow = {
  provider: string;
  workspace_id: string;
  redirect_origin: string;
  expires_at: string;
};

type Site = { siteUrl: string; permissionLevel?: string };

function comparable(value: string) {
  return value
    .replace(/^sc-domain:/, "")
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const value = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };
    const parts = [value.message, value.details, value.hint]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
      .map((part) => part.trim());
    if (parts.length) return [...new Set(parts)].join(" ");
    if (typeof value.code === "string") return `Connection failed (${value.code})`;
  }
  return "Search Console connection failed. Please try again.";
}

export const Route = createFileRoute("/api/public/oauth/gsc/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const finish = (origin: string, status: "ok" | "error", message: string) => {
          const target = new URL("/accounts", origin);
          target.searchParams.set("gsc", status);
          target.searchParams.set("msg", message);
          return Response.redirect(target, 302);
        };
        const code = requestUrl.searchParams.get("code");
        const state = requestUrl.searchParams.get("state");
        const oauthError = requestUrl.searchParams.get("error");
        if (!state) return finish(requestUrl.origin, "error", "missing_state");
        const { data } = await supabaseAdmin
          .from("oauth_states" as never)
          .select("provider,workspace_id,redirect_origin,expires_at")
          .eq("state", state)
          .maybeSingle();
        const row = data as unknown as StateRow | null;
        if (!row) return finish(requestUrl.origin, "error", "invalid_state");
        await supabaseAdmin
          .from("oauth_states" as never)
          .delete()
          .eq("state", state);
        if (row.provider !== "gsc")
          return finish(row.redirect_origin, "error", "provider_mismatch");
        if (new Date(row.expires_at) < new Date())
          return finish(row.redirect_origin, "error", "state_expired");
        if (oauthError) return finish(row.redirect_origin, "error", oauthError);
        if (!code) return finish(row.redirect_origin, "error", "missing_code");

        try {
          const clientId =
            process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID ?? process.env.GOOGLE_OAUTH_CLIENT_ID;
          const clientSecret =
            process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET ??
            process.env.GOOGLE_OAUTH_CLIENT_SECRET;
          if (!clientId || !clientSecret) throw new Error("Google OAuth is not configured");
          const redirectUri = `${row.redirect_origin}/api/public/oauth/gsc/callback`;
          const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: clientId,
              client_secret: clientSecret,
              code,
              grant_type: "authorization_code",
              redirect_uri: redirectUri,
            }),
          });
          if (!tokenResponse.ok)
            throw new Error(`Google token exchange failed (${tokenResponse.status})`);
          const tokens = (await tokenResponse.json()) as {
            access_token?: string;
            refresh_token?: string;
          };
          if (!tokens.access_token) throw new Error("Google did not return an access token");
          const sitesResponse = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
            headers: { authorization: `Bearer ${tokens.access_token}` },
          });
          if (!sitesResponse.ok) {
            const failure = (await sitesResponse.json().catch(() => null)) as {
              error?: { message?: string };
            } | null;
            const detail = failure?.error?.message?.trim();
            throw new Error(
              detail
                ? `Search Console: ${detail}`
                : `Search Console site lookup failed (${sitesResponse.status})`,
            );
          }
          const { siteEntry = [] } = (await sitesResponse.json()) as { siteEntry?: Site[] };
          const { data: client, error: clientError } = await supabaseAdmin
            .from("seo_clients" as never)
            .select("id,website")
            .eq("workspace_id", row.workspace_id)
            .maybeSingle();
          if (clientError) throw clientError;
          const clientRow = client as unknown as { id: string; website: string } | null;
          if (!clientRow)
            throw new Error(
              "No SEO customer record exists for this workspace. Return to Connections and reconnect Search Console.",
            );
          const requested = comparable(clientRow.website);
          const property = siteEntry.find((site) => comparable(site.siteUrl) === requested);
          if (!property)
            throw new Error(
              `The Google account does not have access to the Search Console property for ${clientRow.website}`,
            );
          const clientIdRow = clientRow.id;
          const { data: existing } = await supabaseAdmin
            .from("seo_gsc_connections" as never)
            .select("refresh_token")
            .eq("client_id", clientIdRow)
            .maybeSingle();
          const refreshToken =
            tokens.refresh_token ??
            (existing as unknown as { refresh_token?: string } | null)?.refresh_token;
          if (!refreshToken)
            throw new Error(
              "Google did not return a refresh token; reconnect and approve access again",
            );
          const { error } = await supabaseAdmin.from("seo_gsc_connections" as never).upsert(
            {
              client_id: clientIdRow,
              property_url: property.siteUrl,
              refresh_token: refreshToken,
              active: true,
              last_error: null,
            } as never,
            { onConflict: "client_id" },
          );
          if (error) throw error;
          // Saving the authorization is the success condition. A first metrics pull can fail
          // independently (for example while Google propagates property access), and the daily
          // sync records that failure on the connection for a later retry.
          try {
            const { syncAllGscClients } = await import("@/lib/gsc-sync.server");
            await syncAllGscClients();
          } catch (syncError) {
            console.error("[gsc-oauth] initial sync failed", syncError);
          }
          return finish(row.redirect_origin, "ok", "Search Console connected");
        } catch (error) {
          console.error("[gsc-oauth] callback failed", error);
          return finish(row.redirect_origin, "error", errorMessage(error));
        }
      },
    },
  },
});
