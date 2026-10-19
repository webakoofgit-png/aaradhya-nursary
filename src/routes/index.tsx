import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Building2, Compass, Home as HomeIcon, Moon, PawPrint, Sprout, Sun, Wind } from "lucide-react";
import { HeroSlider } from "@/components/site/HeroSlider";
import { CategoryStrip } from "@/components/site/CategoryStrip";
import { ProductCarousel } from "@/components/site/ProductCarousel";
import { SectionHeading } from "@/components/site/SectionHeading";
import { AppLink } from "@/components/site/AppLink";
import { Stars } from "@/components/site/Stars";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  blogs,
  byCategory,
  byGroup,
  images,
  products,
  requirementShortcuts,
  testimonials,
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

function Home() {
  const [reviewsApi, setReviewsApi] = useState<CarouselApi>();
  const [reviewsPaused, setReviewsPaused] = useState(false);
  const setReviewsCarouselApi = useCallback((api: CarouselApi) => setReviewsApi(api), []);

  useEffect(() => {
    if (!reviewsApi || reviewsPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => reviewsApi.scrollNext(), 5000);
    return () => window.clearInterval(timer);
  }, [reviewsApi, reviewsPaused]);

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

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-leaf-deep text-primary-foreground md:grid-cols-[1.05fr_0.95fr]">
          <img
            src={images.aboutImg}
            alt="Plants at Aaradhya rose nursary in Pune"
            loading="lazy"
            className="h-64 w-full object-cover md:h-full md:min-h-[360px]"
          />
          <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Talegaon, Pune · Since 2009
            </p>
            <h2 className="mt-4 max-w-lg font-display text-3xl leading-tight sm:text-4xl">
              Good plants take a little care before they reach your home.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-primary-foreground/80">
              We are a Pune-based nursery supplying plants and gardening essentials across India.
              Plants are hardened for local conditions and checked before dispatch.
            </p>
            <AppLink
              to="/about"
              className="mt-6 w-fit border-b border-accent pb-1 text-sm font-medium text-accent transition-colors hover:text-primary-foreground"
            >
              A little more about us <span aria-hidden="true">→</span>
            </AppLink>
          </div>
        </div>
      </section>

      <ProductCarousel
        title="Bestselling Plants"
        subtitle="Popular picks from our plant range"
        viewAllTo="/category/bestsellers"
        items={byGroup("bestsellers").slice(0, 4)}
      />
      <ProductCarousel
        title="New Arrivals"
        subtitle="Recently added to the nursery"
        viewAllTo="/category/new-arrivals"
        items={byGroup("new").slice(0, 4)}
      />
      <ProductCarousel
        title="Indoor Plants"
        subtitle="Plants chosen for indoor spaces"
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
        title="Special Offers"
        subtitle="Buy two eligible sale plants and get 50% off the third"
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
              className="flex items-center gap-3 border-b border-border px-2 py-4 transition-colors hover:text-primary sm:px-4"
            >
              <RequirementIcon name={r.icon} />
              <span className="text-sm font-medium">{r.title}</span>
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
            A Little Extra for Your Next Planting
          </h2>
          <p className="mt-3 max-w-md text-sm text-background/85">
            Buy two eligible sale plants and get 50% off the third. The lowest priced eligible plant gets the discount.
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
            subtitle="A few experiences shared by gardeners"
            align="center"
          />
          <Carousel
            opts={{ loop: true }}
            setApi={setReviewsCarouselApi}
            onMouseEnter={() => setReviewsPaused(true)}
            onMouseLeave={() => setReviewsPaused(false)}
            onFocusCapture={() => setReviewsPaused(true)}
            onBlurCapture={() => setReviewsPaused(false)}
            className="px-1 pt-2 sm:px-10"
          >
            <CarouselContent>
              {testimonials.map((t) => (
                <CarouselItem key={t.name} className="md:basis-1/2 lg:basis-1/3">
                  <figure className="h-full rounded-2xl bg-card p-5 shadow-soft sm:p-6">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
                        {t.name.charAt(0)}
                      </span>
                      <div>
                        <figcaption className="text-sm font-semibold">{t.name}</figcaption>
                        <p className="text-xs text-muted-foreground">{t.city}</p>
                      </div>
                    </div>
                    <Stars rating={t.rating} />
                    <blockquote className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t.text}
                    </blockquote>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 top-1/2 h-9 w-9 -translate-y-1/2 border-border bg-card text-foreground hover:bg-secondary" />
            <CarouselNext className="right-0 top-1/2 h-9 w-9 -translate-y-1/2 border-border bg-card text-foreground hover:bg-secondary" />
          </Carousel>
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
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              From the garden journal
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Small questions are part of growing.
            </h2>
            <p className="mt-3 text-sm leading-6 text-primary-foreground/80">
              Read our practical notes on choosing plants, caring for them and making the most of
              your space.
            </p>
          </div>
          <AppLink
            to="/blogs"
            className="w-fit border-b border-accent pb-1 text-sm font-medium text-accent transition-colors hover:text-primary-foreground"
          >
            Browse the garden journal <span aria-hidden="true">→</span>
          </AppLink>
        </div>
      </section>
    </>
  );
}

function RequirementIcon({ name }: { name: string }) {
  const iconClass = "shrink-0 text-primary";
  switch (name) {
    case "Wind":
      return <Wind size={19} className={iconClass} />;
    case "PawPrint":
      return <PawPrint size={19} className={iconClass} />;
    case "Compass":
      return <Compass size={19} className={iconClass} />;
    case "Building2":
      return <Building2 size={19} className={iconClass} />;
    case "Home":
      return <HomeIcon size={19} className={iconClass} />;
    case "Sun":
      return <Sun size={19} className={iconClass} />;
    case "Moon":
      return <Moon size={19} className={iconClass} />;
    default:
      return <Sprout size={19} className={iconClass} />;
  }
}
