import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Gift, Search, ShoppingCart, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { products } from "@/data/catalog";
import { inr, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gifts")({
  head: () => ({
    meta: [
      { title: "Plant Gifts — Aaradhya rose nursary" },
      {
        name: "description",
        content: "Build a personalised plant gift by choosing the gift size and plants.",
      },
      { property: "og:title", content: "Build a Plant Gift — Aaradhya rose nursary" },
      {
        property: "og:description",
        content: "Choose how many plants to gift, then select the perfect plants.",
      },
    ],
    links: [{ rel: "canonical", href: "/gifts" }],
  }),
  component: GiftBuilderPage,
});

const giftSizes = [2, 3, 4, 5, 6];

function GiftBuilderPage() {
  const navigate = useNavigate();
  const { addGiftToCart } = useStore();
  const [giftSize, setGiftSize] = useState(3);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const giftPlants = useMemo(
    () =>
      products.filter(
        (product) =>
          product.inStock &&
          product.isClientProduct &&
          ["indoor-plants", "outdoor-plants", "flowering-plants"].includes(product.categorySlug),
      ),
    [],
  );

  const visiblePlants = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return giftPlants;
    return giftPlants.filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term),
    );
  }, [giftPlants, query]);

  const selectedProducts = selected
    .map((slug) => giftPlants.find((product) => product.slug === slug))
    .filter((product): product is (typeof giftPlants)[number] => product !== undefined);
  const total = selectedProducts.reduce((sum, product) => sum + product.price, 0);
  const complete = selected.length === giftSize;

  const chooseGiftSize = (size: number) => {
    setGiftSize(size);
    setSelected((current) => current.slice(0, size));
  };

  const togglePlant = (slug: string) => {
    setSelected((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      if (current.length >= giftSize) return current;
      return [...current, slug];
    });
  };

  const addGift = () => {
    if (!complete) return;
    addGiftToCart(selected);
    void navigate({ to: "/cart" });
  };

  return (
    <div>
      <PageHeader
        title="Build a Plant Gift"
        subtitle="Choose the gift size, then pick the plants they will love."
        trail={[{ label: "Plant Gifts" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-10">
            <section aria-labelledby="gift-size-heading">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  1
                </span>
                <div>
                  <h2 id="gift-size-heading" className="font-display text-2xl text-leaf-deep">
                    How many plants would you like to gift?
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select a gift size. You can change it before adding the gift to your cart.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {giftSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => chooseGiftSize(size)}
                    aria-pressed={giftSize === size}
                    className={cn(
                      "rounded-2xl border bg-card px-3 py-4 text-center transition",
                      giftSize === size
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <span className="block font-display text-2xl text-leaf-deep">{size}</span>
                    <span className="text-xs text-muted-foreground">plants</span>
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="choose-plants-heading">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    2
                  </span>
                  <div>
                    <h2 id="choose-plants-heading" className="font-display text-2xl text-leaf-deep">
                      Choose {giftSize} plants
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selected.length} of {giftSize} selected
                    </p>
                  </div>
                </div>
                <label className="relative block sm:w-72">
                  <span className="sr-only">Search gift plants</span>
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search plants"
                    className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(selected.length / giftSize) * 100}%` }}
                />
              </div>

              {visiblePlants.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                  No gift plants match your search.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {visiblePlants.map((product) => {
                    const isSelected = selected.includes(product.slug);
                    const isDisabled = !isSelected && selected.length >= giftSize;
                    return (
                      <button
                        key={product.slug}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => togglePlant(product.slug)}
                        aria-pressed={isSelected}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border bg-card text-left transition",
                          isSelected
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft",
                          isDisabled && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <div className="relative aspect-square overflow-hidden bg-secondary">
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <span
                            className={cn(
                              "absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border-2 shadow-sm transition",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-white bg-white/90 text-transparent",
                            )}
                          >
                            <Check size={16} />
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">
                            {product.name}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-primary">
                            {inr(product.price)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-border bg-card p-5 shadow-soft lg:sticky lg:top-40">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/20 text-leaf-deep">
                <Gift size={21} />
              </span>
              <div>
                <p className="font-display text-lg text-leaf-deep">Your plant gift</p>
                <p className="text-xs text-muted-foreground">
                  {selected.length} of {giftSize} plants selected
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {selectedProducts.length === 0 ? (
                <div className="rounded-2xl bg-secondary/70 p-5 text-center text-sm text-muted-foreground">
                  Your selected plants will appear here.
                </div>
              ) : (
                selectedProducts.map((product) => (
                  <div key={product.slug} className="flex items-center gap-3">
                    <img src={product.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{product.name}</p>
                      <p className="text-xs text-primary">{inr(product.price)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePlant(product.slug)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Gift total</span>
              <span className="font-display text-xl text-leaf-deep">{inr(total)}</span>
            </div>
            <button
              type="button"
              disabled={!complete}
              onClick={addGift}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-leaf-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart size={17} />
              {complete ? "Add gift to cart" : `Choose ${giftSize - selected.length} more`}
            </button>
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-accent" />
              Each selected plant will be marked as a gift item in your cart.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
