import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions - MentionMyApp" },
      { name: "description", content: "Answers to common questions about SEO audits, AI visibility, and verified search growth." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about our SEO audits and AI visibility.
            </p>
          </div>
          
          <div className="space-y-8">
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-card-foreground mb-3">
                What is an AI visibility audit?
              </h2>
              <p className="text-muted-foreground">
                An AI visibility audit checks whether ChatGPT, Gemini, Claude, and Perplexity can understand and cite your brand. We review your entity signals, structured data, and answer-ready summaries to ensure your business is discoverable by AI search systems.
              </p>
            </section>
            
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-card-foreground mb-3">
                How long does a technical SEO cleanup take?
              </h2>
              <p className="text-muted-foreground">
                Most technical cleanups take a few days to implement. We prioritize critical crawl issues, status codes, and canonical tags first, ensuring a stable foundation before moving on to content and local SEO improvements.
              </p>
            </section>
            
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-card-foreground mb-3">
                Do you fix Google Business Profile issues?
              </h2>
              <p className="text-muted-foreground">
                Yes. Our audits check your GBP categories, reviews, services, and local pages to ensure consistent NAP (Name, Address, Phone) data and map-pack visibility.
              </p>
            </section>
            
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-card-foreground mb-3">
                Why are my pages discovered but not indexed?
              </h2>
              <p className="text-muted-foreground">
                This usually happens due to thin content, duplicate templates, or missing internal links. We clean up your sitemap, enforce noindex boundaries, and strengthen your most important pages to ensure they deserve indexing.
              </p>
            </section>
            
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-card-foreground mb-3">
                How do I know if my site has indexing issues?
              </h2>
              <p className="text-muted-foreground">
                If your site has URLs showing as duplicate, soft 404, or &quot;crawled - currently not indexed&quot; in Google Search Console, you likely have an indexing problem. A technical audit will uncover the root causes and provide a prioritized list of fixes.
              </p>
            </section>
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What is an AI visibility audit?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "An AI visibility audit checks whether ChatGPT, Gemini, Claude, and Perplexity can understand and cite your brand. We review your entity signals, structured data, and answer-ready summaries to ensure your business is discoverable by AI search systems."
                    }
                  },
                  {
                    "@type": "Question",
                    name: "How long does a technical SEO cleanup take?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Most technical cleanups take a few days to implement. We prioritize critical crawl issues, status codes, and canonical tags first, ensuring a stable foundation before moving on to content and local SEO improvements."
                    }
                  },
                  {
                    "@type": "Question",
                    name: "Do you fix Google Business Profile issues?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Yes. Our audits check your GBP categories, reviews, services, and local pages to ensure consistent NAP (Name, Address, Phone) data and map-pack visibility."
                    }
                  },
                  {
                    "@type": "Question",
                    name: "Why are my pages discovered but not indexed?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "This usually happens due to thin content, duplicate templates, or missing internal links. We clean up your sitemap, enforce noindex boundaries, and strengthen your most important pages to ensure they deserve indexing."
                    }
                  },
                  {
                    "@type": "Question",
                    name: "How do I know if my site has indexing issues?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "If your site has URLs showing as duplicate, soft 404, or \"crawled - currently not indexed\" in Google Search Console, you likely have an indexing problem. A technical audit will uncover the root causes and provide a prioritized list of fixes."
                    }
                  }
                ]
              })
            }}
          />
        </div>
      </main>
    </div>
  );
}
