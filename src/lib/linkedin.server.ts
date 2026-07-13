// Server-only helpers for native LinkedIn OAuth (Sign In with LinkedIn + Share on LinkedIn).
// Never import this file from a route file, component, or *.functions.ts module at the
// top level — the *.server.ts suffix keeps it out of client bundles.

const LI_AUTH = "https://www.linkedin.com/oauth/v2/authorization";
const LI_TOKEN = "https://www.linkedin.com/oauth/v2/accessToken";
const LI_REVOKE = "https://www.linkedin.com/oauth/v2/revoke";
const LI_API = "https://api.linkedin.com/v2";

// openid + profile + email  → Sign In with LinkedIn (OIDC)
// w_member_social            → Share on LinkedIn
export const LINKEDIN_SCOPES = ["openid", "profile", "email", "w_member_social"].join(" ");

export function requireLinkedInEnv() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET are not configured.");
  }
  return { clientId, clientSecret };
}

export function buildLinkedInAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    state: opts.state,
    scope: LINKEDIN_SCOPES,
  });
  return `${LI_AUTH}?${params.toString()}`;
}

export async function exchangeLinkedInCode(opts: {
  code: string;
  redirectUri: string;
}): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type?: string;
  id_token?: string;
}> {
  const { clientId, clientSecret } = requireLinkedInEnv();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(LI_TOKEN, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`LinkedIn token exchange failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

/** Fetches the LinkedIn member's OIDC userinfo (sub, name, email, picture). */
export async function fetchLinkedInUserinfo(accessToken: string): Promise<{
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
}> {
  const res = await fetch(`${LI_API}/userinfo`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`LinkedIn userinfo failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

/** Best-effort token revocation + local record deletion. */
export async function disconnectLinkedInAccount(connectedAccountId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: tok } = await supabaseAdmin
    .from("linkedin_oauth_tokens" as never)
    .select("access_token")
    .eq("connected_account_id", connectedAccountId)
    .maybeSingle();

  const accessToken = (tok as unknown as { access_token?: string } | null)?.access_token;
  if (accessToken) {
    try {
      const { clientId, clientSecret } = requireLinkedInEnv();
      await fetch(LI_REVOKE, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: accessToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
    } catch (e) {
      console.warn("[linkedin] revoke failed", e);
    }
  }

  await supabaseAdmin
    .from("linkedin_oauth_tokens" as never)
    .delete()
    .eq("connected_account_id", connectedAccountId);

  const { error: delErr } = await supabaseAdmin
    .from("connected_accounts")
    .delete()
    .eq("id", connectedAccountId);
  if (delErr) throw delErr;
}