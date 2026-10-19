import { useEffect, useRef, useState } from "react";
import { Bot, Minus, Send, X } from "lucide-react";

type Msg = { from: "bot" | "user"; text: string };

const quick: { label: string; reply: string }[] = [
  {
    label: "Find the Right Plant",
    reply:
      "Tell me your light condition and I'll suggest. For low light try Snake Plant or ZZ Plant, for bright indirect light try Peace Lily or Areca Palm, and for full sun go with Hibiscus or Bougainvillea.",
  },
  {
    label: "Plant Care Help",
    reply:
      "Water only when the top 2 inches of soil are dry, avoid harsh afternoon sun for two weeks after delivery, and feed with vermicompost once a month. Every order also ships with a printed care card.",
  },
  {
    label: "Track My Order",
    reply:
      "You can track any order from the Track Order page using your order ID and registered mobile number. Retail orders usually deliver in 3 to 7 days.",
  },
  {
    label: "Wholesale Enquiry",
    reply:
      "Wholesale pricing unlocks after B2B account approval, usually within 24 to 48 hours. You can register on the Wholesale page or submit a bulk quotation request.",
  },
  {
    label: "Delivery Information",
    reply:
      "We deliver to 20,000+ pin codes across India. Retail orders above ₹999 ship free, and plants travel in ventilated, shock-proof cartons.",
  },
  {
    label: "Talk to an Expert",
    reply:
      "Connecting you to a human representative from our horticulture team. You are now being redirected — please call +91 77449 02148 or continue on WhatsApp and our expert will respond shortly.",
  },
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hello! Welcome to our nursery. How can I help you today?" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, typing, open]);

  const respond = (userText: string, reply?: string) => {
    setMessages((m) => [...m, { from: "user", text: userText }]);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text:
            reply ??
            "Thanks for your message! Our plant care team will reply here shortly. For an instant answer, pick one of the quick options or call us on +91 77449 02148.",
        },
      ]);
    }, 900);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMinimised(false);
        }}
        aria-label="Open Plant Care Assistant chat"
        className="fixed bottom-24 left-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lift transition-transform hover:scale-105 md:bottom-6"
      >
        <Bot size={18} /> <span className="hidden sm:inline">Plant Care Assistant</span>
      </button>

      {open ? (
        <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-start p-0 sm:inset-auto sm:bottom-6 sm:left-6 sm:p-0">
          <div className="flex h-[70vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-lift sm:h-[520px] sm:w-[370px] sm:rounded-3xl">
            <div className="flex items-center gap-3 bg-leaf-deep px-4 py-3 text-primary-foreground">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/15">
                <Bot size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">Plant Care Assistant</span>
                <span className="flex items-center gap-1.5 text-[11px] text-primary-foreground/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Online now
                </span>
              </span>
              <button
                type="button"
                aria-label="Minimise chat"
                onClick={() => setMinimised((v) => !v)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary-foreground/15"
              >
                <Minus size={16} />
              </button>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-primary-foreground/15"
              >
                <X size={16} />
              </button>
            </div>

            {!minimised ? (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto bg-background px-4 py-4">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.from === "bot"
                          ? "max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-2.5 text-sm text-foreground"
                          : "ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
                      }
                    >
                      {m.text}
                    </div>
                  ))}
                  {typing ? (
                    <div className="w-16 rounded-2xl bg-secondary px-3 py-2.5 text-sm">
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                      </span>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {quick.map((q) => (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => respond(q.label, q.reply)}
                        className="rounded-full border border-primary/30 bg-card px-3 py-1.5 text-xs text-primary hover:bg-secondary"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                  <div ref={endRef} />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!input.trim()) return;
                    respond(input.trim());
                    setInput("");
                  }}
                  className="flex items-center gap-2 border-t border-border bg-card px-3 py-3"
                >
                  <label htmlFor="chat-input" className="sr-only">
                    Type your message
                  </label>
                  <input
                    id="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message…"
                    className="h-10 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    aria-label="Send message"
                    className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
