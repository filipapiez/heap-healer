import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { LANDING_HTML, LANDING_CSS, runLandingScript } from "@/lib/landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MentionMyApp — one post, eleven platforms" },
      {
        name: "description",
        content:
          "Upload a video, watermark it, write one caption — MentionMyApp publishes to YouTube, TikTok, Instagram and 8 more platforms, then pulls every like and comment into one inbox.",
      },
      { property: "og:title", content: "MentionMyApp — one post, eleven platforms" },
      {
        property: "og:description",
        content:
          "Publish once to 11 platforms, reply from one inbox, and turn every post into backlinks that rank on Google.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mentionmyapp.com/" },
    ],
    links: [
      { rel: "canonical", href: "https://mentionmyapp.com/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  useEffect(() => {
    const cleanup = runLandingScript();
    return cleanup;
  }, []);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />
    </>
  );
}
