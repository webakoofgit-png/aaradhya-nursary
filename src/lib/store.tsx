import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { products, type Product } from "@/data/catalog";

export type CartLine = {
  slug: string;
  qty: number;
  size: string;
  pot: string;
};

type StoreValue = {
  cart: CartLine[];
  wishlist: string[];
  recent: string[];
  addToCart: (slug: string, qty?: number, size?: string, pot?: string) => void;
  removeFromCart: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  inWishlist: (slug: string) => boolean;
  markViewed: (slug: string) => void;
  cartCount: number;
  subtotal: number;
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
    const priceOf = (p: Product) => p.price;

    return {
      cart,
      wishlist,
      recent,
      addToCart: (slug, qty = 1, size = "Medium", pot = "Nursery Pot") => {
        const product = products.find((p) => p.slug === slug);
        if (!product) return;
        setCart((prev) => {
          const existing = prev.find((l) => l.slug === slug && l.size === size && l.pot === pot);
          if (existing) {
            return prev.map((l) => (l === existing ? { ...l, qty: l.qty + qty } : l));
          }
          return [...prev, { slug, qty, size, pot }];
        });
        toast.success(`${product.name} added to cart`);
      },
      removeFromCart: (slug) => {
        setCart((prev) => prev.filter((l) => l.slug !== slug));
        toast("Removed from cart");
      },
      setQty: (slug, qty) =>
        setCart((prev) =>
          prev.map((l) => (l.slug === slug ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l)),
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
