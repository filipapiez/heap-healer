function base64url(input: string | Uint8Array) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function appJwt() {
  const appId = process.env.GITHUB_APP_ID;
  const pem = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!appId || !pem) throw new Error("GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY are not configured");
  const body = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const raw = Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    raw,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }));
  const unsigned = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64url(new Uint8Array(signature))}`;
}

export function requireGithubAppSlug() {
  const slug = process.env.GITHUB_APP_SLUG;
  if (!slug) throw new Error("GITHUB_APP_SLUG is not configured");
  return slug;
}

export async function getInstallation(installationId: number) {
  const response = await fetch(`https://api.github.com/app/installations/${installationId}`, {
    headers: {
      authorization: `Bearer ${await appJwt()}`,
      accept: "application/vnd.github+json",
      "user-agent": "MentionMyApp",
    },
  });
  if (!response.ok) throw new Error(`GitHub installation lookup failed (${response.status})`);
  return (await response.json()) as { account?: { login?: string; type?: string } };
}

export async function listInstallationRepositories(installationId: number) {
  const tokenResponse = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${await appJwt()}`,
        accept: "application/vnd.github+json",
        "user-agent": "MentionMyApp",
      },
    },
  );
  if (!tokenResponse.ok)
    throw new Error(`GitHub installation token failed (${tokenResponse.status})`);
  const { token } = (await tokenResponse.json()) as { token: string };
  const response = await fetch("https://api.github.com/installation/repositories?per_page=100", {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "user-agent": "MentionMyApp",
    },
  });
  if (!response.ok) throw new Error(`GitHub repository lookup failed (${response.status})`);
  const data = (await response.json()) as {
    repositories?: { id: number; full_name: string; html_url: string; private: boolean }[];
  };
  return data.repositories ?? [];
}

async function installationToken(installationId: number) {
  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${await appJwt()}`,
        accept: "application/vnd.github+json",
        "user-agent": "MentionMyApp",
      },
    },
  );
  if (!response.ok) throw new Error(`GitHub installation token failed (${response.status})`);
  return ((await response.json()) as { token: string }).token;
}

export async function openSeoPullRequest(input: {
  installationId: number;
  repository: string;
  title: string;
  slug: string;
  html: string;
  base?: string;
}) {
  const token = await installationToken(input.installationId);
  const headers = {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "content-type": "application/json",
    "user-agent": "MentionMyApp",
  };
  const api = `https://api.github.com/repos/${input.repository}`;
  const repoResponse = await fetch(api, { headers });
  if (!repoResponse.ok) throw new Error(`GitHub repository lookup failed (${repoResponse.status})`);
  const repo = (await repoResponse.json()) as { default_branch: string };
  const base = input.base ?? repo.default_branch;
  const refResponse = await fetch(`${api}/git/ref/heads/${encodeURIComponent(base)}`, { headers });
  if (!refResponse.ok) throw new Error(`GitHub branch lookup failed (${refResponse.status})`);
  const ref = (await refResponse.json()) as { object: { sha: string } };
  const branch = `mentionmyapp/seo-${input.slug}-${Date.now()}`;
  const createRef = await fetch(`${api}/git/refs`, {
    method: "POST",
    headers,
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: ref.object.sha }),
  });
  if (!createRef.ok) throw new Error(`GitHub branch creation failed (${createRef.status})`);
  const path = `content/seo/${input.slug}.html`;
  const content = btoa(unescape(encodeURIComponent(input.html)));
  const commit = await fetch(`${api}/contents/${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ message: `Add SEO page: ${input.title}`, content, branch }),
  });
  if (!commit.ok) throw new Error(`GitHub content commit failed (${commit.status})`);
  const pull = await fetch(`${api}/pulls`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: input.title,
      head: branch,
      base,
      body: "SEO page prepared by MentionMyApp. Review the content and merge to deploy through your existing workflow.",
    }),
  });
  if (!pull.ok) throw new Error(`GitHub pull request failed (${pull.status})`);
  return (await pull.json()) as { number: number; html_url: string };
}
