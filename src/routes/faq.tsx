import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ - MentionMyApp" },
      { name: "description", content: "Frequently asked questions about our technical SEO audits, approved website publishing, and measurable search growth." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <PageHeader 
        title="Frequently Asked Questions" 
        subtitle="Answers to common questions about MentionMyApp, SEO audits, and search visibility." 
      />
      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is MentionMyApp?</AccordionTrigger>
            <AccordionContent>
              MentionMyApp is a platform for verified SEO growth workflows. We provide technical SEO audits, approved website publishing, verified backlinks, and transparent Google Search Console reporting to help you measurably grow your search visibility.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does the technical SEO audit work?</AccordionTrigger>
            <AccordionContent>
              Our audit scans your website for technical crawl issues, missing metadata, broken links, soft 404s, and AI visibility gaps. We then provide a prioritized roadmap of fixes categorized by technical, content, local, and AI readiness.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Do you help with AI visibility (AEO/GEO)?</AccordionTrigger>
            <AccordionContent>
              Yes. We audit your AI readiness and structured data, ensuring that ChatGPT, Claude, Gemini, and other AI systems have clear entity signals, FAQs, and source pages to understand and cite your brand.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>How do you measure SEO growth?</AccordionTrigger>
            <AccordionContent>
              We connect directly to your Google Search Console account to sync indexing data, track ranking improvements, and provide transparent reporting on your verified search performance.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
