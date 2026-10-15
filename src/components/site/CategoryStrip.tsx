import { AppLink } from "./AppLink";
import { homeCategories } from "@/data/catalog";

export function CategoryStrip() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold sm:text-3xl">Shop by Category</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you need for a healthy, thriving garden.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5 sm:gap-6 lg:grid-cols-10">
        {homeCategories.map((c) => (
          <AppLink key={c.slug} to={`/category/${c.slug}`} className="group min-w-0 text-center">
            <span className="mx-auto grid aspect-square w-full max-w-[110px] place-items-center overflow-hidden rounded-full bg-leaf-soft transition-colors group-hover:bg-beige">
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                width={800}
                height={800}
                className="h-full w-full scale-95 object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </span>
            <span className="mt-3 block text-xs font-medium text-foreground group-hover:text-primary sm:text-sm">
              {c.title}
            </span>
          </AppLink>
        ))}
      </div>
    </section>
  );
}
