import { useEffect, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Heart, Share2, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { AppLink } from "@/components/site/AppLink";
import { Stars } from "@/components/site/Stars";
import { ProductCarousel } from "@/components/site/ProductCarousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProduct, products } from "@/data/catalog";
import { inr, useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }: { params: { slug: string } }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return { name: p.name, description: p.description, slug: p.slug };
  },
  head: ({ loaderData }: { loaderData?: { name: string; description: string; slug: string } }) => {
    const title = loaderData
      ? `${loaderData.name} — Aaradhya rose nursary`
      : "Product — Aaradhya rose nursary";
    const desc = loaderData?.description ?? "Nursery grown plants delivered across India.";
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 155) },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${loaderData?.slug ?? ""}` },
      ],
      links: [{ rel: "canonical", href: `/product/${loaderData?.slug ?? ""}` }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const product = getProduct(slug);
  const { addToCart, toggleWishlist, inWishlist, priceOf, markViewed, recent } = useStore();
  const [qty, setQty] = useState(1);
  const size = "3 inch";
  const [pot, setPot] = useState("Nursery Pot");
  const [active, setActive] = useState(0);
  const [pin, setPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");

  useEffect(() => {
    if (product) markViewed(product.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!product) return null;
  const gallery = [product.image, product.hoverImage, product.image];
  const price = priceOf(product);
  const similar = products
    .filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug)
    .slice(0, 8);
  const fbt = products.filter((p) => p.groups.includes("essentials")).slice(0, 3);
  const recentItems = recent
    .map((s) => getProduct(s))
    .filter(Boolean)
    .slice(0, 8) as typeof products;

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          trail={[
            { label: "Shop", to: "/category/all" },
            { label: product.category, to: `/category/${product.categorySlug}` },
            { label: product.name },
          ]}
        />
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-3xl border border-border bg-card">
              <img
                src={gallery[active]}
                alt={product.name}
                width={800}
                height={800}
                className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
            <div className="mt-4 flex gap-3">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`h-20 w-20 overflow-hidden rounded-xl border ${i === active ? "border-primary" : "border-border"}`}
                >
                  <img src={g} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h1 className="font-display text-3xl text-leaf-deep">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Stars rating={product.rating} />{" "}
              <span>
                {product.rating} · {product.reviews} reviews
              </span>
              <span>SKU: {product.id}</span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-primary">{inr(price)}</span>
              <span className="text-sm text-muted-foreground line-through">{inr(product.mrp)}</span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-leaf-deep">
                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Wholesale price {inr(product.wholesalePrice)} · visible to approved B2B accounts (MOQ{" "}
              {product.moq})
            </p>
            <p
              className={`mt-2 text-sm font-medium ${product.inStock ? "text-primary" : "text-destructive"}`}
            >
              {product.inStock ? "In stock — ships in 24 hours" : "Currently out of stock"}
            </p>

            <div className="mt-6 grid gap-4">
              <p className="text-sm">
                Available sizes: <span className="font-medium">3 inch / 4 inch / 5 inch</span>
              </p>
              <label className="text-sm">
                Pot option
                <select
                  value={pot}
                  onChange={(e) => setPot(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
                >
                  {[
                    "Nursery Pot",
                    "Terracotta Pot",
                    "Ceramic Planter",
                    "Self Watering Planter",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-border">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-11 w-11"
                >
                  -
                </button>
                <span className="w-8 text-center">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => q + 1)}
                  className="h-11 w-11"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                disabled={!product.inStock}
                onClick={() => addToCart(product.slug, qty, size, pot)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-leaf-deep disabled:opacity-50"
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
              <button
                type="button"
                disabled={!product.inStock}
                onClick={() => addToCart(product.slug, qty, size, pot)}
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.slug)}
                aria-label="Add to wishlist"
                className="grid h-11 w-11 place-items-center rounded-full border border-border hover:bg-secondary"
              >
                <Heart
                  size={17}
                  className={inWishlist(product.slug) ? "fill-destructive text-destructive" : ""}
                />
              </button>
              <button
                type="button"
                onClick={() => toast.success("Product link copied to clipboard")}
                aria-label="Share product"
                className="grid h-11 w-11 place-items-center rounded-full border border-border hover:bg-secondary"
              >
                <Share2 size={17} />
              </button>
            </div>
            <AppLink
              to="/wholesale/register"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/85"
            >
              B2B / Wholesale
            </AppLink>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPinMsg(
                  /^\d{6}$/.test(pin)
                    ? `Delivery available to ${pin} — estimated in 3 to 5 days.`
                    : "Please enter a valid 6-digit PIN code.",
                );
              }}
              className="mt-6 rounded-2xl border border-border bg-card p-4"
            >
              <label htmlFor="pin" className="text-sm font-medium">
                Check delivery availability
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="pin"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN code"
                  maxLength={6}
                  className="h-11 flex-1 rounded-xl border border-border bg-background px-3 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
                >
                  Check
                </button>
              </div>
              {pinMsg ? <p className="mt-2 text-sm text-muted-foreground">{pinMsg}</p> : null}
            </form>

            <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <Truck size={16} className="text-primary" /> Free delivery above ₹999
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" /> 100% secure checkout
              </p>
            </div>

            <Accordion type="single" collapsible className="mt-8" defaultValue="desc">
              <AccordionItem value="desc">
                <AccordionTrigger>Product Description</AccordionTrigger>
                <AccordionContent>{product.description}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger>Plant Care Guide</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-1 pl-5">
                    {product.care.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="spec">
                <AccordionTrigger>Specifications</AccordionTrigger>
                <AccordionContent>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    <li>Botanical name: {product.botanical}</li>
                    <li>Plant height: {product.size}</li>
                    <li>Pot size: {product.potSize}</li>
                    <li>Sunlight: {product.sunlight}</li>
                    <li>Watering: {product.water}</li>
                    <li>Difficulty: {product.difficulty}</li>
                    <li>Pet safe: {product.petSafe ? "Yes" : "No"}</li>
                    <li>Suitable location: {product.placement}</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ship">
                <AccordionTrigger>Shipping Information</AccordionTrigger>
                <AccordionContent>
                  Dispatched within 24 hours in ventilated, shock-proof cartons. Delivery in 3 to 7
                  days across 20,000+ pin codes.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ret">
                <AccordionTrigger>Return Policy</AccordionTrigger>
                <AccordionContent>
                  Share an unboxing photo within 48 hours of delivery for a free replacement or
                  refund on damaged plants.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="rev">
                <AccordionTrigger>Reviews ({product.reviews})</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {[
                      { n: "Priya S.", t: "Arrived healthy and well packed. Growing beautifully." },
                      { n: "Arun M.", t: "Great quality for the price, will order again." },
                    ].map((r) => (
                      <div key={r.n}>
                        <Stars rating={5} size={13} />
                        <p className="text-sm font-medium">
                          {r.n} <span className="text-xs text-primary">Verified buyer</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{r.t}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      <ProductCarousel
        title="Frequently Bought Together"
        subtitle="Complete your order with these essentials"
        items={fbt}
      />
      <ProductCarousel
        title="Similar Products"
        subtitle="More from this category"
        items={similar}
        viewAllTo={`/category/${product.categorySlug}`}
      />
      {recentItems.length > 1 ? (
        <ProductCarousel title="Recently Viewed" items={recentItems} />
      ) : null}
    </div>
  );
}
