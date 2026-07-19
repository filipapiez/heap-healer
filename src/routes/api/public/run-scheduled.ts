import { createFileRoute } from "@tanstack/react-router";

/**
 * Legacy scheduler URL retained for existing cron configuration.
 * It now processes website publishing jobs only.
 */
export const Route = createFileRoute("/api/public/run-scheduled")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
          return new Response("Unauthorized", { status: 401 });
        const { runScheduledMaintenance } = await import("@/maintenance.server");
        const result = await runScheduledMaintenance();
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
    },
  },
});
