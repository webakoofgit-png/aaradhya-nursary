import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <Link to="/" className="hover:text-primary">
        Home
      </Link>
      {trail.map((t) => (
        <span key={t.label} className="flex items-center gap-1">
          <ChevronRight size={12} aria-hidden="true" />
          {t.to ? (
            <Link to={t.to} className="hover:text-primary">
              {t.label}
            </Link>
          ) : (
            <span className="text-foreground">{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}