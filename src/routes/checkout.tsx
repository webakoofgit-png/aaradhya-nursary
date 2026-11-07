import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { AppLink } from "@/components/site/AppLink";
import { inr, useStore } from "@/lib/store";
import {
  createRetailOrder,
  getCheckoutConfiguration,
  getRetailSession,
} from "@/server/retail-actions";

export const Route = createFileRoute("/checkout")({
  loader: async () => {
    const [session, config] = await Promise.all([getRetailSession(), getCheckoutConfiguration()]);
    if (!session) throw redirect({ to: "/login", search: { redirect: "/checkout" } });
    return { session, config };
  },
  head: () => ({
    meta: [
      { title: "Checkout — Aaradhya rose nursary" },
      { name: "description", content: "Complete your plant order with UPI or cash on delivery." },
      { property: "og:title", content: "Checkout — Aaradhya rose nursary" },
      { property: "og:description", content: "Complete your plant order securely." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/checkout" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: Checkout,
});

type OrderResult = {
  orderNumber: string;
  grandTotal: number;
  status: string;
  upiUrl: string | null;
};

function Checkout() {
  const { session, config } = Route.useLoaderData();
  const { subtotal, plantOfferDiscount, cart, clearCart } = useStore();
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">(
    config.upiAvailable ? "upi" : "cod",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const adjustedSubtotal = subtotal - plantOfferDiscount;
  const shipping = shippingMethod === "express" ? 149 : adjustedSubtotal >= 999 ? 0 : 79;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.length || submitting) return;
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await createRetailOrder({
        data: {
          fullName: String(form.get("fullName") || ""),
          mobile: String(form.get("mobile") || ""),
          email: String(form.get("email") || ""),
          gstNumber: String(form.get("gstNumber") || ""),
          billingAddress: String(form.get("billingAddress") || ""),
          city: String(form.get("city") || ""),
          state: String(form.get("state") || ""),
          pinCode: String(form.get("pinCode") || ""),
          notes: String(form.get("notes") || ""),
          shippingMethod,
          paymentMethod,
          lines: cart.map((line) => ({
            slug: line.slug,
            qty: line.qty,
            size: line.size,
            pot: line.pot,
          })),
        },
      });
      setOrder(result as OrderResult);
      clearCart();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not place the order. Please retry.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (order)
    return (
      <div>
        <PageHeader
          title="Order received"
          subtitle="Thank you for shopping with Aaradhya."
          trail={[{ label: "Checkout" }]}
        />
        <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Order number</p>
            <h1 className="mt-2 font-display text-3xl text-leaf-deep">{order.orderNumber}</h1>
            <p className="mt-4 text-lg font-semibold">Total: {inr(order.grandTotal)}</p>
            {order.upiUrl ? (
              <>
                <p className="mt-4 text-sm text-muted-foreground">
                  Your order is saved. Complete the UPI payment to continue processing.
                </p>
                <a
                  href={order.upiUrl}
                  className="mt-6 inline-block rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground"
                >
                  Pay {inr(order.grandTotal)} with UPI
                </a>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Cash on Delivery selected. The nursery team will confirm your order before dispatch.
              </p>
            )}
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <AppLink
                to="/account"
                className="rounded-full border border-border px-6 py-2.5 text-sm"
              >
                View my orders
              </AppLink>
              <AppLink to="/category/all" className="rounded-full bg-secondary px-6 py-2.5 text-sm">
                Continue shopping
              </AppLink>
            </div>
          </div>
        </section>
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Checkout"
        subtitle="Enter delivery details and place your order securely."
        trail={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]}
      />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <form onSubmit={submit} className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Contact & Billing</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Signed in as {String(session.user.email)}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field
                name="fullName"
                label="Full name"
                defaultValue={String(session.user.full_name)}
              />
              <Field
                name="mobile"
                label="Mobile number"
                defaultValue={String(session.user.mobile)}
                inputMode="numeric"
              />
              <Field
                name="email"
                label="Email address"
                defaultValue={String(session.user.email)}
                type="email"
              />
              <Field name="gstNumber" label="GSTIN (optional)" required={false} />
              <Field name="billingAddress" label="Billing address" />
              <Field name="city" label="City" />
              <Field name="state" label="State" />
              <Field name="pinCode" label="PIN code" inputMode="numeric" />
            </div>
            <label className="mt-4 block text-sm">
              Order notes
              <textarea
                name="notes"
                rows={3}
                maxLength={1000}
                className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm"
              />
            </label>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Shipping Method</h2>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="ship"
                checked={shippingMethod === "standard"}
                onChange={() => setShippingMethod("standard")}
                className="accent-[var(--primary)]"
              />
              Standard delivery (3–7 days) — Free on orders of ₹999 or more
            </label>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="ship"
                checked={shippingMethod === "express"}
                onChange={() => setShippingMethod("express")}
                className="accent-[var(--primary)]"
              />
              Express delivery (2–3 days) — ₹149
            </label>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-lg">Payment Method</h2>
            <label
              className={`mt-3 flex items-start gap-2 text-sm ${config.upiAvailable ? "" : "opacity-60"}`}
            >
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === "upi"}
                disabled={!config.upiAvailable}
                onChange={() => setPaymentMethod("upi")}
                className="mt-0.5 accent-[var(--primary)]"
              />
              <span>
                UPI
                {!config.upiAvailable
                  ? " — add the verified UPI ID in server settings to enable"
                  : ""}
              </span>
            </label>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="accent-[var(--primary)]"
              />
              Cash on Delivery
            </label>
          </section>
          {error ? (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          {!config.orderSchemaReady ? (
            <p
              role="status"
              className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
            >
              Online ordering will be available after the MySQL retail-order upgrade is applied.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={!cart.length || submitting || !config.orderSchemaReady}
            className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Placing order…"
              : cart.length
                ? `Place order — ${inr(adjustedSubtotal + shipping)}`
                : "Your cart is empty"}
          </button>
        </form>
        <aside className="h-fit rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg">Order Summary</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {cart.reduce((total, line) => total + line.qty, 0)} item(s) in your cart
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{inr(subtotal)}</dd>
            </div>
            {plantOfferDiscount > 0 ? (
              <div className="flex justify-between text-primary">
                <dt>Offer discount</dt>
                <dd>-{inr(plantOfferDiscount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt>Subtotal after offers</dt>
              <dd>{inr(adjustedSubtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{shipping === 0 ? "Free" : inr(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <dt>Total</dt>
              <dd>{inr(adjustedSubtotal + shipping)}</dd>
            </div>
          </dl>
          <AppLink
            to="/cart"
            className="mt-4 block text-center text-sm text-primary hover:underline"
          >
            Back to cart
          </AppLink>
        </aside>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  required = true,
  inputMode,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  inputMode?: "numeric";
}) {
  return (
    <label className="text-sm">
      {label}
      <input
        name={name}
        required={required}
        type={type}
        inputMode={inputMode}
        defaultValue={defaultValue}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
      />
    </label>
  );
}
