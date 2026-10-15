import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/track-order")({ component: TrackOrderPage });

function TrackOrderPage() {
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(
      "We could not find an active shipment for these details. Please verify the order ID or contact support.",
    );
  };
  return (
    <div>
      <PageHeader
        title="Track Order"
        subtitle="Enter your retail order details to check its latest status."
        trail={[{ label: "Track Order" }]}
      />
      <section className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <form onSubmit={submit} className="rounded-md border border-border bg-card p-6">
          <label className="block text-sm">
            Order ID
            <input
              name="orderId"
              required
              placeholder="VR-ORDER-0001"
              className="mt-1 h-11 w-full rounded-md border border-border px-3"
            />
          </label>
          <label className="mt-4 block text-sm">
            Registered mobile number
            <input
              name="mobile"
              required
              pattern="[6-9][0-9]{9}"
              className="mt-1 h-11 w-full rounded-md border border-border px-3"
            />
          </label>
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground">
            <Search size={16} />
            Track order
          </button>
          {message ? (
            <p className="mt-4 rounded-md bg-secondary p-3 text-sm text-leaf-deep">{message}</p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
