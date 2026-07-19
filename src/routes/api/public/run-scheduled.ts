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
 * Legacy scheduler URL retained for existing cron configuration.
 * It now processes website publishing jobs only.
 */
export const Route = createFileRoute("/api/public/run-scheduled")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!authorizedCronRequest(request)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { runScheduledMaintenance } = await import("@/maintenance.server");
        const result = await runScheduledMaintenance();
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
    },
  },
});
