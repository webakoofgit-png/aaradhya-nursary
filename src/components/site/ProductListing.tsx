import { useMemo, useState } from "react";
import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { ProductCard } from "./ProductCard";
import { Stars } from "./Stars";
import { AppLink } from "./AppLink";
import { inr, useStore } from "@/lib/store";
import { products, type Product } from "@/data/catalog";
import { cn } from "@/lib/utils";

type Filters = {
  categories: string[];
  maxPrice: number;
  placement: string[];
  sunlight: string[];
  water: string[];
  size: string[];
  potSize: string[];
  inStockOnly: boolean;
  minRating: number;
  channel: string[];
  discounted: boolean;
  newOnly: boolean;
};

const empty: Filters = {
  categories: [],
  maxPrice: 5000,
  placement: [],
  sunlight: [],
  water: [],
  size: [],
  potSize: [],
  inStockOnly: false,
  minRating: 0,
  channel: [],
  discounted: false,
  newOnly: false,
};

const uniq = (arr: string[]) => Array.from(new Set(arr));

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-muted-foreground hover:text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--primary)]"
      />
      {label}
    </label>
  );
}

export function ProductListing({
  title,
  blurb,
  items,
  bannerImage,
  crumbTrail,
}: {
  title: string;
  blurb: string;
  items: Product[];
  bannerImage: string;
  crumbTrail: { label: string; to?: string }[];
}) {
  const { priceOf } = useStore();
  const [filters, setFilters] = useState<Filters>(empty);
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [visible, setVisible] = useState(9);
  const [drawer, setDrawer] = useState(false);

  const categories = uniq(products.map((p) => p.category)).sort();
  const potSizes = uniq(products.map((p) => p.potSize));

  const toggle = (key: keyof Filters, value: string) =>
    setFilters((f) => {
      const list = f[key] as string[];
      return {
        ...f,
        [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });

  const filtered = useMemo(() => {
    let out = items.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (priceOf(p) > filters.maxPrice) return false;
      if (filters.placement.length && !filters.placement.includes(p.placement)) return false;
      if (filters.sunlight.length && !filters.sunlight.includes(p.sunlight)) return false;
      if (filters.water.length && !filters.water.includes(p.water)) return false;
      if (filters.size.length && !filters.size.includes(p.size)) return false;
      if (filters.potSize.length && !filters.potSize.includes(p.potSize)) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      if (p.rating < filters.minRating) return false;
      if (filters.channel.includes("Wholesale") && !p.wholesale) return false;
      if (filters.discounted && (p.mrp - p.price) / p.mrp < 0.3) return false;
      if (filters.newOnly && !p.groups.includes("new")) return false;
      return true;
    });

    out = [...out];
    if (sort === "price-asc") out.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price-desc") out.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "rating") out.sort((a, b) => b.rating - a.rating);
    if (sort === "newest") out.sort((a, b) => Number(b.groups.includes("new")) - Number(a.groups.includes("new")));
    return out;
  }, [items, filters, sort, priceOf]);

  const FilterPanel = (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Filters</h3>
          <button
            type="button"
            onClick={() => setFilters(empty)}
            className="text-xs text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Category</legend>
        {categories.map((c) => (
          <Check
            key={c}
            label={c}
            checked={filters.categories.includes(c)}
            onChange={() => toggle("categories", c)}
          />
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Price up to {inr(filters.maxPrice)}</legend>
        <input
          type="range"
          min={50}
          max={5000}
          step={50}
          value={filters.maxPrice}
          aria-label="Maximum price"
          onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
          className="w-full accent-[var(--primary)]"
        />
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Indoor / Outdoor</legend>
        {["Indoor", "Outdoor"].map((v) => (
          <Check key={v} label={v} checked={filters.placement.includes(v)} onChange={() => toggle("placement", v)} />
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Sunlight</legend>
        {["Bright Indirect", "Full Sun", "Partial Shade", "Low Light"].map((v) => (
          <Check key={v} label={v} checked={filters.sunlight.includes(v)} onChange={() => toggle("sunlight", v)} />
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Water Requirement</legend>
        {["Low", "Medium", "High"].map((v) => (
          <Check key={v} label={v} checked={filters.water.includes(v)} onChange={() => toggle("water", v)} />
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Plant Size</legend>
        {["Small", "Medium", "Large"].map((v) => (
          <Check key={v} label={v} checked={filters.size.includes(v)} onChange={() => toggle("size", v)} />
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Pot Size</legend>
        {potSizes.map((v) => (
          <Check key={v} label={v} checked={filters.potSize.includes(v)} onChange={() => toggle("potSize", v)} />
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Buying Channel</legend>
        {["Retail", "Wholesale"].map((v) => (
          <Check key={v} label={v} checked={filters.channel.includes(v)} onChange={() => toggle("channel", v)} />
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold">Rating</legend>
        {[4.5, 4, 3.5].map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-muted-foreground">
            <input
              type="radio"
              name="rating"
              checked={filters.minRating === r}
              onChange={() => setFilters((f) => ({ ...f, minRating: r }))}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <Stars rating={r} size={12} /> &amp; up
          </label>
        ))}
      </fieldset>

      <fieldset className="space-y-1">
        <legend className="mb-1 text-sm font-semibold">More</legend>
        <Check
          label="In stock only"
          checked={filters.inStockOnly}
          onChange={(v) => setFilters((f) => ({ ...f, inStockOnly: v }))}
        />
        <Check
          label="30% or more off"
          checked={filters.discounted}
          onChange={(v) => setFilters((f) => ({ ...f, discounted: v }))}
        />
        <Check
          label="New arrivals"
          checked={filters.newOnly}
          onChange={(v) => setFilters((f) => ({ ...f, newOnly: v }))}
        />
      </fieldset>
    </div>
  );

  return (
    <div>
      <div className="relative h-44 w-full overflow-hidden sm:h-56">
        <img src={bannerImage} alt={title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/25" />
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-7xl flex-col justify-center gap-2 px-4 sm:px-6 lg:px-8">
            <div className="text-background/85">
              <Breadcrumbs trail={crumbTrail} />
            </div>
            <h1 className="font-display text-2xl text-background sm:text-4xl">{title}</h1>
            <p className="max-w-xl text-sm text-background/85">{blurb}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-40 rounded-2xl border border-border bg-card p-5">{FilterPanel}</div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Showing <strong className="text-foreground">{Math.min(visible, filtered.length)}</strong> of{" "}
              {filtered.length} products
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawer(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm lg:hidden"
              >
                <SlidersHorizontal size={15} /> Filters
              </button>
              <label className="sr-only" htmlFor="sort">
                Sort products
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 rounded-full border border-border bg-card px-4 text-sm outline-none focus:border-primary"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest First</option>
              </select>
              <div className="hidden overflow-hidden rounded-full border border-border sm:flex">
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setView("grid")}
                  className={cn("grid h-10 w-10 place-items-center", view === "grid" && "bg-secondary text-primary")}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setView("list")}
                  className={cn("grid h-10 w-10 place-items-center", view === "list" && "bg-secondary text-primary")}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <p className="font-display text-xl">No products match these filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening the price range or clearing a few filters.
              </p>
              <button
                type="button"
                onClick={() => setFilters(empty)}
                className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div
              className={cn(
                view === "grid"
                  ? "grid grid-cols-2 gap-4 lg:grid-cols-3"
                  : "flex flex-col gap-4",
              )}
            >
              {filtered.slice(0, visible).map((p) => (
                <div key={p.id} className={view === "list" ? "max-w-2xl" : undefined}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {visible < filtered.length ? (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + 9)}
                className="rounded-full border border-primary/30 bg-card px-7 py-3 text-sm font-medium text-primary hover:bg-secondary"
              >
                Load More Products
              </button>
            </div>
          ) : (
            <p className="mt-10 text-center text-sm text-muted-foreground">
              You have seen everything here.{" "}
              <AppLink to="/category/all" className="text-primary hover:underline">
                Browse all products
              </AppLink>
            </p>
          )}
        </div>
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters overlay"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[88%] max-w-sm overflow-y-auto bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg">Filters</span>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setDrawer(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>
            {FilterPanel}
            <button
              type="button"
              onClick={() => setDrawer(false)}
              className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
            >
              Show {filtered.length} products
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}