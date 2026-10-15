import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { AppLink } from "@/components/site/AppLink";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — Aaradhya rose nursary" },
      { name: "description", content: "The terms that govern the use of the Aaradhya rose nursary website and services." },
      { property: "og:title", content: "Terms and Conditions — Aaradhya rose nursary" },
      { property: "og:description", content: "The terms that govern the use of the Aaradhya rose nursary website and services." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: Terms,
});

function Terms() {
  const sections = [
        { h: "Use of the site", p: "By browsing or ordering you agree to these terms and to provide accurate information at checkout." },
        { h: "Pricing", p: "Retail prices include applicable taxes. Wholesale prices are visible only to approved B2B accounts and may change with quantity slabs." },
        { h: "Plant variation", p: "Plants are living products; size, form and flowering vary naturally from the photographs shown." },
        { h: "Liability", p: "Our liability for any order is limited to the invoiced value of that order." },
  ];
  return (
    <div>
      <PageHeader title="Terms and Conditions" subtitle="The terms that govern the use of the Aaradhya rose nursary website and services." trail={[{ label: "Terms and Conditions" }]} />
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
