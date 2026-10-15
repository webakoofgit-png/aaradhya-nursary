import { ArrowRight } from "lucide-react";
import { AppLink } from "./AppLink";

export function SectionHeading({
  title,
  subtitle,
  viewAllTo,
  align = "left",
}: {
  title: string;
  subtitle?: string | undefined;
  viewAllTo?: string | undefined;
  align?: "left" | "center";
}) {
  return (
    <div
      className={
        align === "center"
          ? "mb-8 text-center"
          : "mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"
      }
    >
      <div className="min-w-0">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {viewAllTo ? (
        <AppLink
          to={viewAllTo}
          className="shrink-0 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-card px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
        >
          View All <ArrowRight size={15} />
        </AppLink>
      ) : null}
    </div>
  );
}