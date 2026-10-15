import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { AppLink } from "@/components/site/AppLink";
import { getProduct } from "@/data/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Aaradhya rose nursary" },
      { name: "description", content: "Plants and gardening products you have saved for later." },
      { property: "og:title", content: "Wishlist — Aaradhya rose nursary" },
      { property: "og:description", content: "Your saved plants and products." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStore();
  const items = wishlist.map(getProduct).filter(Boolean);

  return (
    <div>
      <PageHeader title="My Wishlist" subtitle="Everything you have saved for later." trail={[{ label: "Wishlist" }]} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-display text-xl">No saved products yet</p>
            <AppLink to="/category/all" className="mt-5 inline-block rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Start Shopping</AppLink>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items.map((p) => (p ? <ProductCard key={p.id} product={p} /> : null))}
          </div>
        )}
      </div>
    </div>
  );
}
