import { createFileRoute } from "@tanstack/react-router";

function authorizedCronRequest(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization");
  const apikey = request.headers.get("apikey");

  return Boolean(
    (cronSecret && authorization === `Bearer ${cronSecret}`) ||
      (publishableKey && (apikey === publishableKey || authorization === `Bearer ${publishableKey}`)),
  );
}

/**
 * Legacy weekly scheduler URL retained for existing cron configuration.
 * Cloudflare's scheduled handler also calls the same idempotent queue function.
 */
export const Route = createFileRoute("/api/public/queue-directories")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorizedCronRequest(request)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { queueWeeklyDirectories } = await import("@/lib/directory-submit.server");
        return Response.json(await queueWeeklyDirectories());
      },
    },
  },
});
