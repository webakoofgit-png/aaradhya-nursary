import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { AppLink } from "@/components/site/AppLink";

export const Route = createFileRoute("/cancellation-policy")({
  head: () => ({
    meta: [
      { title: "Cancellation Policy — Aaradhya rose nursary" },
      { name: "description", content: "How to cancel or amend a retail or wholesale nursery order." },
      { property: "og:title", content: "Cancellation Policy — Aaradhya rose nursary" },
      { property: "og:description", content: "How to cancel or amend a retail or wholesale nursery order." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cancellation-policy" },
    ],
    links: [{ rel: "canonical", href: "/cancellation-policy" }],
  }),
  component: CancellationPolicy,
});

function CancellationPolicy() {
  const sections = [
        { h: "Before dispatch", p: "Retail orders can be cancelled free of charge any time before dispatch from your account or by calling us." },
        { h: "After dispatch", p: "Once a plant consignment leaves the nursery it cannot be cancelled, but a damaged delivery is always covered." },
        { h: "Wholesale orders", p: "Confirmed bulk orders can be rescheduled once. Cancellation within 48 hours of dispatch attracts a 10% handling fee." },
        { h: "Refunds", p: "Cancellation refunds are processed within 5 to 7 working days." },
  ];
  return (
    <div>
      <PageHeader title="Cancellation Policy" subtitle="How to cancel or amend a retail or wholesale nursery order." trail={[{ label: "Cancellation Policy" }]} />
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
