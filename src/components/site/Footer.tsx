import { Facebook, Instagram, Mail, MapPin, Phone, Sprout, Youtube, Clock, MessageCircle } from "lucide-react";
import { AppLink } from "./AppLink";
import { brand, contact } from "@/data/catalog";

const shop = [
  ["Plants", "/category/plants"],
  ["Seeds", "/category/seeds"],
  ["Pots", "/category/pots-planters"],
  ["Gardening Tools", "/category/gardening-tools"],
  ["Manures", "/category/organic-manures"],
  ["Offers", "/category/offers"],
];

const wholesale = [
  ["B2B Registration", "/wholesale/register"],
  ["B2B Login", "/wholesale/login"],
  ["Wholesale Products", "/category/wholesale-products"],
  ["Bulk Quotation", "/bulk-quote"],
  ["Wholesale FAQs", "/faqs"],
];

const service = [
  ["Contact Us", "/contact"],
  ["Track Order", "/track-order"],
  ["Shipping Policy", "/shipping-policy"],
  ["Return & Refund Policy", "/return-policy"],
  ["Cancellation Policy", "/cancellation-policy"],
  ["FAQs", "/faqs"],
  ["Sitemap", "/sitemap"],
];

export function Footer() {
  return (
    <footer className="mt-16 bg-leaf-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
              <Sprout size={20} />
            </span>
            <span className="font-display text-lg">{brand.name}</span>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/75">
            A Pune-based nursery growing healthy plants for Indian homes, gardens and businesses since 2009.
          </p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Facebook, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Social profile"
                className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {[
          { title: "Shop", links: shop },
          { title: "Wholesale", links: wholesale },
          { title: "Customer Service", links: service },
        ].map((col) => (
          <div key={col.title}>
            <h3 className="font-display text-base text-accent">{col.title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
              {col.links.map(([label, to]) => (
                <li key={to}>
                  <AppLink to={to as string} className="transition-colors hover:text-accent">
                    {label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="font-display text-base text-accent">Reach Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" /> {contact.address}
            </li>
            <li className="flex gap-2">
              <Phone size={16} className="shrink-0" />
              <a href={contact.phoneHref} className="hover:text-accent">
                {contact.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <MessageCircle size={16} className="shrink-0" />
              <a href={contact.whatsappHref} className="hover:text-accent">
                WhatsApp
              </a>
            </li>
            <li className="flex gap-2">
              <Mail size={16} className="shrink-0" />
              <a href={`mailto:${contact.email}`} className="hover:text-accent">
                {contact.email}
              </a>
            </li>
            <li className="flex gap-2">
              <Clock size={16} className="mt-0.5 shrink-0" /> {contact.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-xs text-primary-foreground/70 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {["UPI", "VISA", "MasterCard", "RuPay", "Net Banking", "COD"].map((m) => (
              <span key={m} className="rounded-md bg-primary-foreground/10 px-2.5 py-1">
                {m}
              </span>
            ))}
            <span>100% secure payments</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
            <AppLink to="/privacy-policy" className="hover:text-accent">
              Privacy Policy
            </AppLink>
            <AppLink to="/terms" className="hover:text-accent">
              Terms and Conditions
            </AppLink>
          </div>
        </div>
      </div>
    </footer>
  );
}