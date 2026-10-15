import { createFileRoute } from "@tanstack/react-router";
import { AppLink } from "@/components/site/AppLink";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/bulk-quote")({ component: BulkQuotePage });

function BulkQuotePage() {
  return (
    <div>
      <PageHeader
        title="Bulk Quotation"
        subtitle="Create a verified wholesale quotation with live product pricing."
        trail={[{ label: "Bulk Quotation" }]}
      />
      <section className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
        <h2 className="font-display text-2xl text-leaf-deep">Start your B2B quotation</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Register your business first. Once approved, sign in to select products, change
          quantities, preview totals and download your PDF quotation.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <AppLink
            to="/wholesale/register"
            className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
          >
            Register Now
          </AppLink>
          <AppLink
            to="/wholesale/login"
            className="rounded-md border border-border bg-card px-5 py-3 text-sm font-medium"
          >
            B2B Login
          </AppLink>
        </div>
      </section>
    </div>
  );
}
