import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AppLink } from "@/components/site/AppLink";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs, images } from "@/data/catalog";

export const Route = createFileRoute("/wholesale/")({
  head: () => ({
    meta: [
      { title: "Wholesale Plant Supply for Businesses — Aaradhya rose nursary" },
      {
        name: "description",
        content:
          "Bulk plants, seeds and gardening supplies for nurseries, landscapers, hotels and corporates. Register for B2B pricing.",
      },
      { property: "og:title", content: "Wholesale Plant Supply — Aaradhya rose nursary" },
      {
        property: "og:description",
        content: "Business pricing on bulk plants and nursery supplies across India.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/wholesale" },
    ],
    links: [{ rel: "canonical", href: "/wholesale" }],
  }),
  component: WholesalePage,
});

const benefits = [
  "Special bulk pricing",
  "Large quantity availability",
  "Dedicated account support",
  "Custom quotation",
  "Priority order processing",
  "Business invoice",
  "Delivery coordination",
  "Recurring order support",
];
const whoCan = [
  "Plant Nurseries",
  "Garden Centres",
  "Landscapers",
  "Interior Designers",
  "Builders and Developers",
  "Hotels and Resorts",
  "Corporate Offices",
  "Schools and Institutions",
  "Retail Stores",
  "Event Decorators",
];
const cats = [
  ["Bulk Indoor Plants", "indoor-plants"],
  ["Landscaping Plants", "outdoor-plants"],
  ["Avenue Plants", "outdoor-plants"],
  ["Flowering Plants", "flowering-plants"],
  ["Fruit Plants", "fruit-plants"],
  ["Bulk Seeds", "seeds"],
  ["Pots and Planters", "pots-planters"],
  ["Fertilizers and Manures", "fertilizers-manures"],
  ["Gardening Tools", "gardening-tools"],
  ["Corporate Gifting Plants", "office-plants"],
];
const steps = [
  "Create B2B Account",
  "Submit Business Details",
  "Account Verification",
  "Access Wholesale Pricing",
  "Place Order or Request Quote",
];

function WholesalePage() {
  return (
    <div>
      <section className="relative">
        <img
          src={images.heroWholesale}
          alt="Wholesale plant nursery"
          className="h-[420px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 to-foreground/30" />
        <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-6 lg:px-8">
          <h1 className="max-w-2xl font-display text-3xl text-background sm:text-5xl">
            Grow Your Business with Our Wholesale Nursery
          </h1>
          <p className="mt-4 max-w-xl text-sm text-background/85">
            Bulk plants, seeds and gardening supplies for nurseries, landscapers, builders, hotels,
            offices, institutions and retailers.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <AppLink
              to="/wholesale/register"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              Register as Wholesale Buyer
            </AppLink>
            <AppLink
              to="/wholesale/login"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              B2B Login
            </AppLink>
            <AppLink
              to="/bulk-quote"
              className="rounded-full border border-background/60 px-6 py-3 text-sm text-background"
            >
              Request Bulk Quotation
            </AppLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-md bg-secondary p-5">
          <p className="text-sm text-leaf-deep">
            Wholesale prices are available only to approved business accounts.
          </p>
          <AppLink
            to="/wholesale/login"
            className="rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground"
          >
            Access wholesale catalogue
          </AppLink>
        </div>
        <SectionHeading
          title="Wholesale Benefits"
          subtitle="Built for businesses that buy in volume"
          align="center"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b}
              className="flex items-start gap-2 rounded-2xl border border-border bg-card p-4 text-sm shadow-soft"
            >
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
              {b}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Who Can Register?"
            subtitle="We supply businesses of every size"
            align="center"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {whoCan.map((w) => (
              <div key={w} className="rounded-2xl bg-card p-4 text-center text-sm shadow-soft">
                {w}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          title="Wholesale Categories"
          subtitle="Bulk supply across the nursery"
          viewAllTo="/category/wholesale-products"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cats.map(([label, slug]) => (
            <AppLink
              key={label}
              to={`/category/${slug}`}
              className="rounded-2xl border border-border bg-card p-4 text-center text-sm shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              {label}
            </AppLink>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <SectionHeading title="How It Works" align="center" />
        <ol className="grid gap-4 sm:grid-cols-5">
          {steps.map((s, i) => (
            <li
              key={s}
              className="rounded-2xl border border-border bg-card p-5 text-sm shadow-soft"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                {i + 1}
              </span>
              <p className="mt-3 font-medium">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <SectionHeading title="Wholesale FAQs" align="center" />
        <Accordion type="single" collapsible>
          {faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
