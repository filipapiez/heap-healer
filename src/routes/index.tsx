import { createFileRoute, Link } from "@tanstack/react-router";
import LandingPage from "@/components/LandingPage";

function IndexComponent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flexGrow: 1 }}>
        <LandingPage />
      </div>
      <footer style={{ padding: "40px 20px", background: "#FFFFFF", textAlign: "center", borderTop: "1px solid #E5E7EB", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/about" style={{ color: "#6B7280", textDecoration: "none", fontSize: "14px" }}>About</Link>
          <Link to="/how-it-works" style={{ color: "#6B7280", textDecoration: "none", fontSize: "14px" }}>How It Works</Link>
          <Link to="/contact" style={{ color: "#6B7280", textDecoration: "none", fontSize: "14px" }}>Contact</Link>
          <Link to="/faq" style={{ color: "#6B7280", textDecoration: "none", fontSize: "14px" }}>FAQ</Link>
          <Link to="/resources" style={{ color: "#6B7280", textDecoration: "none", fontSize: "14px" }}>Resources</Link>
          <Link to="/privacy" style={{ color: "#6B7280", textDecoration: "none", fontSize: "14px" }}>Privacy</Link>
          <Link to="/terms" style={{ color: "#6B7280", textDecoration: "none", fontSize: "14px" }}>Terms</Link>
        </div>
      </footer>
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SEO Growth Workspace | Verified Reporting | MentionMyApp" },
      {
        name: "description",
        content:
          "Audit technical SEO, publish approved website changes, verify backlinks, and measure organic growth with Google Search Console.",
      },
      { property: "og:title", content: "MentionMyApp — verified SEO growth workflows" },
      {
        property: "og:description",
        content:
          "Technical audits, approved publishing, verified backlinks, and transparent Search Console reporting.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://mentionmyapp.com/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://mentionmyapp.com/" }],
  }),
  component: IndexComponent,
});
