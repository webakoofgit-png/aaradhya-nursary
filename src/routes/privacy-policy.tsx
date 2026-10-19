import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { AppLink } from "@/components/site/AppLink";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Aaradhya rose nursary" },
      {
        name: "description",
        content: "How Aaradhya rose nursary collects, uses and protects your data.",
      },
      { property: "og:title", content: "Privacy Policy — Aaradhya rose nursary" },
      {
        property: "og:description",
        content: "How Aaradhya rose nursary collects, uses and protects your data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  const sections = [
    {
      h: "What we collect",
      p: "Name, contact details, delivery addresses, order history and business documents submitted for B2B verification.",
    },
    {
      h: "How we use it",
      p: "To process orders, verify wholesale accounts, provide support and — with your consent — send offers and care tips.",
    },
    {
      h: "Sharing",
      p: "We share only what delivery partners and payment processors need. We never sell personal data.",
    },
    {
      h: "Your rights",
      p: "Write to rmane9089@gmail.com to access, correct or delete your data at any time.",
    },
  ];
  return (
    <div>
      <PageHeader
        title="Privacy Policy"
        subtitle="How Aaradhya rose nursary collects, uses and protects your data."
        trail={[{ label: "Privacy Policy" }]}
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        {sections.map((s) => (
          <section key={s.h} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg text-leaf-deep">{s.h}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.p}</p>
          </section>
        ))}
        <p className="text-sm text-muted-foreground">
          Questions?{" "}
          <AppLink to="/contact" className="text-primary hover:underline">
            Contact our team
          </AppLink>
          .
        </p>
      </div>
    </div>
  );
}
