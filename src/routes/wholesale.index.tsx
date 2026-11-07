import { type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Send } from "lucide-react";
import { AppLink } from "@/components/site/AppLink";
import { SectionHeading } from "@/components/site/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { contact, faqs, images, products } from "@/data/catalog";

export const Route = createFileRoute("/wholesale/")({
  head: () => ({
    meta: [
      { title: "Wholesale Plant Supply for Businesses — Aaradhya rose nursary" },
      {
        name: "description",
        content:
          "Send a WhatsApp enquiry for bulk plants, seeds and gardening supplies for nurseries, landscapers, hotels and corporates.",
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
  "Send Your Enquiry",
  "Discuss Products and Quantity",
  "Receive a Custom Quotation",
  "Confirm Availability",
  "Coordinate Delivery",
];

const wholesaleProducts = Array.from(
  new Map(
    products
      .filter((product) => product.wholesale && product.inStock)
      .map((product) => [product.slug, product]),
  ).values(),
).sort((a, b) =>
  a.category === b.category
    ? a.name.localeCompare(b.name)
    : a.category.localeCompare(b.category),
);

function WholesalePage() {
  const submitEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedProducts = form
      .getAll("products")
      .map(String)
      .filter(Boolean);
    const requirements = String(form.get("requirements") ?? "").trim();

    if (selectedProducts.length === 0 && !requirements) {
      window.alert("Please select at least one product or describe your requirements.");
      return;
    }

    const message = [
      "Hello Aaradhya Rose Nursery, I would like to make a wholesale enquiry.",
      "",
      `Name: ${form.get("fullName")}`,
      `Phone: ${form.get("phone")}`,
      `Business: ${form.get("businessName")}`,
      `Business type: ${form.get("businessType")}`,
      `City: ${form.get("city")}`,
      `Selected products: ${selectedProducts.length ? selectedProducts.join(", ") : "Not selected"}`,
      `Additional requirements: ${requirements || "None"}`,
      `Approximate quantity: ${form.get("quantity") || "Not specified"}`,
      `Budget: ${form.get("budget") || "Not specified"}`,
    ].join("\n");

    window.open(`${contact.whatsappHref}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

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
            <a
              href="#enquiry"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              Send Wholesale Enquiry
            </a>
          </div>
        </div>
      </section>

      <section id="enquiry" className="scroll-mt-32 bg-secondary/60 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="self-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              No login or account required
            </p>
            <h2 className="mt-3 font-display text-3xl text-leaf-deep sm:text-4xl">
              Tell us what your business needs
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Fill in this short form and WhatsApp will open with your enquiry already prepared.
              Our nursery team will reply with availability, bulk pricing and delivery details.
            </p>
            <p className="mt-4 text-sm font-medium text-leaf-deep">
              WhatsApp: {contact.whatsapp}
            </p>
          </div>

          <form
            onSubmit={submitEnquiry}
            className="grid gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft sm:grid-cols-2 sm:p-7"
          >
            <label className="text-sm font-medium">
              Your name
              <input
                name="fullName"
                required
                autoComplete="name"
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>
            <label className="text-sm font-medium">
              WhatsApp number
              <input
                name="phone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>
            <label className="text-sm font-medium">
              Business name
              <input
                name="businessName"
                required
                autoComplete="organization"
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>
            <label className="text-sm font-medium">
              Business type
              <select
                name="businessType"
                required
                defaultValue=""
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
              >
                <option value="" disabled>Select business type</option>
                {whoCan.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              City / delivery location
              <input
                name="city"
                required
                autoComplete="address-level2"
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Select products
              <details className="mt-1.5 rounded-xl border border-border bg-background open:pb-2">
                <summary className="cursor-pointer select-none px-3 py-3 text-sm font-normal text-muted-foreground">
                  Choose one or more products
                </summary>
                <div className="grid max-h-64 gap-2 overflow-y-auto border-t border-border px-3 py-3 sm:grid-cols-2">
                  {wholesaleProducts.map((product) => (
                    <label
                      key={product.slug}
                      className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm font-normal hover:bg-secondary"
                    >
                      <input
                        type="checkbox"
                        name="products"
                        value={`${product.name} (${product.category})`}
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <span>
                        <span className="block font-medium text-foreground">{product.name}</span>
                        <span className="text-xs text-muted-foreground">{product.category}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </details>
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Additional products or requirements
              <textarea
                name="requirements"
                rows={4}
                placeholder="Example: 100 indoor plants for an office, including pots or any product not listed above"
                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
              />
            </label>
            <label className="text-sm font-medium">
              Approximate quantity
              <input
                name="quantity"
                placeholder="Example: 100 plants"
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>
            <label className="text-sm font-medium">
              Approximate budget
              <input
                name="budget"
                placeholder="Example: ₹25,000"
                className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-leaf-deep sm:col-span-2"
            >
              <Send size={17} /> Continue on WhatsApp
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
            title="Who We Supply"
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
