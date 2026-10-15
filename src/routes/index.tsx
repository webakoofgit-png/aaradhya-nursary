import { createFileRoute } from "@tanstack/react-router";
import { Leaf, ShieldCheck, Package, Truck, Lock, Store, Sprout, Building2 } from "lucide-react";
import { HeroSlider } from "@/components/site/HeroSlider";
import { CategoryStrip } from "@/components/site/CategoryStrip";
import { ProductCarousel } from "@/components/site/ProductCarousel";
import { SectionHeading } from "@/components/site/SectionHeading";
import { AppLink } from "@/components/site/AppLink";
import { Stars } from "@/components/site/Stars";
import {
  blogs,
  byCategory,
  byGroup,
  images,
  products,
  requirementShortcuts,
  testimonials,
  trustFeatures,
} from "@/data/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aaradhya rose nursary — Buy Plants, Seeds & Garden Supplies" },
      {
        name: "description",
        content:
          "Nursery-grown plants, premium seeds, pots and gardening essentials delivered across India. Retail shopping and wholesale B2B pricing.",
      },
      { property: "og:title", content: "Aaradhya rose nursary — Plants, Seeds & Gardening" },
      {
        property: "og:description",
        content:
          "Healthy plants delivered safely across India. Retail and wholesale nursery supply.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const icons: Record<string, typeof Leaf> = { ShieldCheck, Package, Truck, Lock, Leaf, Store };

function Home() {
  return (
    <>
      <HeroSlider />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
        {[
          {
            title: "Shop for Home & Garden",
            sub: "Retail Store",
            desc: "Buy individual plants, seeds and gardening products.",
            cta: "Shop Retail",
            to: "/category/all",
            icon: Sprout,
            img: images.pIndoor,
          },
          {
            title: "Buy in Bulk",
            sub: "Wholesale Store",
            desc: "Special pricing for nurseries, landscapers, dealers and businesses.",
            cta: "Explore Wholesale",
            to: "/wholesale",
            icon: Building2,
            img: images.heroWholesale,
          },
        ].map((c) => (
          <article
            key={c.title}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift"
          >
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-leaf-deep">
                <c.icon size={13} /> {c.sub}
              </span>
              <h2 className="mt-3 font-display text-xl text-leaf-deep sm:text-2xl">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              <AppLink
                to={c.to}
                className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-leaf-deep"
              >
                {c.cta}
              </AppLink>
            </div>
            <img
              src={c.img}
              alt={c.title}
              loading="lazy"
              className="h-28 w-28 shrink-0 rounded-2xl object-cover transition-transform duration-500 group-hover:scale-105 sm:h-36 sm:w-36"
            />
          </article>
        ))}
      </section>

      <CategoryStrip />

      <section className="bg-secondary/60 py-8">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 sm:px-6 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-8">
          {trustFeatures.map((t) => {
            const Icon = icons[t.icon] ?? Leaf;
            return (
              <div
                key={t.title}
                className="flex w-56 shrink-0 flex-col items-center gap-2 rounded-2xl bg-card p-4 text-center shadow-soft lg:w-auto"
              >
                <Icon size={22} className="text-primary" />
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-xs text-muted-foreground">{t.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <ProductCarousel
        title="Bestselling Plants"
        subtitle="Loved by thousands of Indian gardeners"
        viewAllTo="/category/bestsellers"
        items={byGroup("bestsellers").slice(0, 4)}
      />
      <ProductCarousel
        title="New Arrivals"
        subtitle="Fresh from the nursery this season"
        viewAllTo="/category/new-arrivals"
        items={byGroup("new").slice(0, 4)}
      />
      <ProductCarousel
        title="Indoor Plants"
        subtitle="Air purifying greens for every room"
        viewAllTo="/category/indoor-plants"
        items={byCategory("indoor-plants").slice(0, 4)}
      />
      <ProductCarousel
        title="Flowering Plants"
        subtitle="Season-long colour for your garden"
        viewAllTo="/category/flowering-plants"
        items={byCategory("flowering-plants").slice(0, 4)}
      />
      <ProductCarousel
        title="Seasonal Seeds"
        subtitle="Sow now, harvest soon"
        viewAllTo="/category/seasonal-seeds"
        items={byGroup("seasonal").slice(0, 4)}
      />
      <ProductCarousel
        title="Gardening Essentials"
        subtitle="Tools, soil and plant care"
        viewAllTo="/category/plant-care"
        items={byGroup("essentials").slice(0, 4)}
      />
      <ProductCarousel
        title="Ready-to-Grow Kits"
        subtitle="Everything in one box"
        viewAllTo="/category/gardening-kits"
        items={byCategory("gardening-kits").slice(0, 4)}
      />
      <ProductCarousel
        title="Wholesale Bestsellers"
        subtitle="Bulk favourites for businesses"
        viewAllTo="/category/wholesale-products"
        items={products.filter((p) => p.wholesale).slice(0, 4)}
      />
      <ProductCarousel
        title="Special Offers"
        subtitle="Limited period nursery deals"
        viewAllTo="/category/offers"
        items={products.filter((p) => (p.mrp - p.price) / p.mrp >= 0.3).slice(0, 4)}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          title="Shop by Plant Requirement"
          subtitle="Find plants that fit your space and routine"
          align="center"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {requirementShortcuts.map((r) => (
            <AppLink
              key={r.slug}
              to={`/category/${r.slug}`}
              className="rounded-2xl border border-border bg-card p-5 text-center shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <Leaf size={20} className="mx-auto text-primary" />
              <span className="mt-2 block text-sm font-medium">{r.title}</span>
            </AppLink>
          ))}
        </div>
      </section>

      <section className="relative my-10 overflow-hidden">
        <img
          src={images.bannerSeasonal}
          alt="Seasonal nursery collection"
          loading="lazy"
          className="h-72 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/20" />
        <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-6 lg:px-8">
          <h2 className="max-w-lg font-display text-3xl text-background sm:text-4xl">
            Monsoon Planting Season Is Here
          </h2>
          <p className="mt-3 max-w-md text-sm text-background/85">
            Up to 40% off on flowering plants, seeds and grow kits.
          </p>
          <AppLink
            to="/category/offers"
            className="mt-6 w-fit rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
          >
            View Offers
          </AppLink>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          title="Corporate & Bulk Planting"
          subtitle="Green solutions for businesses and institutions"
          viewAllTo="/services"
        />
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <img
            src={images.corporateImg}
            alt="Office plant setup by Aaradhya rose nursary"
            loading="lazy"
            className="h-72 w-full rounded-3xl object-cover"
          />
          <ul className="grid grid-cols-2 gap-3">
            {[
              "Office plant setup",
              "Landscaping projects",
              "Corporate gifting",
              "Hotel and resort plants",
              "Society garden development",
              "School garden projects",
            ].map((s) => (
              <li
                key={s}
                className="rounded-2xl border border-border bg-card p-4 text-sm shadow-soft"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-secondary/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="What Our Customers Say"
            subtitle="Verified reviews from across India"
            align="center"
          />
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="w-[85%] shrink-0 rounded-2xl bg-card p-5 shadow-soft sm:w-80"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <figcaption className="text-sm font-semibold">{t.name}</figcaption>
                    <p className="text-xs text-muted-foreground">
                      {t.city} · <span className="text-primary">Verified buyer</span>
                    </p>
                  </div>
                </div>
                <Stars rating={t.rating} />
                <blockquote className="mt-2 text-sm text-muted-foreground">{t.text}</blockquote>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          title="From the Garden Journal"
          subtitle="Care guides and growing tips"
          viewAllTo="/blogs"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {blogs.map((b) => (
            <AppLink
              key={b.slug}
              to={`/blogs/${b.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              <img
                src={b.image}
                alt={b.title}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {b.category} · {b.read}
                </p>
                <h3 className="mt-1 text-sm font-semibold group-hover:text-primary">{b.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{b.excerpt}</p>
              </div>
            </AppLink>
          ))}
        </div>
      </section>

      <section className="bg-leaf-deep py-14 text-primary-foreground">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-display text-3xl">Grow with Us</h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Get plant care tips, new arrivals and exclusive offers.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              (e.target as HTMLFormElement).reset();
            }}
            className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="news" className="sr-only">
              Email address
            </label>
            <input
              id="news"
              type="email"
              required
              placeholder="Your email address"
              className="h-12 flex-1 rounded-full px-5 text-sm text-foreground"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
