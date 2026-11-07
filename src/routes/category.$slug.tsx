import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductListing } from "@/components/site/ProductListing";
import { getCategory, images, products, replaceCatalogData } from "@/data/catalog";
import { getRetailCatalog } from "@/server/catalog-actions";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }: { params: { slug: string } }) => {
    const catalog = await getRetailCatalog();
    replaceCatalogData(catalog.products, catalog.categories);
    const cat = getCategory(params.slug);
    if (!cat) throw notFound();
    return { title: cat.title, blurb: cat.blurb, slug: cat.slug };
  },
  head: ({ loaderData }: { loaderData?: { title: string; blurb: string; slug: string } }) => {
    const title = loaderData
      ? `${loaderData.title} — Aaradhya rose nursary`
      : "Shop — Aaradhya rose nursary";
    const desc = loaderData?.blurb ?? "Shop plants, seeds and gardening essentials.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/category/${loaderData?.slug ?? ""}` },
      ],
      links: [{ rel: "canonical", href: `/category/${loaderData?.slug ?? ""}` }],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = getCategory(slug);
  if (!cat) return null;
  const items = products.filter(cat.match).sort((a, b) => {
    if (slug !== "indoor-plants") return 0;
    return Number(b.isClientProduct) - Number(a.isClientProduct);
  });
  return (
    <>
      {slug === "offers" ? (
        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-5 py-4 text-center text-primary-foreground">
            <p className="font-semibold">{items[0]?.offerName || "Special nursery offers"}</p>
            <p className="mt-1 text-sm">Active discounts are applied automatically in your cart.</p>
          </div>
        </div>
      ) : null}
      <ProductListing
        title={cat.title}
        blurb={cat.blurb}
        items={items}
        bannerImage={images.bannerSeasonal}
        crumbTrail={[{ label: "Shop", to: "/category/all" }, { label: cat.title }]}
      />
    </>
  );
}
