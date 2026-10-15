import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppLink } from "./AppLink";
import { heroSlides } from "@/data/catalog";
import { cn } from "@/lib/utils";

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const total = heroSlides.length;

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  const go = (dir: number) => setIndex((i) => (i + dir + total) % total);

  return (
    <section
      aria-label="Featured collections"
      className="relative h-[440px] w-full overflow-hidden sm:h-[520px] lg:h-[620px]"
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX ?? null;
        if (start !== null && end !== null && Math.abs(end - start) > 45) go(end < start ? 1 : -1);
        touchX.current = null;
      }}
    >
      {heroSlides.map((s, i) => (
        <div
          key={s.heading}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <img
            src={s.image}
            alt={s.heading}
            width={1600}
            height={900}
            loading={i === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/55 to-foreground/10" />
          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-6 sm:px-10 lg:px-8">
              <div className="max-w-xl">
                <span className="inline-block rounded-full bg-accent/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
                  Aaradhya rose nursary
                </span>
                {i === 0 ? (
                  <h1 className="mt-4 font-display text-3xl leading-tight text-background sm:text-5xl lg:text-6xl">
                    {s.heading}
                  </h1>
                ) : (
                  <p className="mt-4 font-display text-3xl leading-tight text-background sm:text-5xl lg:text-6xl">
                    {s.heading}
                  </p>
                )}
                <p className="mt-4 max-w-md text-sm text-background/85 sm:text-base">{s.sub}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <AppLink
                    to={s.primary.to}
                    className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lift transition-transform hover:scale-[1.03]"
                  >
                    {s.primary.label}
                  </AppLink>
                  <AppLink
                    to={s.secondary.to}
                    className="rounded-full border border-background/60 px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-background/15"
                  >
                    {s.secondary.label}
                  </AppLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/25 text-background backdrop-blur transition-colors hover:bg-background/40 sm:grid"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-background/25 text-background backdrop-blur transition-colors hover:bg-background/40 sm:grid"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {heroSlides.map((s, i) => (
          <button
            key={s.heading}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-7 bg-accent" : "w-2 bg-background/60",
            )}
          />
        ))}
      </div>
    </section>
  );
}
