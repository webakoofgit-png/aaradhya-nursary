import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  ClipboardList,
  Gift,
  Package,
  Scissors,
  Sprout,
  Trees,
  Truck,
  Wheat,
} from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { AppLink } from "@/components/site/AppLink";
import { services } from "@/data/catalog";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Plant & Landscaping Services — Aaradhya rose nursary" },
      {
        name: "description",
        content:
          "Retail, wholesale, landscaping, corporate gifting and plant maintenance services across India.",
      },
      { property: "og:title", content: "Plant & Landscaping Services — Aaradhya rose nursary" },
      {
        property: "og:description",
        content: "Nursery services for homes, businesses and institutions.",
      },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

const icons = { Sprout, Truck, Trees, Gift, Building2, ClipboardList, Scissors, Wheat, Package };

function ServicesPage() {
  return (
    <div>
      <PageHeader
        title="Plant & Landscaping Services"
        subtitle="Nursery support for homes, businesses and large projects."
        trail={[{ label: "Services" }]}
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = icons[service.icon as keyof typeof icons] ?? Sprout;
            return (
              <article
                id={service.slug}
                key={service.slug}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-leaf-deep">
                  <Icon size={21} />
                </span>
                <h2 className="mt-4 font-display text-xl text-leaf-deep">{service.title}</h2>
                <p className="mt-2 text-sm font-medium">{service.short}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.detail}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-10 rounded-2xl bg-leaf-deep p-7 text-primary-foreground sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl">Planning a bulk or custom project?</h2>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Share your requirements and the nursery team will prepare a quotation.
            </p>
          </div>
          <AppLink
            to="/bulk-quote"
            className="mt-5 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground sm:mt-0"
          >
            Request a quotation
          </AppLink>
        </div>
      </section>
    </div>
  );
}
