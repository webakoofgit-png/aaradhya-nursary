import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const contacts = [
    [Phone, "Call us", "+91 98765 43210", "tel:+919876543210"],
    [MessageCircle, "WhatsApp", "+91 98765 43210", "https://wa.me/919876543210"],
    [Mail, "Email", "hello@verdantroots.in", "mailto:hello@verdantroots.in"],
  ] as const;
  return (
    <div>
      <PageHeader
        title="Contact Us"
        subtitle="Talk to our nursery team about plants, delivery or wholesale supply."
        trail={[{ label: "Contact Us" }]}
      />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {contacts.map(([Icon, title, value, href]) => (
            <a key={title} href={href} className="rounded-md border border-border bg-card p-5">
              <Icon className="text-primary" size={20} />
              <h2 className="mt-3 font-medium">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{value}</p>
            </a>
          ))}
        </div>
        <div className="mt-6 flex gap-3 rounded-md border border-border bg-card p-5">
          <MapPin className="shrink-0 text-primary" size={20} />
          <div>
            <h2 className="font-medium">Visit the nursery</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Survey No. 42, Green Belt Road, Talegaon, Pune, Maharashtra 410507
            </p>
            <p className="mt-2 text-sm">Monday to Saturday, 8:00 AM to 7:00 PM</p>
          </div>
        </div>
      </section>
    </div>
  );
}
