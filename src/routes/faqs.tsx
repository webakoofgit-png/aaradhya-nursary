import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/catalog";

export const Route = createFileRoute("/faqs")({ component: FaqPage });

function FaqPage() {
  return (
    <div>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Answers about plant care, delivery and wholesale ordering."
        trail={[{ label: "FAQs" }]}
      />
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Accordion type="single" collapsible>
          {faqs.map((item, index) => (
            <AccordionItem key={item.q} value={String(index)}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
