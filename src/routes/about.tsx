import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { images } from "@/data/catalog";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <div>
      <PageHeader
        title="About Aaradhya rose nursary"
        subtitle="Nursery-grown plants for homes, gardens and businesses."
        trail={[{ label: "About Us" }]}
      />
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center">
        <img
          src={images.aboutImg}
          alt="Aaradhya rose nursary"
          className="aspect-[4/3] w-full rounded-md object-cover"
        />
        <div>
          <h2 className="font-display text-2xl text-leaf-deep">Growing responsibly since 2009</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Aaradhya rose nursary is a Pune-based nursery supplying healthy plants, seeds, planters and
            gardening essentials across India. Every plant is hardened for local conditions and
            checked before dispatch.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            We serve home gardeners as well as nurseries, landscapers, institutions, hospitality
            businesses and corporate projects through our verified B2B programme.
          </p>
        </div>
      </section>
    </div>
  );
}
