import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { AppLink } from "@/components/site/AppLink";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return and Refund Policy — Aaradhya rose nursary" },
      { name: "description", content: "Damaged plant replacement and refund process at Aaradhya rose nursary." },
      { property: "og:title", content: "Return and Refund Policy — Aaradhya rose nursary" },
      { property: "og:description", content: "Damaged plant replacement and refund process at Aaradhya rose nursary." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/return-policy" },
    ],
    links: [{ rel: "canonical", href: "/return-policy" }],
  }),
  component: ReturnPolicy,
});

function ReturnPolicy() {
  const sections = [
        { h: "48 hour window", p: "Share an unboxing photo or video within 48 hours of delivery if a plant arrives damaged or unhealthy." },
        { h: "Replacement first", p: "We replace the plant in the next dispatch cycle at no cost. If a replacement is unavailable we refund the full amount." },
        { h: "Refund timeline", p: "Approved refunds reach the original payment method within 5 to 7 working days." },
        { h: "Non-returnable items", p: "Opened seed packets, soil, manure and used tools cannot be returned for hygiene reasons." },
  ];
  return (
    <div>
      <PageHeader title="Return and Refund Policy" subtitle="Damaged plant replacement and refund process at Aaradhya rose nursary." trail={[{ label: "Return and Refund Policy" }]} />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        {sections.map((s) => (
          <section key={s.h} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg text-leaf-deep">{s.h}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.p}</p>
          </section>
        ))}
        <p className="text-sm text-muted-foreground">Questions? <AppLink to="/contact" className="text-primary hover:underline">Contact our team</AppLink>.</p>
      </div>
    </div>
  );
}
