import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { AppLink } from "@/components/site/AppLink";
import { getProduct } from "@/data/catalog";
import { inr, useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Aaradhya rose nursary" },
      { name: "description", content: "Review the plants and gardening products in your cart before checkout." },
      { property: "og:title", content: "Your Cart — Aaradhya rose nursary" },
      { property: "og:description", content: "Review your nursery order before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, setQty, removeFromCart, subtotal, toggleWishlist, priceOf } = useStore();
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79;

  return (
    <div>
      <PageHeader title="Shopping Cart" subtitle="Review your plants before checkout." trail={[{ label: "Cart" }]} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <p className="font-display text-xl">Your cart is empty</p>
              <AppLink to="/category/all" className="mt-5 inline-block rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground">Continue Shopping</AppLink>
            </div>
          ) : (
            cart.map((line) => {
              const p = getProduct(line.slug);
              if (!p) return null;
              return (
                <div key={line.slug + line.size + line.pot} className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-2xl border border-border bg-card p-4">
                  <img src={p.image} alt={p.name} loading="lazy" className="h-22 w-22 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{line.size} · {line.pot}</p>
                    <p className="mt-1 text-sm font-semibold text-primary">{inr(priceOf(p) * line.qty)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-full border border-border">
                        <button type="button" aria-label="Decrease" onClick={() => setQty(line.slug, line.qty - 1)} className="h-9 w-9">-</button>
                        <span className="w-6 text-center text-sm">{line.qty}</span>
                        <button type="button" aria-label="Increase" onClick={() => setQty(line.slug, line.qty + 1)} className="h-9 w-9">+</button>
                      </div>
                      <button type="button" onClick={() => { toggleWishlist(line.slug); removeFromCart(line.slug); }} className="text-xs text-primary hover:underline">Move to wishlist</button>
                      <button type="button" onClick={() => removeFromCart(line.slug)} className="inline-flex items-center gap-1 text-xs text-destructive"><Trash2 size={13} /> Remove</button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg">Order Summary</h2>
          <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex gap-2">
            <label htmlFor="coupon" className="sr-only">Coupon code</label>
            <input id="coupon" placeholder="Coupon code" className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm" />
            <button type="submit" className="rounded-xl bg-secondary px-4 text-sm font-medium text-leaf-deep">Apply</button>
          </form>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : inr(shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold"><dt>Total</dt><dd>{inr(subtotal + shipping)}</dd></div>
          </dl>
          <AppLink to="/checkout" className="mt-5 block rounded-full bg-primary py-3 text-center text-sm font-medium text-primary-foreground">Proceed to Checkout</AppLink>
          <AppLink to="/category/all" className="mt-3 block rounded-full border border-border py-3 text-center text-sm">Continue Shopping</AppLink>
        </aside>
      </div>
    </div>
  );
}
