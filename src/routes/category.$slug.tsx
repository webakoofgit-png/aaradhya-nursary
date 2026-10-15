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
  return (
    <ProductListing
      title={cat.title}
      blurb={cat.blurb}
      items={products.filter(cat.match)}
      bannerImage={images.bannerSeasonal}
      crumbTrail={[{ label: "Shop", to: "/category/all" }, { label: cat.title }]}
    />
  );
}
