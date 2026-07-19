type VerifiedBacklink = {
  placementUrl: string;
  sourceDomain: string;
  targetUrl: string;
  verifiedAt: string;
};

function normalizedHostname(value: string): string {
  return new URL(value).hostname
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/\.$/, "");
}

function isPrivateIp(address: string): boolean {
  const lower = address.toLowerCase();
  if (lower === "::1" || lower === "::" || lower.startsWith("fc") || lower.startsWith("fd")) {
    return true;
  }
  if (
    lower.startsWith("fe8") ||
    lower.startsWith("fe9") ||
    lower.startsWith("fea") ||
    lower.startsWith("feb")
  ) {
    return true;
  }
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  const ipv4 = mapped ?? (/^\d+\.\d+\.\d+\.\d+$/.test(address) ? address : null);
  if (!ipv4) return false;
  const octets = ipv4.split(".").map(Number);
  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b != null && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b != null && b >= 64 && b <= 127) ||
    (a != null && a >= 224)
  );
}

export async function assertPublicHttpUrl(value: string): Promise<URL> {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Use an http or https URL");
  if (url.username || url.password)
    throw new Error("URLs with embedded credentials are not allowed");
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error("The placement URL must be publicly reachable");
  }

  const [{ lookup }, { isIP }] = await Promise.all([
    import("node:dns/promises"),
    import("node:net"),
  ]);
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) {
    throw new Error("The placement URL must resolve to a public address");
  }
  return url;
}

async function fetchPublicHtml(initialUrl: string): Promise<{ html: string; finalUrl: string }> {
  let url = await assertPublicHttpUrl(initialUrl);
  for (let redirect = 0; redirect <= 4; redirect += 1) {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "MentionMyApp-BacklinkVerifier/1.0 (+https://mentionmyapp.com)",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location)
        throw new Error(`Placement redirected without a destination (HTTP ${response.status})`);
      url = await assertPublicHttpUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new Error(`Placement is not reachable (HTTP ${response.status})`);
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("text/html")) {
      throw new Error("The placement URL did not return an HTML page");
    }
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > 2_000_000)
      throw new Error("The placement page is too large to verify safely");
    return { html: (await response.text()).slice(0, 2_000_000), finalUrl: url.toString() };
  }
  throw new Error("The placement URL redirected too many times");
}

function pageLinksToTarget(html: string, pageUrl: string, targetUrl: string): boolean {
  const targetHost = normalizedHostname(targetUrl);
  const hrefPattern = /<a\b[^>]*?\bhref\s*=\s*(?:["']([^"']+)["']|([^\s>]+))/gi;
  for (const match of html.matchAll(hrefPattern)) {
    const href = match[1] ?? match[2];
    if (!href) continue;
    try {
      const linkHost = normalizedHostname(new URL(href, pageUrl).toString());
      if (linkHost === targetHost || linkHost.endsWith(`.${targetHost}`)) return true;
    } catch {
      // Ignore malformed hrefs and continue checking the page.
    }
  }
  return false;
}

export async function verifyBacklink(
  placementUrl: string,
  targetUrl: string,
): Promise<VerifiedBacklink> {
  await assertPublicHttpUrl(targetUrl);
  const { html, finalUrl } = await fetchPublicHtml(placementUrl);
  if (!pageLinksToTarget(html, finalUrl, targetUrl)) {
    throw new Error(`No link to ${normalizedHostname(targetUrl)} was found on that page`);
  }
  return {
    placementUrl: finalUrl,
    sourceDomain: normalizedHostname(finalUrl),
    targetUrl,
    verifiedAt: new Date().toISOString(),
  };
}
