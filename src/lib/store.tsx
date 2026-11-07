import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { products, type Product } from "@/data/catalog";

export type CartLine = {
  slug: string;
  qty: number;
  size: string;
  pot: string;
  gift?: boolean;
};

type StoreValue = {
  cart: CartLine[];
  wishlist: string[];
  recent: string[];
  addToCart: (slug: string, qty?: number, size?: string, pot?: string) => void;
  addGiftToCart: (slugs: string[]) => void;
  removeFromCart: (line: CartLine) => void;
  setQty: (line: CartLine, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  inWishlist: (slug: string) => boolean;
  markViewed: (slug: string) => void;
  cartCount: number;
  subtotal: number;
  plantOfferDiscount: number;
  priceOf: (p: Product) => number;
};

const StoreContext = createContext<StoreValue | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(read<CartLine[]>("vr_cart", []));
    setWishlist(read<string[]>("vr_wishlist", []));
    setRecent(read<string[]>("vr_recent", []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("vr_cart", JSON.stringify(cart));
    localStorage.setItem("vr_wishlist", JSON.stringify(wishlist));
    localStorage.setItem("vr_recent", JSON.stringify(recent));
  }, [cart, wishlist, recent, hydrated]);

  const value = useMemo<StoreValue>(() => {
    const priceOf = (p: Product) => {
      if (p.offerType === "percentage")
        return Math.max(0, p.price * (1 - Number(p.offerValue || 0) / 100));
      if (p.offerType === "fixed") return Math.max(0, p.price - Number(p.offerValue || 0));
      return p.price;
    };
    const buyOffers = new Map<number, { line: CartLine; product: Product }[]>();
    for (const line of cart) {
      const product = products.find((item) => item.slug === line.slug);
      if (!product?.offerId || product.offerType !== "buy_x_get_percentage") continue;
      const entries = buyOffers.get(product.offerId) ?? [];
      entries.push({ line, product });
      buyOffers.set(product.offerId, entries);
    }
    let plantOfferDiscount = 0;
    for (const entries of buyOffers.values()) {
      const sample = entries[0]!.product;
      const buy = Math.max(1, Number(sample.offerBuyQuantity || 1));
      const reward = Math.max(1, Number(sample.offerRewardQuantity || 1));
      const total = entries.reduce((sum, entry) => sum + entry.line.qty, 0);
      let discountedUnits = Math.floor(total / (buy + reward)) * reward;
      for (const entry of [...entries].sort((a, b) => a.product.price - b.product.price)) {
        const units = Math.min(discountedUnits, entry.line.qty);
        discountedUnits -= units;
        plantOfferDiscount += units * entry.product.price * (Number(sample.offerValue || 0) / 100);
      }
    }

    return {
      cart,
      wishlist,
      recent,
      addToCart: (slug, qty = 1, size = "Medium", pot = "Nursery Pot") => {
        const product = products.find((p) => p.slug === slug);
        if (!product) return;
        setCart((prev) => {
          const existing = prev.find(
            (l) => l.slug === slug && l.size === size && l.pot === pot && !l.gift,
          );
          if (existing) {
            return prev.map((l) => (l === existing ? { ...l, qty: l.qty + qty } : l));
          }
          return [...prev, { slug, qty, size, pot }];
        });
        toast.success(`${product.name} added to cart`);
      },
      addGiftToCart: (slugs) => {
        const giftProducts = slugs
          .map((slug) => products.find((product) => product.slug === slug))
          .filter((product): product is Product => product !== undefined);
        if (giftProducts.length === 0) return;

        setCart((previous) => {
          let next = [...previous];
          giftProducts.forEach((product) => {
            const existingIndex = next.findIndex(
              (line) =>
                line.slug === product.slug &&
                line.size === product.size &&
                line.pot === product.potType &&
                line.gift === true,
            );
            if (existingIndex >= 0) {
              next = next.map((line, index) =>
                index === existingIndex ? { ...line, qty: line.qty + 1 } : line,
              );
            } else {
              next.push({
                slug: product.slug,
                qty: 1,
                size: product.size,
                pot: product.potType,
                gift: true,
              });
            }
          });
          return next;
        });
        toast.success(`${giftProducts.length}-plant gift added to cart`);
      },
      removeFromCart: (line) => {
        setCart((prev) =>
          prev.filter(
            (l) =>
              !(
                l.slug === line.slug &&
                l.size === line.size &&
                l.pot === line.pot &&
                Boolean(l.gift) === Boolean(line.gift)
              ),
          ),
        );
        toast("Removed from cart");
      },
      setQty: (line, qty) =>
        setCart((prev) =>
          prev.map((l) =>
            l.slug === line.slug &&
            l.size === line.size &&
            l.pot === line.pot &&
            Boolean(l.gift) === Boolean(line.gift)
              ? { ...l, qty: Math.max(1, Math.min(99, qty)) }
              : l,
          ),
        ),
      clearCart: () => setCart([]),
      toggleWishlist: (slug) => {
        setWishlist((prev) => {
          const has = prev.includes(slug);
          toast(has ? "Removed from wishlist" : "Saved to wishlist");
          return has ? prev.filter((s) => s !== slug) : [...prev, slug];
        });
      },
      inWishlist: (slug) => wishlist.includes(slug),
      markViewed: (slug) =>
        setRecent((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 8)),
      cartCount: cart.reduce((n, l) => n + l.qty, 0),
      subtotal: cart.reduce((sum, l) => {
        const p = products.find((x) => x.slug === l.slug);
        return sum + (p ? priceOf(p) * l.qty : 0);
      }, 0),
      plantOfferDiscount,
      priceOf,
    };
  }, [cart, wishlist, recent]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
