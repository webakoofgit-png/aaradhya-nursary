import { createFileRoute } from "@tanstack/react-router";
import { AppLink } from "@/components/site/AppLink";
import { PageHeader } from "@/components/site/PageHeader";
import { images } from "@/data/catalog";

export const Route = createFileRoute("/blogs")({ component: BlogsPage });

const posts = [
  [
    "A simple watering routine for indoor plants",
    "Check the soil before watering and adapt frequency to season, light and pot size.",
  ],
  [
    "Choosing plants for an Indian balcony",
    "Match sunlight hours with plants that naturally enjoy the same growing conditions.",
  ],
  [
    "Preparing a garden for the monsoon",
    "Improve drainage, prune damaged growth and protect young plants from heavy rain.",
  ],
];

function BlogsPage() {
  return (
    <div>
      <PageHeader
        title="Gardening Journal"
        subtitle="Practical nursery advice for healthier plants."
        trail={[{ label: "Blogs" }]}
      />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {posts.map(([title, summary], index) => (
          <article key={title} className="overflow-hidden rounded-md border border-border bg-card">
            <img
              src={index === 1 ? images.heroIndoor : images.aboutImg}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
            <div className="p-5">
              <h2 className="font-display text-lg text-leaf-deep">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
              <AppLink
                to="/category/plants"
                className="mt-4 inline-block text-sm font-medium text-primary"
              >
                Explore plants
              </AppLink>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
