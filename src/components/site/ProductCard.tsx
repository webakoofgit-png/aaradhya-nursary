import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Eye, Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Stars } from "./Stars";
import { inr, useStore } from "@/lib/store";
import type { Product } from "@/data/catalog";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, inWishlist, priceOf } = useStore();
  const [qty, setQty] = useState(1);
  const [quick, setQuick] = useState(false);
  const price = priceOf(product);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const wished = inWishlist(product.slug);

  return (
    <>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
        <div className="relative overflow-hidden bg-secondary/40">
          <Link to="/product/$slug" params={{ slug: product.slug }} aria-label={product.name}>
            <img
              src={product.image}
              alt={`${product.name} — ${product.category}`}
              loading="lazy"
              width={800}
              height={800}
              className="aspect-square w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
            <img
              src={product.hoverImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={800}
              height={800}
              className="absolute inset-0 aspect-square w-full scale-105 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
            {discount > 0 ? (
              <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
                {discount}% OFF
              </span>
            ) : null}
            {product.groups.includes("new") ? (
              <span className="rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-background">
                New
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => toggleWishlist(product.slug)}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-foreground shadow-soft transition-colors hover:bg-card"
          >
            <Heart size={16} className={cn(wished && "fill-destructive text-destructive")} />
          </button>

          <button
            type="button"
            onClick={() => setQuick(true)}
            className="absolute inset-x-3 bottom-3 hidden items-center justify-center gap-2 rounded-full bg-card/95 py-2 text-sm font-medium text-foreground shadow-soft transition-all group-hover:flex"
          >
            <Eye size={15} /> Quick View
          </button>

          {!product.inStock ? (
            <div className="absolute inset-0 grid place-items-center bg-background/70">
              <span className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background">
                Out of Stock
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {product.category}
          </p>
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary"
          >
            {product.name}
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Stars rating={product.rating} size={13} />
            <span>({product.reviews})</span>
          </div>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-lg font-semibold text-primary">{inr(price)}</span>
            <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[auto_minmax(0,1fr)]">
            <div className="flex items-center justify-between rounded-full border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-8 place-items-center text-muted-foreground hover:text-primary"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-medium">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="grid h-9 w-8 place-items-center text-muted-foreground hover:text-primary"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => addToCart(product.slug, qty)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-leaf-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={15} /> Add
            </button>
          </div>
        </div>
      </article>

      <Dialog open={quick} onOpenChange={setQuick}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{product.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 sm:grid-cols-2">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="aspect-square w-full rounded-xl object-cover"
            />
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Stars rating={product.rating} /> <span>({product.reviews} reviews)</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-primary">{inr(price)}</span>
                <span className="text-sm text-muted-foreground line-through">
                  {inr(product.mrp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <li>Sunlight: {product.sunlight}</li>
                <li>Water: {product.water}</li>
                <li>Pot: {product.potSize}</li>
                <li>Care: {product.difficulty}</li>
              </ul>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={() => {
                    addToCart(product.slug, qty);
                    setQuick(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-leaf-deep disabled:opacity-50"
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  onClick={() => setQuick(false)}
                  className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Full Details
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
