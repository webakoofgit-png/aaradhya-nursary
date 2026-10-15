import { createFileRoute } from "@tanstack/react-router";
import { ProductListing } from "@/components/site/ProductListing";
import { images, products } from "@/data/catalog";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({ q: String(search["q"] ?? "") }),
  head: () => ({
    meta: [
      { title: "Search Results — Aaradhya rose nursary" },
      { name: "description", content: "Search plants, seeds, pots and gardening products at Aaradhya rose nursary." },
      { property: "og:title", content: "Search — Aaradhya rose nursary" },
      { property: "og:description", content: "Find the right plant for your home or business." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const term = q.toLowerCase();
  const items = products.filter(
    (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
  );
  return (
    <ProductListing
      title={`Results for “${q}”`}
      blurb={`${items.length} matching products from our nursery catalogue.`}
      items={items}
      bannerImage={images.bannerSeasonal}
      crumbTrail={[{ label: "Search" }]}
    />
  );
}
