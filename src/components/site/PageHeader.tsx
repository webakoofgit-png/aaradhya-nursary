import { Breadcrumbs } from "./Breadcrumbs";

export function PageHeader({
  title,
  subtitle,
  trail,
}: {
  title: string;
  subtitle?: string;
  trail: { label: string; to?: string }[];
}) {
  return (
    <header className="border-b border-border bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs trail={trail} />
        <h1 className="mt-3 font-display text-3xl text-leaf-deep sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
    </header>
  );
}