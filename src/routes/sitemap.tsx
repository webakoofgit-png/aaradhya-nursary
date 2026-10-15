import { createFileRoute } from "@tanstack/react-router";
import { AppLink } from "@/components/site/AppLink";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/sitemap")({ component: SitemapPage });

const groups = [
  [
    "Shop",
    [
      ["All Products", "/category/all"],
      ["Plants", "/category/plants"],
      ["Seeds", "/category/seeds"],
      ["Offers", "/category/offers"],
    ],
  ],
  [
    "Wholesale",
    [
      ["B2B Registration", "/wholesale/register"],
      ["B2B Login", "/wholesale/login"],
      ["Bulk Quotation", "/bulk-quote"],
    ],
  ],
  [
    "Help",
    [
      ["Contact Us", "/contact"],
      ["Track Order", "/track-order"],
      ["FAQs", "/faqs"],
      ["Shipping Policy", "/shipping-policy"],
    ],
  ],
] as const;

function SitemapPage() {
  return (
    <div>
      <PageHeader
        title="Sitemap"
        subtitle="Find every important section of Aaradhya rose nursary."
        trail={[{ label: "Sitemap" }]}
      />
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        {groups.map(([title, links]) => (
          <div key={title}>
            <h2 className="font-display text-xl text-leaf-deep">{title}</h2>
            <ul className="mt-4 space-y-3">
              {links.map(([label, to]) => (
                <li key={to}>
                  <AppLink to={to} className="text-sm text-primary hover:underline">
                    {label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
