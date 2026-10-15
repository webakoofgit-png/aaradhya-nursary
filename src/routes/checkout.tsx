import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { AppLink } from "@/components/site/AppLink";
import { toast } from "sonner";
import { inr, useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Aaradhya rose nursary" },
      { name: "description", content: "Complete your plant order with UPI, cards, net banking or cash on delivery." },
      { property: "og:title", content: "Checkout — Aaradhya rose nursary" },
      { property: "og:description", content: "Complete your plant order with UPI, cards, net banking or cash on delivery." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: Checkout,
});

function Checkout() {
  const { subtotal, cart } = useStore();
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  return (
    <div>
      <PageHeader title="Checkout" subtitle="Secure checkout — your details are encrypted." trail={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Order placed! You will receive a confirmation shortly."); }} className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Contact & Billing</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {["Full name", "Mobile number", "Email address", "GSTIN (optional)", "Billing address", "City", "State", "PIN code"].map((f) => (
                <label key={f} className="text-sm">{f}<input className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm" /></label>
              ))}
            </div>
            <label className="mt-4 block text-sm">Order notes<textarea rows={3} className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm" /></label>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Shipping Method</h2>
            {["Standard delivery (3-7 days) — Free above ₹999", "Express delivery (2-3 days) — ₹149"].map((s) => (
              <label key={s} className="mt-3 flex items-center gap-2 text-sm"><input type="radio" name="ship" defaultChecked={s.startsWith("Standard")} className="accent-[var(--primary)]" />{s}</label>
            ))}
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Payment Method</h2>
            {["UPI", "Credit / Debit Card", "Net Banking", "Cash on Delivery"].map((s) => (
              <label key={s} className="mt-3 flex items-center gap-2 text-sm"><input type="radio" name="pay" defaultChecked={s === "UPI"} className="accent-[var(--primary)]" />{s}</label>
            ))}
          </section>
          <button type="submit" className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground">Place Order</button>
        </form>
        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg">Order Summary</h2>
          <p className="mt-2 text-sm text-muted-foreground">{cart.length} item(s) in your cart</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : inr(shipping)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold"><dt>Total</dt><dd>{inr(subtotal + shipping)}</dd></div>
          </dl>
          <AppLink to="/cart" className="mt-4 block text-center text-sm text-primary hover:underline">Back to cart</AppLink>
        </aside>
      </div>
    </div>
  );
}
