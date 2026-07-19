type ConnectionStatusData = {
  gsc?: {
    property_url?: string | null;
    active?: boolean | null;
  } | null;
  github?: unknown;
  delivery?: Array<{
    platform?: string;
    status?: string;
  }> | null;
};

export const WEBSITE_CONNECTION_QUERY_KEY = ["website-connection-status"] as const;

const PUBLISHING_PROVIDERS = new Set(["github", "wordpress", "shopify"]);

export function summarizeWebsiteConnections(data: ConnectionStatusData | null | undefined) {
  const connectedDeliveries = (data?.delivery ?? []).filter(
    (connection) =>
      connection.status === "connected" &&
      Boolean(connection.platform && PUBLISHING_PROVIDERS.has(connection.platform)),
  );
  const githubConnected = Boolean(data?.github);
  const searchPropertyUrl = data?.gsc?.property_url ?? null;
  const searchConnected = Boolean(searchPropertyUrl && data?.gsc?.active !== false);
  const publishingConnected = connectedDeliveries.length > 0;

  return {
    githubConnected,
    publishingConnected,
    publishingProviderCount: connectedDeliveries.length,
    publishingReady: publishingConnected,
    searchConnected,
    searchPropertyUrl,
    websiteIdentified: searchConnected || publishingConnected,
  };
}
