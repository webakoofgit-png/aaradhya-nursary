import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Bell,
  Boxes,
  Download,
  FileSpreadsheet,
  FileText,
  Archive,
  ExternalLink,
  LogOut,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import {
  downloadCustomerDocument,
  downloadQuotationPdf,
  archiveQuotation,
  getAdminData,
  getB2bSession,
  logoutB2b,
  markNotificationRead,
  saveProduct,
  updateCustomerStatus,
  updateQuotationStatus,
  updateSystemSettings,
} from "@/server/b2b-actions";

type Row = {
  [key: string]: unknown;
  id?: number;
  status?: string;
  read_at?: string | null;
  full_name?: string;
  business_name?: string;
  email?: string;
  mobile?: string;
  gst_number?: string | null;
  business_address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  customer_id?: number;
  kind?: string;
  rejection_remarks?: string | null;
  quotation_number?: string;
  product_count?: number;
  subtotal?: number;
  gst_amount?: number;
  grand_total?: number;
  download_count?: number;
  downloaded_at?: string | null;
  whatsapp_count?: number;
  name?: string;
  sku?: string;
  category?: string;
  description?: string;
  active?: number;
  featured?: number;
  retail_price?: number;
  wholesale_price?: number;
  minimum_quantity?: number;
  stock?: number;
  message?: string;
  created_at?: string;
  quotation_id?: number;
  product_name?: string;
  quantity?: number;
  unit_price?: number;
  line_total?: number;
  note?: string;
  admin_name?: string;
  archived?: number;
  entity_type?: string;
  entity_id?: number;
  key?: string;
  value?: string;
};
type AdminData = {
  customers: Row[];
  quotations: Row[];
  notifications: Row[];
  products: Row[];
  documents: Row[];
  settings: Row[];
  quotationItems: Row[];
  notes: Row[];
};

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const session = await getB2bSession();
    if (!session || session.actorType !== "admin") throw redirect({ to: "/admin/login" });
    return getAdminData() as Promise<AdminData>;
  },
  component: AdminDashboard,
});

const tabs = [
  ["Customers", Users],
  ["Quotations", FileText],
  ["Products", Boxes],
  ["Notifications", Bell],
  ["Settings", Settings],
] as const;
const money = (value: unknown) =>
  `Rs. ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const statusClass = (status: unknown) =>
  status === "approved" || status === "converted to order"
    ? "bg-secondary text-leaf-deep"
    : status === "rejected" || status === "cancelled"
      ? "bg-red-100 text-red-700"
      : status === "suspended"
        ? "bg-amber-100 text-amber-800"
        : "bg-muted text-foreground";

async function productImagePayload(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Product images must be JPG, PNG or WebP.");
  if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} exceeds 5 MB.`);
  const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return {
    name: file.name,
    type: file.type as "image/jpeg" | "image/png" | "image/webp",
    size: file.size,
    data,
  };
}

function AdminDashboard() {
  const initial = Route.useLoaderData() as AdminData;
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("Customers");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const refresh = async () => setData((await getAdminData()) as AdminData);
  const signOut = async () => {
    await logoutB2b();
    await navigate({ to: "/admin/login" });
  };
  const unread = data.notifications.filter((item: Row) => !item.read_at).length;
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="font-display text-xl text-leaf-deep">Aaradhya rose nursary Admin</p>
            <p className="text-xs text-muted-foreground">B2B operations</p>
          </div>
          <button
            onClick={signOut}
            aria-label="Log out"
            title="Log out"
            className="grid h-10 w-10 place-items-center rounded-md hover:bg-secondary"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
          {tabs.map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => setTab(label)}
              className={`relative flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-sm ${tab === label ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}
            >
              <Icon size={17} />
              {label}
              {label === "Notifications" && unread ? (
                <span className="ml-auto rounded-full bg-accent px-2 text-xs text-accent-foreground">
                  {unread}
                </span>
              ) : null}
            </button>
          ))}
        </aside>
        <main className="min-w-0 rounded-md border border-border bg-card p-4 sm:p-6">
          {tab === "Customers" ? (
            <Customers
              data={data}
              query={query}
              setQuery={setQuery}
              filter={filter}
              setFilter={setFilter}
              refresh={refresh}
            />
          ) : null}
          {tab === "Quotations" ? <Quotations data={data} refresh={refresh} /> : null}
          {tab === "Products" ? <Products rows={data.products} refresh={refresh} /> : null}
          {tab === "Notifications" ? (
            <Notifications
              rows={data.notifications}
              refresh={refresh}
              open={(row) => setTab(row.entity_type === "quotation" ? "Quotations" : "Customers")}
            />
          ) : null}
          {tab === "Settings" ? <SettingsPanel settings={data.settings} /> : null}
        </main>
      </div>
    </div>
  );
}

function Toolbar({
  query,
  setQuery,
  children,
}: {
  query: string;
  setQuery: (value: string) => void;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-3">
      <label className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="h-10 w-full rounded-md border border-border pl-9 pr-3 text-sm"
        />
      </label>
      {children}
    </div>
  );
}
function exportCsv(file: string, rows: Row[]) {
  if (!rows.length) {
    toast.error("There is no data to export.");
    return;
  }
  const keys = Object.keys(rows[0] ?? {});
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    keys.join(","),
    ...rows.map((row) => keys.map((key) => escape(row[key])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Customers({
  data,
  query,
  setQuery,
  filter,
  setFilter,
  refresh,
}: {
  data: AdminData;
  query: string;
  setQuery: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  refresh: () => Promise<void>;
}) {
  const rows = useMemo(
    () =>
      data.customers.filter(
        (row) =>
          (filter === "all" || row.status === filter) &&
          `${row.full_name} ${row.business_name} ${row.email} ${row.mobile}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [data.customers, filter, query],
  );
  const change = async (id: number, status: "pending" | "approved" | "rejected" | "suspended") => {
    const remarks = status === "rejected" ? (window.prompt("Rejection remarks") ?? "") : "";
    await updateCustomerStatus({ data: { customerId: id, status, remarks } });
    toast.success(`Customer ${status}.`);
    await refresh();
  };
  const documentDownload = async (id: number) => {
    const file = await downloadCustomerDocument({ data: { documentId: id } });
    const binary = atob(file.base64);
    const url = URL.createObjectURL(
      new Blob([Uint8Array.from(binary, (char) => char.charCodeAt(0))], { type: file.mimeType }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section>
      <Title title="B2B Customers" count={rows.length} />
      <Toolbar query={query} setQuery={setQuery}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 rounded-md border border-border px-3 text-sm"
        >
          <option value="all">All statuses</option>
          {["pending", "approved", "rejected", "suspended"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button
          onClick={() => exportCsv("b2b-customers.csv", rows)}
          className="inline-flex items-center gap-2 rounded-md border px-3 text-sm"
        >
          <FileSpreadsheet size={16} />
          Export CSV
        </button>
      </Toolbar>
      <div className="space-y-3">
        {rows.map((row) => (
          <details key={String(row.id)} className="border border-border p-4">
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3">
              <span className="font-medium">{String(row.business_name)}</span>
              <span className="text-sm text-muted-foreground">
                {String(row.full_name)} · {String(row.mobile)}
              </span>
              <span
                className={`ml-auto rounded-full px-2.5 py-1 text-xs capitalize ${statusClass(row.status)}`}
              >
                {String(row.status)}
              </span>
            </summary>
            <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Email:</span> {String(row.email)}
              </p>
              <p>
                <span className="text-muted-foreground">GST:</span> {String(row.gst_number || "-")}
              </p>
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">Address:</span>{" "}
                {String(row.business_address)}, {String(row.city)}, {String(row.state)}{" "}
                {String(row.pin_code)}
              </p>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                {data.documents
                  .filter((document) => document.customer_id === row.id)
                  .map((document) => (
                    <button
                      key={String(document.id)}
                      onClick={() => documentDownload(Number(document.id))}
                      className="rounded-md border px-3 py-2 text-xs"
                    >
                      <Download size={13} className="mr-1 inline" />
                      {String(document.kind).replaceAll("_", " ")}
                    </button>
                  ))}
              </div>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  onClick={() => change(Number(row.id), "approved")}
                  className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
                >
                  Approve / Reactivate
                </button>
                <button
                  onClick={() => change(Number(row.id), "rejected")}
                  className="rounded-md border border-red-300 px-3 py-2 text-xs text-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => change(Number(row.id), "suspended")}
                  className="rounded-md border px-3 py-2 text-xs"
                >
                  Suspend
                </button>
              </div>
              {row.rejection_remarks ? (
                <p className="sm:col-span-2">
                  <span className="text-muted-foreground">Remarks:</span>{" "}
                  {String(row.rejection_remarks)}
                </p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

const quoteStatuses = [
  "draft",
  "generated",
  "downloaded",
  "new enquiry",
  "contacted",
  "follow-up",
  "negotiation",
  "confirmed",
  "converted to order",
  "cancelled",
];
function Quotations({ data, refresh }: { data: AdminData; refresh: () => Promise<void> }) {
  const rows = data.quotations;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | null>(null);
  const shown = rows.filter((row) =>
    `${row.quotation_number} ${row.full_name} ${row.business_name}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const download = async (id: number) => {
    const file = await downloadQuotationPdf({
      data: { quotationId: id, trackDownload: false },
    });
    const binary = atob(file.base64);
    const url = URL.createObjectURL(
      new Blob([Uint8Array.from(binary, (char) => char.charCodeAt(0))], {
        type: "application/pdf",
      }),
    );
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  const change = async (id: number, status: string) => {
    const note = window.prompt("Optional internal note") ?? "";
    await updateQuotationStatus({ data: { quotationId: id, status, note } });
    toast.success("Quotation updated.");
    await refresh();
  };
  const archive = async (id: number, archived: boolean) => {
    await archiveQuotation({ data: { quotationId: id, archived } });
    toast.success(archived ? "Quotation archived." : "Quotation restored.");
    setSelected(null);
    await refresh();
  };
  return (
    <section>
      <Title title="Quotation Management" count={shown.length} />
      <Toolbar query={query} setQuery={setQuery}>
        <button
          onClick={() => exportCsv("b2b-quotations.csv", shown)}
          className="inline-flex items-center gap-2 rounded-md border px-3 text-sm"
        >
          <FileSpreadsheet size={16} />
          Export CSV
        </button>
      </Toolbar>
      {selected ? (
        <div className="mb-5 border border-border bg-muted/30 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{String(selected.quotation_number)}</p>
              <p className="text-sm text-muted-foreground">
                {String(selected.business_name)} · {String(selected.full_name)}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${String(selected.mobile)}`}
                className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-2 text-xs"
              >
                Contact <ExternalLink size={13} />
              </a>
              <button
                onClick={() => archive(Number(selected.id), !selected.archived)}
                className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-2 text-xs"
              >
                <Archive size={13} /> {selected.archived ? "Restore" : "Archive"}
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Product</th>
                  <th>SKU</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Qty</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.quotationItems
                  .filter((item) => item.quotation_id === selected.id)
                  .map((item) => (
                    <tr key={String(item.id)} className="border-b">
                      <td className="py-2">{String(item.product_name)}</td>
                      <td>{String(item.sku)}</td>
                      <td className="text-right">{money(item.unit_price)}</td>
                      <td className="text-right">{String(item.quantity)}</td>
                      <td className="text-right">{money(item.line_total)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Internal notes</p>
            {data.notes
              .filter((note) => note.quotation_id === selected.id)
              .map((note) => (
                <p key={String(note.id)} className="mt-2 border-l-2 border-primary pl-3 text-sm">
                  {String(note.note)}{" "}
                  <span className="text-xs text-muted-foreground">
                    · {String(note.admin_name || "Admin")}
                  </span>
                </p>
              ))}
            {!data.notes.some((note) => note.quotation_id === selected.id) ? (
              <p className="mt-2 text-sm text-muted-foreground">No internal notes.</p>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="bg-secondary">
            <tr>
              {[
                "Quotation",
                "Customer",
                "Products",
                "Subtotal",
                "GST",
                "Grand total",
                "Downloads",
                "WhatsApp",
                "Status",
                "Actions",
              ].map((item) => (
                <th key={item} className="p-3">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={String(row.id)} className="border-b">
                <td className="p-3 font-medium">{String(row.quotation_number)}</td>
                <td className="p-3">
                  {String(row.business_name)}
                  <br />
                  <span className="text-xs text-muted-foreground">{String(row.full_name)}</span>
                </td>
                <td className="p-3">{String(row.product_count)}</td>
                <td className="p-3">{money(row.subtotal)}</td>
                <td className="p-3">{money(row.gst_amount)}</td>
                <td className="p-3 font-medium">{money(row.grand_total)}</td>
                <td className="p-3">
                  {String(row.download_count)}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {row.downloaded_at
                      ? new Date(String(row.downloaded_at)).toLocaleString("en-IN")
                      : "Never"}
                  </span>
                </td>
                <td className="p-3">{Number(row.whatsapp_count) ? "Clicked" : "No"}</td>
                <td className="p-3">
                  <select
                    value={String(row.status)}
                    onChange={(e) => change(Number(row.id), e.target.value)}
                    className="rounded-md border px-2 py-1.5 text-xs"
                  >
                    {quoteStatuses.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelected(row)}
                      title="View details"
                      className="text-primary"
                    >
                      <FileText size={17} />
                    </button>
                    <button
                      onClick={() => download(Number(row.id))}
                      title="View PDF"
                      className="text-primary"
                    >
                      <Download size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Products({ rows, refresh }: { rows: Row[]; refresh: () => Promise<void> }) {
  const [editing, setEditing] = useState<Row | null>(null);
  const [query, setQuery] = useState("");
  const shown = rows.filter((row) =>
    `${row.name} ${row.sku} ${row.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const files = form
      .getAll("images")
      .filter((value): value is File => value instanceof File && value.size > 0);
    if (files.length > 8) {
      toast.error("Upload a maximum of 8 images.");
      return;
    }
    const images = await Promise.all(files.map(productImagePayload));
    await saveProduct({
      data: {
        id: editing?.id ? Number(editing.id) : undefined,
        sku: String(form.get("sku")),
        slug: String(form.get("slug")),
        name: String(form.get("name")),
        category: String(form.get("category")),
        description: String(form.get("description")),
        image: String(form.get("image")),
        retailPrice: Number(form.get("retailPrice")),
        wholesalePrice: Number(form.get("wholesalePrice")),
        gstRate: Number(form.get("gstRate")),
        minimumQuantity: Number(form.get("minimumQuantity")),
        stock: Number(form.get("stock")),
        active: form.get("active") === "on",
        featured: form.get("featured") === "on",
        images,
      },
    });
    toast.success("Product saved.");
    setEditing(null);
    await refresh();
  };
  const importCsv = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data: imported, errors }) => {
        if (errors.length) {
          toast.error(`CSV error on row ${errors[0]?.row ?? 1}.`);
          return;
        }
        try {
          for (const item of imported) {
            await saveProduct({
              data: {
                sku: item["sku"] ?? "",
                slug: item["slug"] ?? "",
                name: item["name"] ?? "",
                category: item["category"] ?? "",
                description: item["description"] ?? "",
                image: item["image"] ?? "",
                retailPrice: Number(item["retail_price"] ?? 0),
                wholesalePrice: Number(item["wholesale_price"] ?? 0),
                gstRate: Number(item["gst_rate"] ?? 18),
                minimumQuantity: Number(item["minimum_quantity"] ?? 1),
                stock: Number(item["stock"] ?? 0),
                active: item["active"] !== "false" && item["active"] !== "0",
                featured: item["featured"] === "true" || item["featured"] === "1",
              },
            });
          }
          toast.success(`${imported.length} products imported.`);
          await refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "CSV import failed.");
        }
      },
    });
  };
  const deactivate = async (row: Row) => {
    if (!window.confirm(`Deactivate ${String(row.name)}?`)) return;
    await saveProduct({
      data: {
        id: Number(row.id),
        sku: String(row.sku),
        slug: String(row["slug"]),
        name: String(row.name),
        category: String(row.category),
        description: String(row.description ?? ""),
        image: String(row["image"] ?? ""),
        retailPrice: Number(row.retail_price),
        wholesalePrice: Number(row.wholesale_price),
        gstRate: Number(row["gst_rate"] ?? 18),
        minimumQuantity: Number(row.minimum_quantity),
        stock: Number(row.stock),
        active: false,
        featured: Boolean(row.featured),
        images: [],
      },
    });
    toast.success("Product deactivated.");
    await refresh();
  };
  return (
    <section>
      <Title title="Product Management" count={shown.length} />
      <Toolbar query={query} setQuery={setQuery}>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 text-sm">
          <FileSpreadsheet size={16} /> Import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) importCsv(file);
              event.target.value = "";
            }}
          />
        </label>
        <button
          onClick={() => setEditing({})}
          className="rounded-md bg-primary px-4 text-sm text-primary-foreground"
        >
          Add product
        </button>
      </Toolbar>
      {editing ? (
        <form
          onSubmit={submit}
          className="mb-6 grid gap-3 border-y py-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {(
            [
              ["name", "Product name", "text"],
              ["sku", "SKU", "text"],
              ["slug", "Slug", "text"],
              ["category", "Category", "text"],
              ["retailPrice", "Retail price", "number"],
              ["wholesalePrice", "Wholesale price", "number"],
              ["gstRate", "GST rate", "number"],
              ["minimumQuantity", "Minimum quantity", "number"],
              ["stock", "Stock", "number"],
              ["image", "Image path", "text"],
            ] as [string, string, string][]
          ).map(([name, label, type]) => (
            <label key={name} className="text-xs">
              {label}
              <input
                name={name}
                type={type}
                defaultValue={String(editing[name] ?? (name === "gstRate" ? 18 : ""))}
                className="mt-1 h-10 w-full rounded-md border px-3 text-sm"
                required
              />
            </label>
          ))}
          <label className="text-xs sm:col-span-2 lg:col-span-3">
            Description
            <textarea
              name="description"
              defaultValue={String(editing.description ?? "")}
              className="mt-1 w-full rounded-md border p-3 text-sm"
              rows={2}
            />
          </label>
          <label className="text-xs sm:col-span-2 lg:col-span-3">
            Product images (up to 8)
            <input
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="mt-1 block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              name="active"
              type="checkbox"
              defaultChecked={editing.active === undefined || Boolean(editing.active)}
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input name="featured" type="checkbox" defaultChecked={Boolean(editing.featured)} />
            Featured
          </label>
          <div className="flex gap-2">
            <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-left text-sm">
          <thead className="bg-secondary">
            <tr>
              {[
                "SKU",
                "Product",
                "Category",
                "Retail",
                "Wholesale",
                "MOQ",
                "Stock",
                "State",
                "",
              ].map((item) => (
                <th key={item} className="p-3">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={String(row.id)} className="border-b">
                <td className="p-3">{String(row.sku)}</td>
                <td className="p-3 font-medium">
                  <div className="flex min-w-[220px] items-center gap-3">
                    <img
                      src={String(row.display_image || row.image || "")}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-md border bg-secondary/40 object-contain"
                    />
                    <div>
                      <p>{String(row.name)}</p>
                      <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                        {Number(row.image_count || 0)} {Number(row.image_count || 0) === 1 ? "image" : "images"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">{String(row.category)}</td>
                <td className="p-3">{money(row.retail_price)}</td>
                <td className="p-3">{money(row.wholesale_price)}</td>
                <td className="p-3">{String(row.minimum_quantity)}</td>
                <td className="p-3">{String(row.stock)}</td>
                <td className="p-3">{row.active ? "Active" : "Inactive"}</td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <button onClick={() => setEditing(row)} className="text-primary">
                      Edit
                    </button>
                    {row.active ? (
                      <button onClick={() => deactivate(row)} className="text-destructive">
                        Deactivate
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function Notifications({
  rows,
  refresh,
  open,
}: {
  rows: Row[];
  refresh: () => Promise<void>;
  open: (row: Row) => void;
}) {
  return (
    <section>
      <Title title="Admin Notifications" count={rows.filter((row) => !row.read_at).length} />
      <div className="divide-y">
        {rows.map((row) => (
          <button
            key={String(row.id)}
            onClick={async () => {
              await markNotificationRead({ data: { notificationId: Number(row.id) } });
              await refresh();
              open(row);
            }}
            className={`w-full p-4 text-left ${row.read_at ? "opacity-60" : "bg-secondary/40"}`}
          >
            <p className="text-sm font-medium">{String(row.message)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(String(row.created_at)).toLocaleString("en-IN")} ·{" "}
              {row.read_at ? "Read" : "Mark as read"}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
function SettingsPanel({ settings }: { settings: Row[] }) {
  const lookup = Object.fromEntries(settings.map((row) => [row.key, row.value]));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await updateSystemSettings({
      data: { gstRate: Number(form.get("gst")), deliveryCharges: Number(form.get("delivery")) },
    });
    toast.success("Settings updated.");
  };
  return (
    <section>
      <Title title="Quotation Settings" />
      <form onSubmit={submit} className="max-w-lg space-y-4">
        <label className="block text-sm">
          GST percentage
          <input
            name="gst"
            type="number"
            min="0"
            max="100"
            step="0.01"
            defaultValue={String(lookup.gst_rate ?? 18)}
            className="mt-1 h-11 w-full rounded-md border px-3"
          />
        </label>
        <label className="block text-sm">
          Default delivery charges
          <input
            name="delivery"
            type="number"
            min="0"
            step="0.01"
            defaultValue={String(lookup.delivery_charges ?? 0)}
            className="mt-1 h-11 w-full rounded-md border px-3"
          />
        </label>
        <button className="rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground">
          Save settings
        </button>
      </form>
    </section>
  );
}
function Title({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <h1 className="font-display text-2xl text-leaf-deep">{title}</h1>
      {count !== undefined ? (
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">{count}</span>
      ) : null}
    </div>
  );
}
