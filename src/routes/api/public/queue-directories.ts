import { createFileRoute } from "@tanstack/react-router";

/**
 * Legacy weekly scheduler URL retained for existing cron configuration.
 * Cloudflare's scheduled handler also calls the same idempotent queue function.
 */
export const Route = createFileRoute("/api/public/queue-directories")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { queueWeeklyDirectories } = await import("@/lib/directory-submit.server");
        return Response.json(await queueWeeklyDirectories());
      },
    },
  },
});
