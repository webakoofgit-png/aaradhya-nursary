import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, Sprout, User, X } from "lucide-react";
import { AppLink } from "./AppLink";
import { brand, categoryPages, megaMenus, products } from "@/data/catalog";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/category/all" },
  { label: "Plants", to: "/category/plants", menu: "plants" as const },
  { label: "Seeds", to: "/category/seeds", menu: "seeds" as const },
  { label: "Gardening", to: "/category/plant-care", menu: "gardening" as const },
  { label: "Offers", to: "/category/offers" },
  { label: "About Us", to: "/about" },
  { label: "Blogs", to: "/blogs" },
  { label: "Contact Us", to: "/contact" },
];

export function Header() {
  const { cartCount, wishlist } = useStore();
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accordion, setAccordion] = useState<string | null>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s: { location: { pathname: string } }) => s.location.pathname,
  });
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setQuery("");
  }, [pathname]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { items: [], cats: [] };
    return {
      items: products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5),
      cats: categoryPages.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [query]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate({ to: "/search", search: { q: query.trim() } });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <Sprout size={20} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-semibold leading-tight text-leaf-deep">
              {brand.name}
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              {brand.tagline}
            </span>
          </span>
        </Link>

        <div ref={boxRef} className="relative hidden lg:block">
          <form onSubmit={submitSearch} role="search">
            <label htmlFor="site-search" className="sr-only">
              Search plants, seeds and gardening products
            </label>
            <input
              id="site-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plants, seeds, pots, tools…"
              className="h-11 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </form>
          {suggestions.items.length + suggestions.cats.length > 0 ? (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
              {suggestions.cats.map((c) => (
                <AppLink
                  key={c.slug}
                  to={`/category/${c.slug}`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary"
                >
                  <Search size={14} className="text-muted-foreground" /> {c.title}
                  <span className="ml-auto text-xs text-muted-foreground">Category</span>
                </AppLink>
              ))}
              {suggestions.items.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-secondary"
                >
                  <img
                    src={p.image}
                    alt=""
                    className="h-9 w-9 rounded-lg object-cover"
                    loading="lazy"
                  />
                  <span className="min-w-0 truncate">{p.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{p.category}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            to="/account"
            aria-label="Account"
            className="hidden h-10 w-10 place-items-center rounded-full hover:bg-secondary sm:grid"
          >
            <User size={19} />
          </Link>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-10 w-10 place-items-center rounded-full hover:bg-secondary sm:grid"
          >
            <Heart size={19} />
            {wishlist.length > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                {wishlist.length}
              </span>
            ) : null}
          </Link>
          <Link
            to="/cart"
            aria-label="Shopping cart"
            className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-secondary"
          >
            <ShoppingCart size={19} />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            to="/wholesale/register"
            className="hidden rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/85 md:inline-flex"
          >
            B2B / Wholesale
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-secondary lg:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <nav aria-label="Main" className="hidden border-t border-border bg-card lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
          {navLinks.map((l) => (
            <li
              key={l.label}
              className="relative"
              onMouseEnter={() => setOpenMenu(l.menu ?? null)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <AppLink
                to={l.to}
                className={cn(
                  "flex items-center gap-1 px-3 py-3 text-sm font-medium text-foreground transition-colors hover:text-primary",
                  pathname === l.to && "text-primary",
                )}
              >
                {l.label}
                {l.menu ? <ChevronDown size={14} aria-hidden="true" /> : null}
              </AppLink>
              {l.menu && openMenu === l.menu ? (
                <div className="absolute left-0 top-full z-50 w-[560px] rounded-2xl border border-border bg-card p-5 shadow-lift">
                  <p className="mb-3 font-display text-base text-leaf-deep">
                    {megaMenus[l.menu].label}
                  </p>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {megaMenus[l.menu].items.map((item) => {
                      const [label, slug] = item.split("|");
                      return (
                        <li key={slug}>
                          <AppLink
                            to={`/category/${slug}`}
                            className="block rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                          >
                            {label}
                          </AppLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>

      {mobileOpen && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[60] lg:hidden">
              <button
                type="button"
                aria-label="Close menu overlay"
                className="absolute inset-0 bg-foreground/40"
                onClick={() => setMobileOpen(false)}
              />
              <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-display text-lg text-leaf-deep">{brand.name}</span>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setMobileOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={submitSearch} role="search" className="relative mb-4">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products…"
                    aria-label="Search products"
                    className="h-11 w-full rounded-full border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
                  />
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </form>

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <AppLink
                    to="/category/all"
                    className="rounded-full bg-primary px-3 py-2.5 text-center text-sm font-medium text-primary-foreground"
                  >
                    Retail Shop
                  </AppLink>
                  <AppLink
                    to="/wholesale/register"
                    className="rounded-full bg-accent px-3 py-2.5 text-center text-sm font-semibold text-accent-foreground"
                  >
                    B2B Registration
                  </AppLink>
                </div>

                <ul className="flex flex-col">
                  {navLinks.map((l) => (
                    <li key={l.label} className="border-b border-border/70">
                      {l.menu ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setAccordion(accordion === l.menu ? null : (l.menu ?? null))
                            }
                            className="flex w-full items-center justify-between py-3 text-sm font-medium"
                            aria-expanded={accordion === l.menu}
                          >
                            {l.label}
                            <ChevronDown
                              size={16}
                              className={cn(
                                "transition-transform",
                                accordion === l.menu && "rotate-180",
                              )}
                            />
                          </button>
                          {accordion === l.menu ? (
                            <ul className="pb-3">
                              {megaMenus[l.menu].items.map((item) => {
                                const [label, slug] = item.split("|");
                                return (
                                  <li key={slug}>
                                    <AppLink
                                      to={`/category/${slug}`}
                                      className="block py-2 pl-3 text-sm text-muted-foreground"
                                    >
                                      {label}
                                    </AppLink>
                                  </li>
                                );
                              })}
                            </ul>
                          ) : null}
                        </>
                      ) : (
                        <AppLink to={l.to} className="block py-3 text-sm font-medium">
                          {l.label}
                        </AppLink>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                  <AppLink to="/account" className="rounded-xl bg-secondary py-3">
                    Account
                  </AppLink>
                  <AppLink to="/wishlist" className="rounded-xl bg-secondary py-3">
                    Wishlist ({wishlist.length})
                  </AppLink>
                  <AppLink to="/cart" className="rounded-xl bg-secondary py-3">
                    Cart ({cartCount})
                  </AppLink>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
