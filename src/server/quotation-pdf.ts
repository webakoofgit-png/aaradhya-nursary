import PDFDocument from "pdfkit";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "./db";

const money = (value: number) =>
  `Rs. ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

type PdfQuotation = {
  quotation_number: string;
  pdf_path: string | null;
  created_at: string;
  valid_until: string;
  full_name: string;
  business_name: string;
  business_address: string;
  city: string;
  state: string;
  pin_code: string;
  gst_number: string | null;
  subtotal: number;
  delivery_charges: number;
  gst_rate: number;
  gst_amount: number;
  grand_total: number;
};
type PdfItem = {
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export async function ensureQuotationPdf(quotationId: number) {
  const quotation = db
    .prepare(
      `SELECT q.*,c.full_name,c.business_name,c.mobile,c.email,c.business_address,c.city,c.state,c.pin_code,c.gst_number
      FROM quotations q JOIN b2b_customers c ON c.id=q.customer_id WHERE q.id=?`,
    )
    .get(quotationId) as PdfQuotation | undefined;
  if (!quotation) throw new Error("Quotation not found.");
  const items = db
    .prepare("SELECT * FROM quotation_items WHERE quotation_id=? ORDER BY id")
    .all(quotationId) as PdfItem[];
  const pdfDir = join(process.cwd(), ".data", "quotations");
  mkdirSync(pdfDir, { recursive: true });
  const path = join(pdfDir, `${quotation.quotation_number}.pdf`);
  if (quotation.pdf_path)
    return {
      quotation,
      items,
      path: String(quotation.pdf_path),
      buffer: readFileSync(String(quotation.pdf_path)),
    };

  const document = new PDFDocument({
    size: "A4",
    margin: 42,
    bufferPages: true,
    info: { Title: String(quotation.quotation_number), Author: "Aaradhya rose nursary" },
  });
  const chunks: Buffer[] = [];
  document.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const complete = new Promise<Buffer>((resolve) =>
    document.on("end", () => resolve(Buffer.concat(chunks))),
  );

  const tableHeader = () => {
    document.font("Helvetica-Bold").fontSize(9).fillColor("#173f2b");
    document.text("#", 42, document.y, { width: 24 });
    document.text("Product", 68, document.y - 11, { width: 220 });
    document.text("SKU", 292, document.y - 11, { width: 70 });
    document.text("Rate", 365, document.y - 11, { width: 65, align: "right" });
    document.text("Qty", 435, document.y - 11, { width: 40, align: "right" });
    document.text("Amount", 480, document.y - 11, { width: 72, align: "right" });
    document
      .moveDown(0.6)
      .strokeColor("#8fcf7a")
      .moveTo(42, document.y)
      .lineTo(553, document.y)
      .stroke()
      .moveDown(0.5);
  };

  document.fillColor("#173f2b").font("Helvetica-Bold").fontSize(22).text("AARADHYA ROSE NURSARY");
  document
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#4d5f53")
    .text("Survey No. 42, Green Belt Road, Talegaon, Pune, Maharashtra 410507");
  document.text("+91 98765 43210  |  b2b@verdantroots.in  |  GST: 27AAAAA0000A1Z5");
  document
    .moveDown()
    .strokeColor("#1f5d3b")
    .lineWidth(2)
    .moveTo(42, document.y)
    .lineTo(553, document.y)
    .stroke()
    .moveDown();
  document
    .fillColor("#17211b")
    .font("Helvetica-Bold")
    .fontSize(17)
    .text("B2B QUOTATION", { align: "right" });
  document
    .font("Helvetica")
    .fontSize(10)
    .text(`Quotation: ${quotation.quotation_number}`, { align: "right" });
  document.text(`Date: ${new Date(String(quotation.created_at)).toLocaleDateString("en-IN")}`, {
    align: "right",
  });
  document.text(`Valid until: ${quotation.valid_until}`, { align: "right" });
  document.moveUp(3.1).font("Helvetica-Bold").text("Prepared for");
  document
    .font("Helvetica")
    .text(String(quotation.full_name))
    .text(String(quotation.business_name));
  document.text(
    `${quotation.business_address}, ${quotation.city}, ${quotation.state} - ${quotation.pin_code}`,
    { width: 290 },
  );
  if (quotation.gst_number) document.text(`GST: ${quotation.gst_number}`);
  document.moveDown(2);
  tableHeader();
  items.forEach((item, index) => {
    if (document.y > 700) {
      document.addPage();
      tableHeader();
    }
    const y = document.y;
    document.font("Helvetica").fontSize(9).fillColor("#17211b");
    document.text(String(index + 1), 42, y, { width: 24 });
    document.text(String(item.product_name), 68, y, { width: 220 });
    document.text(String(item.sku), 292, y, { width: 70 });
    document.text(money(Number(item.unit_price)), 365, y, { width: 65, align: "right" });
    document.text(String(item.quantity), 435, y, { width: 40, align: "right" });
    document.text(money(Number(item.line_total)), 480, y, { width: 72, align: "right" });
    document.y = Math.max(document.y, y + 24);
    document
      .strokeColor("#dce5dc")
      .moveTo(42, document.y)
      .lineTo(553, document.y)
      .stroke()
      .moveDown(0.5);
  });
  if (document.y > 610) document.addPage();
  document.moveDown().font("Helvetica").fontSize(10);
  document.text(`Subtotal: ${money(Number(quotation.subtotal))}`, { align: "right" });
  document.text(
    `Delivery: ${Number(quotation.delivery_charges) ? money(Number(quotation.delivery_charges)) : "Free"}`,
    { align: "right" },
  );
  document.text(`GST (${quotation.gst_rate}%): ${money(Number(quotation.gst_amount))}`, {
    align: "right",
  });
  document
    .moveDown(0.4)
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#173f2b")
    .text(`Grand Total: ${money(Number(quotation.grand_total))}`, { align: "right" });
  document
    .moveDown(2)
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#17211b")
    .text("Terms and payment instructions");
  document
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#4d5f53")
    .list([
      "Quotation is valid for 15 days and is subject to stock availability.",
      "Final delivery charges may change based on destination and vehicle requirement.",
      "Payment: 50% advance with order confirmation; balance before dispatch.",
      "Bank details will be shared securely after order confirmation.",
    ]);
  document
    .moveDown(2)
    .fillColor("#17211b")
    .text("Authorized Signatory", { align: "right" })
    .text("Aaradhya rose nursary", { align: "right" });
  const range = document.bufferedPageRange();
  for (let page = 0; page < range.count; page++) {
    document.switchToPage(page);
    document
      .fontSize(8)
      .fillColor("#6d776f")
      .text(`Page ${page + 1} of ${range.count}`, 42, 806, { width: 511, align: "center" });
  }
  document.end();
  const buffer = await complete;
  writeFileSync(path, buffer, { mode: 0o600 });
  db.prepare("UPDATE quotations SET pdf_path=? WHERE id=?").run(path, quotationId);
  return { quotation, items, path, buffer };
}
