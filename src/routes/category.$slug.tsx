import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductListing } from "@/components/site/ProductListing";
import { getCategory, images, products } from "@/data/catalog";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }: { params: { slug: string } }) => {
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
            <p className="font-semibold">Buy any 2 eligible plants, get 50% off the third</p>
            <p className="mt-1 text-sm">Offer applies to sale plants. The lowest priced eligible plant gets 50% off.</p>
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
