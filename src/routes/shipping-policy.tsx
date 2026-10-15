import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { AppLink } from "@/components/site/AppLink";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Aaradhya rose nursary" },
      { name: "description", content: "How we pack and deliver plants safely across India." },
      { property: "og:title", content: "Shipping Policy — Aaradhya rose nursary" },
      { property: "og:description", content: "How we pack and deliver plants safely across India." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shipping-policy" },
    ],
    links: [{ rel: "canonical", href: "/shipping-policy" }],
  }),
  component: ShippingPolicy,
});

function ShippingPolicy() {
  const sections = [
        { h: "Dispatch timelines", p: "Retail orders are dispatched within 24 working hours. Wholesale consignments are scheduled with your account manager and usually leave the nursery within 2 to 4 working days." },
        { h: "Delivery coverage", p: "We deliver to over 20,000 pin codes across India. Remote locations may add 2 to 3 days to the standard 3 to 7 day window." },
        { h: "Packaging", p: "Every plant travels in a ventilated, shock-proof carton with the root ball secured and moisture retained by coir wrap." },
        { h: "Shipping charges", p: "Retail orders above ₹999 ship free. Below that a flat ₹79 applies. Wholesale freight is quoted per consignment." },
  ];
  return (
    <div>
      <PageHeader title="Shipping Policy" subtitle="How we pack and deliver plants safely across India." trail={[{ label: "Shipping Policy" }]} />
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
