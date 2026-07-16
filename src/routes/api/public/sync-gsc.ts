import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/sync-gsc")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
          return new Response("Unauthorized", { status: 401 });
        const { syncAllGscClients } = await import("@/lib/gsc-sync.server");
        const results = await syncAllGscClients();
        return Response.json({ ok: true, clients: results.length, results });
      },
    },
  },
});
