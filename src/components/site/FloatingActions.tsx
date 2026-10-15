import { useEffect, useState } from "react";
import { ArrowUp, Phone, MessageCircle } from "lucide-react";
import { contact } from "@/data/catalog";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="fixed bottom-24 right-4 z-40 hidden flex-col items-end gap-3 md:flex">
        <a
          href={contact.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2"
          aria-label="Chat with us on WhatsApp"
        >
          <span className="pointer-events-none rounded-full bg-card px-3 py-1.5 text-xs font-medium opacity-0 shadow-soft transition-opacity group-hover:opacity-100">
            Chat on WhatsApp
          </span>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform hover:scale-105 pulse">
            <MessageCircle size={20} />
          </span>
        </a>
        <a href={contact.phoneHref} className="group flex items-center gap-2" aria-label="Call the nursery">
          <span className="pointer-events-none rounded-full bg-card px-3 py-1.5 text-xs font-medium opacity-0 shadow-soft transition-opacity group-hover:opacity-100">
            Call {contact.phone}
          </span>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground shadow-lift transition-transform hover:scale-105">
            <Phone size={19} />
          </span>
        </a>
      </div>

      {showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll back to top"
          className="fixed bottom-24 right-4 z-40 grid h-11 w-11 place-items-center rounded-full border border-border bg-card shadow-lift hover:bg-secondary md:bottom-56"
        >
          <ArrowUp size={18} />
        </button>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-border bg-card md:hidden">
        <a
          href={contact.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary"
        >
          <MessageCircle size={17} /> WhatsApp
        </a>
        <a
          href={contact.phoneHref}
          className="flex items-center justify-center gap-2 border-l border-border py-3 text-sm font-medium text-foreground"
        >
          <Phone size={16} /> Call Now
        </a>
      </div>
    </>
  );
}