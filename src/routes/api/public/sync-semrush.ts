import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/sync-semrush")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
          return new Response("Unauthorized", { status: 401 });
        const { syncAllSemrushClients } = await import("@/lib/semrush-sync.server");
        const results = await syncAllSemrushClients();
        return Response.json({ ok: true, clients: results.length, results });
      },
    },
  },
});