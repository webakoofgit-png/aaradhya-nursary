import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { SectionHeading } from "./SectionHeading";
import type { Product } from "@/data/catalog";

export function ProductCarousel({
  title,
  subtitle,
  viewAllTo,
  items,
}: {
  title: string;
  subtitle?: string | undefined;
  viewAllTo?: string | undefined;
  items: Product[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (items.length === 0) return null;

  const scrollBy = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading title={title} subtitle={subtitle} viewAllTo={viewAllTo} />
      <div className="relative">
        <div
          ref={ref}
          className="grid grid-cols-2 gap-3 pb-2 sm:no-scrollbar sm:flex sm:snap-x sm:snap-mandatory sm:gap-4 sm:overflow-x-auto"
        >
          {items.map((p) => (
            <div
              key={p.id}
              className="min-w-0 sm:w-[46%] sm:shrink-0 sm:snap-start lg:w-[calc(25%-0.75rem)]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        <button
          type="button"
          aria-label="Previous products"
          onClick={() => scrollBy(-1)}
          className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-card shadow-soft hover:bg-secondary lg:grid"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Next products"
          onClick={() => scrollBy(1)}
          className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-card shadow-soft hover:bg-secondary lg:grid"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
