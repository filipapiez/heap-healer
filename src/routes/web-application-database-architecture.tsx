import { createFileRoute, redirect } from "@tanstack/react-router";

// The off-topic page that used to live here was removed; send any visitor
// (or search engine) to the on-topic replacement.
export const Route = createFileRoute("/web-application-database-architecture")({
  beforeLoad: () => {
    throw redirect({ to: "/startup-directory-backlinks", statusCode: 301 });
  },
});
