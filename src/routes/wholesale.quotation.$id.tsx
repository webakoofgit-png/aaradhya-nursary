import { createFileRoute, redirect } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { contact } from "@/data/catalog";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";
import {
  downloadQuotationPdf,
  getB2bSession,
  getQuotation,
  trackWhatsapp,
} from "@/server/b2b-actions";

type Quotation = {
  id: number;
  quotation_number: string;
  full_name: string;
  business_name: string;
  grand_total: number;
  created_at: string;
  valid_until: string;
  business_address: string;
  city: string;
  state: string;
  pin_code: string;
  mobile: string;
  email: string;
  gst_number: string | null;
  subtotal: number;
  delivery_charges: number;
  gst_rate: number;
  gst_amount: number;
};
type QuotationItem = {
  id: number;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};
type QuoteData = { quotation: Quotation; items: QuotationItem[] };

export const Route = createFileRoute("/wholesale/quotation/$id")({
  loader: async ({ params }: { params: { id: string } }) => {
    const session = await getB2bSession();
    if (!session) throw redirect({ to: "/wholesale/login" });
    return getQuotation({ data: { id: Number(params.id) } }) as unknown as Promise<QuoteData>;
  },
  component: QuotationPreview,
});

const money = (value: unknown) =>
  `Rs. ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

function QuotationPreview() {
  const data = Route.useLoaderData() as QuoteData;
  const quote = data.quotation;
  const download = async (preview = false) => {
    try {
      const result = await downloadQuotationPdf({
        data: { quotationId: Number(quote.id), trackDownload: !preview },
      });
      const binary = atob(result.base64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      if (preview) window.open(url, "_blank", "noopener,noreferrer");
      else {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = result.fileName;
        anchor.click();
        toast.success("Quotation downloaded and activity recorded.");
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PDF generation failed.");
    }
  };
  const whatsapp = async () => {
    await trackWhatsapp({ data: { quotationId: Number(quote.id) } });
    const message = `Hello, I am ${quote.full_name} from ${quote.business_name}.\n\nI have generated a B2B quotation from your website.\n\nQuotation Number: ${quote.quotation_number}\nQuotation Amount: ${money(quote.grand_total)}\nTotal Products: ${data.items.length}\n\nI am interested in this quotation. Please contact me regarding product availability, delivery and final order confirmation.`;
    window.open(
      `${contact.whatsappHref}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  return (
    <div className="bg-muted/40 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-4xl flex-wrap gap-2 px-4 print:hidden">
        <button
          onClick={() => download(true)}
          className="rounded-md border border-border bg-card px-4 py-2 text-sm"
        >
          Preview PDF
        </button>
        <button
          onClick={() => download(false)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          <Download size={16} />
          Download PDF
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm"
        >
          <Printer size={16} />
          Print
        </button>
        <button
          onClick={whatsapp}
          className="inline-flex items-center gap-2 rounded-md bg-[#217a43] px-4 py-2 text-sm text-white"
        >
          <WhatsAppIcon size={16} />
          WhatsApp enquiry
        </button>
      </div>
      <article className="mx-auto min-h-[1120px] max-w-4xl bg-white p-6 text-[#17211b] shadow-soft sm:p-10 print:min-h-0 print:max-w-none print:shadow-none">
        <header className="flex flex-col justify-between gap-5 border-b-2 border-[#1f5d3b] pb-5 sm:flex-row">
          <div>
            <p className="font-display text-2xl font-semibold text-[#173f2b]">
              Aaradhya rose nursary
            </p>
            <p className="mt-1 max-w-md text-xs text-[#4d5f53]">
              {contact.address}
              <br />
              {contact.phone} · {contact.wholesaleEmail}
              <br />
              GST: 27AAAAA0000A1Z5
            </p>
          </div>
          <div className="sm:text-right">
            <h1 className="font-display text-xl">B2B Quotation</h1>
            <p className="mt-1 text-sm font-medium">{String(quote.quotation_number)}</p>
            <p className="text-xs text-[#4d5f53]">
              Date: {new Date(String(quote.created_at)).toLocaleDateString("en-IN")}
              <br />
              Valid until: {String(quote.valid_until)}
            </p>
          </div>
        </header>
        <section className="grid gap-6 border-b py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-[#4d5f53]">Prepared for</p>
            <p className="mt-2 font-semibold">{String(quote.full_name)}</p>
            <p className="text-sm">{String(quote.business_name)}</p>
            <p className="mt-1 text-sm text-[#4d5f53]">
              {String(quote.business_address)}, {String(quote.city)}, {String(quote.state)} -{" "}
              {String(quote.pin_code)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase text-[#4d5f53]">Customer details</p>
            <p className="mt-2 text-sm">{String(quote.mobile)}</p>
            <p className="text-sm">{String(quote.email)}</p>
            <p className="text-sm">GST: {String(quote.gst_number || "Not provided")}</p>
          </div>
        </section>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-[#e9f3e9]">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Product</th>
                <th className="p-3">SKU</th>
                <th className="p-3 text-right">Unit price</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={String(item.id)} className="border-b">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-medium">{String(item.product_name)}</td>
                  <td className="p-3">{String(item.sku)}</td>
                  <td className="p-3 text-right">{money(item.unit_price)}</td>
                  <td className="p-3 text-right">{String(item.quantity)}</td>
                  <td className="p-3 text-right">{money(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section className="ml-auto mt-6 max-w-xs">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{money(quote.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd>{Number(quote.delivery_charges) ? money(quote.delivery_charges) : "Free"}</dd>
            </div>
            <div className="flex justify-between">
              <dt>GST ({String(quote.gst_rate)}%)</dt>
              <dd>{money(quote.gst_amount)}</dd>
            </div>
            <div className="flex justify-between border-t-2 border-[#1f5d3b] pt-3 text-base font-semibold">
              <dt>Grand total</dt>
              <dd>{money(quote.grand_total)}</dd>
            </div>
          </dl>
        </section>
        <footer className="mt-12 grid gap-8 border-t pt-6 text-xs text-[#4d5f53] sm:grid-cols-2">
          <div>
            <p className="font-semibold text-[#17211b]">Terms and payment instructions</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Valid for 15 days, subject to stock availability.</li>
              <li>Delivery charges depend on destination and vehicle requirement.</li>
              <li>50% advance; balance before dispatch.</li>
              <li>Bank details shared securely after confirmation.</li>
            </ul>
          </div>
          <div className="self-end text-right">
            <div className="mb-8 border-b" />
            <p className="font-semibold text-[#17211b]">Authorized Signatory</p>
            <p>Aaradhya rose nursary</p>
          </div>
        </footer>
      </article>
    </div>
  );
}
