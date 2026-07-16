import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/sync-gsc")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
          return new Response("Unauthorized", { status: 401 });
        const { syncAllGscClients } = await import("@/lib/gsc-sync.server");
        const { syncAllSemrushClients } = await import("@/lib/semrush-sync.server");
        const [gsc, semrush] = await Promise.all([
          syncAllGscClients().catch((e) => {
            console.error("[sync-gsc] gsc sync failed", e);
            return [{ ok: false, error: e instanceof Error ? e.message : String(e) }];
          }),
          syncAllSemrushClients().catch((e) => {
            console.error("[sync-gsc] semrush sync failed", e);
            return [{ ok: false, error: e instanceof Error ? e.message : String(e) }];
          }),
        ]);
        return Response.json({ ok: true, gsc, semrush });
      },
    },
  },
});
