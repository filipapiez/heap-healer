function base64url(input: string | Uint8Array) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function cleanGithubPrivateKey(value: string) {
  return value
    .trim()
    .replace(/^GITHUB_APP_PRIVATE_KEY\s*=\s*/, "")
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\r\\n|\\n|\\r/g, "\n");
}

function pemBodyToDer(pem: string) {
  const body = pem.replace(
    /-----BEGIN [^-]+-----|-----END [^-]+-----|\s/g,
    "",
  );
  if (!body) throw new Error("GitHub App private key is empty");
  try {
    return Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
  } catch {
    throw new Error("GitHub App private key is not valid base64 PEM data");
  }
}

// Wrap a PKCS#1 RSAPrivateKey (DER) in a PKCS#8 PrivateKeyInfo envelope.
// GitHub Apps hand out PKCS#1 (-----BEGIN RSA PRIVATE KEY-----); Web Crypto only accepts PKCS#8.
function pkcs1ToPkcs8(pkcs1: Uint8Array): Uint8Array {
  // PKCS#8 prefix: SEQUENCE { version(0), AlgorithmIdentifier(rsaEncryption, NULL), OCTET STRING { pkcs1 } }
  const rsaOid = new Uint8Array([
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
  ]);
  const version = new Uint8Array([0x02, 0x01, 0x00]);
  const encodeLen = (n: number): Uint8Array => {
    if (n < 0x80) return new Uint8Array([n]);
    const bytes: number[] = [];
    let x = n;
    while (x > 0) { bytes.unshift(x & 0xff); x >>= 8; }
    return new Uint8Array([0x80 | bytes.length, ...bytes]);
  };
  const octetLen = encodeLen(pkcs1.length);
  const octetString = new Uint8Array(1 + octetLen.length + pkcs1.length);
  octetString[0] = 0x04;
  octetString.set(octetLen, 1);
  octetString.set(pkcs1, 1 + octetLen.length);
  const inner = new Uint8Array(version.length + rsaOid.length + octetString.length);
  inner.set(version, 0);
  inner.set(rsaOid, version.length);
  inner.set(octetString, version.length + rsaOid.length);
  const seqLen = encodeLen(inner.length);
  const out = new Uint8Array(1 + seqLen.length + inner.length);
  out[0] = 0x30;
  out.set(seqLen, 1);
  out.set(inner, 1 + seqLen.length);
  return out;
}

async function appJwt() {
  const appId = process.env.GITHUB_APP_ID;
  const rawPem = process.env.GITHUB_APP_PRIVATE_KEY;
  if (!appId || !rawPem)
    throw new Error("GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY are not configured");
  const pem = cleanGithubPrivateKey(rawPem);
  const der = pemBodyToDer(pem);
  const candidates = /-----BEGIN RSA PRIVATE KEY-----/.test(pem)
    ? [pkcs1ToPkcs8(der)]
    : [der, pkcs1ToPkcs8(der)];

  let key: CryptoKey | undefined;
  let importError: unknown;
  for (const candidate of candidates) {
    try {
      key = await crypto.subtle.importKey(
        "pkcs8",
        candidate.slice().buffer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"],
      );
      break;
    } catch (error) {
      importError = error;
    }
  }
  if (!key) {
    console.error("[github-app] private key import failed", importError);
    throw new Error(
      "GitHub App private key could not be read. Download a fresh private key from the GitHub App and save the full PEM text.",
    );
  }
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
  const path = `content/seo/${input.slug}.html`;
  const content = btoa(unescape(encodeURIComponent(input.html)));
  // Check if file already exists on base branch so we can supply the required sha for updates.
  const existing = await fetch(
    `${api}/contents/${path}?ref=${encodeURIComponent(base)}`,
    { headers },
  );
  let sha: string | undefined;
  if (existing.ok) {
    const existingJson = (await existing.json()) as { sha?: string };
    sha = existingJson.sha;
  } else if (existing.status !== 404) {
    throw new Error(`GitHub content lookup failed (${existing.status})`);
  }
  const commit = await fetch(`${api}/contents/${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: `Publish SEO page: ${input.title}`,
      content,
      branch: base,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!commit.ok) throw new Error(`GitHub content commit failed (${commit.status})`);
  const commitJson = (await commit.json()) as {
    commit?: { sha?: string; html_url?: string };
    content?: { html_url?: string };
  };
  return {
    number: 0,
    html_url:
      commitJson.commit?.html_url ??
      commitJson.content?.html_url ??
      `https://github.com/${input.repository}/blob/${base}/${path}`,
  };
}
