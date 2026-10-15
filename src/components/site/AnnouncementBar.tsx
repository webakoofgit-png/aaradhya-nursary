import { useEffect, useState } from "react";
import { Leaf } from "lucide-react";

const messages = [
  "Free Delivery on Retail Orders Above ₹999",
  "Special Wholesale Prices Available",
  "Healthy Plants Delivered Safely",
  "Pan-India Shipping Available",
];

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % messages.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-leaf-deep text-[13px] text-primary-foreground">
      <div className="mx-auto hidden max-w-7xl items-center justify-center gap-8 px-4 py-2 md:flex">
        {messages.map((m) => (
          <span key={m} className="flex items-center gap-1.5">
            <Leaf size={13} className="text-accent" aria-hidden="true" /> {m}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1.5 px-4 py-2 md:hidden">
        <Leaf size={13} className="text-accent" aria-hidden="true" />
        <span key={i} className="animate-fade-in text-center">
          {messages[i]}
        </span>
      </div>
    </div>
  );
}