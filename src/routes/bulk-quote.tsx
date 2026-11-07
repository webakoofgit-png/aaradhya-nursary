import { createFileRoute } from "@tanstack/react-router";
import { AppLink } from "@/components/site/AppLink";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/bulk-quote")({ component: BulkQuotePage });

function BulkQuotePage() {
  return (
    <div>
      <PageHeader
        title="Wholesale Enquiry"
        subtitle="Send your bulk requirement directly to our nursery team on WhatsApp."
        trail={[{ label: "Bulk Quotation" }]}
      />
      <section className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
        <h2 className="font-display text-2xl text-leaf-deep">No account or login required</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Tell us which products, quantities and delivery location you need. Your enquiry will
          open in WhatsApp so our team can respond with availability and a custom quotation.
        </p>
        <AppLink
          to="/wholesale"
          className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          Open Wholesale Enquiry Form
        </AppLink>
      </section>
    </div>
  );
}
