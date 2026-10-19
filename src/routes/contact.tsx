import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import { contact } from "@/data/catalog";

const mapUrl =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1337.7945062895049!2d74.11445231228585!3d18.490259151676568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2e70010fed773%3A0x24a15c1d93fe536f!2sAaradhya%20Rose%20Nursury!5e0!3m2!1sen!2sin!4v1792060894723!5m2!1sen!2sin";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const contacts = [
    [Phone, "Call us", contact.phone, contact.phoneHref],
    [WhatsAppIcon, "WhatsApp", contact.whatsapp, contact.whatsappHref],
    [Mail, "Email", contact.email, `mailto:${contact.email}`],
  ] as const;
  const socialLinks = [
    [Instagram, "Instagram", "@aaradhya.rose.nursury", contact.instagramHref],
    [Facebook, "Facebook", "Aaradhya Rose Nursury", contact.facebookHref],
  ] as const;
  return (
    <div>
      <PageHeader
        title="Contact Us"
        subtitle="Talk to our nursery team about plants, delivery or wholesale supply."
        trail={[{ label: "Contact Us" }]}
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
            <p className="mt-2 text-sm">Monday to Saturday, 9:00 AM to 5:30 PM</p>
            <p className="mt-1 text-sm">Sunday, 9:00 AM to 1:00 PM</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {socialLinks.map(([Icon, title, handle, href]) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-md border border-border bg-card p-5 transition-colors hover:bg-secondary"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Icon size={21} />
              </span>
              <span>
                <span className="block font-medium">Follow us on {title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{handle}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="nursery-location" className="w-full">
        <div className="mx-auto max-w-7xl px-4 pb-5 sm:px-6 lg:px-8">
          <h2 id="nursery-location" className="font-display text-2xl text-leaf-deep sm:text-3xl">
            Find Aaradhya Rose Nursury
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the map below for directions to our nursery.
          </p>
        </div>
        <iframe
          src={mapUrl}
          title="Aaradhya Rose Nursury location on Google Maps"
          className="h-[420px] w-full border-0 sm:h-[500px]"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </section>
    </div>
  );
}
