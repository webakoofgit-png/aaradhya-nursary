import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import {
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Minus,
  PackageSearch,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { AppLink } from "@/components/site/AppLink";
import {
  createQuotation,
  changeB2bPassword,
  getB2bSession,
  getMyB2bData,
  getWholesaleProducts,
  logoutB2b,
} from "@/server/b2b-actions";

type Product = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  description: string;
  image: string;
  wholesale_price: number;
  minimum_quantity: number;
  stock: number;
  category: string;
};
type Quote = {
  id: number;
  quotation_number: string;
  status: string;
  grand_total: number;
  created_at: string;
  product_count: number;
  download_count: number;
};
type Customer = {
  full_name: string;
  business_name: string;
  email: string;
  mobile: string;
  gst_number: string | null;
  business_address: string;
  city: string;
  state: string;
  pin_code: string;
};

export const Route = createFileRoute("/wholesale/dashboard")({
  loader: async () => {
    const session = await getB2bSession();
    if (!session || session.actorType !== "customer") throw redirect({ to: "/wholesale/login" });
    const [products, dashboard] = await Promise.all([getWholesaleProducts(), getMyB2bData()]);
    return {
      session,
      products: products as Product[],
      dashboard: dashboard as unknown as {
        customer: Customer;
        quotations: Quote[];
        settings: Record<string, number>;
      },
    };
  },
  component: B2bDashboard,
});

const money = (value: number) =>
  `Rs. ${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const sections = [
  ["Overview", LayoutDashboard],
  ["Wholesale Products", PackageSearch],
  ["Create Quotation", ShoppingBag],
  ["Saved Quotations", FileText],
  ["Downloaded Quotations", Download],
  ["Previous Enquiries", MessageCircle],
  ["My Profile", UserRound],
  ["Change Password", KeyRound],
] as const;

function B2bDashboard() {
  const loaderData = Route.useLoaderData() as {
    products: Product[];
    dashboard: {
      customer: Customer;
      quotations: Quote[];
      settings: Record<string, number>;
    };
  };
  const { products, dashboard } = loaderData;
  const [section, setSection] = useState<(typeof sections)[number][0]>("Overview");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("name");
  const [maxPrice, setMaxPrice] = useState("");
  const [availability, setAvailability] = useState("all");
  const [page, setPage] = useState(1);
  const [quote, setQuote] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const categories = ["All", ...new Set(products.map((product) => product.category))];
  const filtered = useMemo(() => {
    const values = products.filter(
      (product) =>
        (category === "All" || product.category === category) &&
        (!maxPrice || product.wholesale_price <= Number(maxPrice)) &&
        (availability === "all" ||
          (availability === "available" ? product.stock > 0 : product.stock === 0)) &&
        `${product.name} ${product.sku}`.toLowerCase().includes(query.toLowerCase()),
    );
    return values.sort((a, b) =>
      sort === "low"
        ? a.wholesale_price - b.wholesale_price
        : sort === "high"
          ? b.wholesale_price - a.wholesale_price
          : a.name.localeCompare(b.name),
    );
  }, [products, query, category, sort, maxPrice, availability]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / 8));
  const shown = filtered.slice((page - 1) * 8, page * 8);
  const quoteProducts = products.filter((product) => quote[product.id]);
  const subtotal = quoteProducts.reduce(
    (sum, product) => sum + product.wholesale_price * (quote[product.id] ?? 0),
    0,
  );
  const gstRate = dashboard.settings["gst_rate"] ?? 18;
  const delivery = dashboard.settings["delivery_charges"] ?? 0;
  const gst = subtotal * (gstRate / 100);

  const add = (product: Product) => {
    setQuote((value) => ({
      ...value,
      [product.id]: Math.max(product.minimum_quantity, value[product.id] ?? 0),
    }));
    toast.success(`${product.name} added to quotation.`);
  };
  const setQuantity = (product: Product, quantity: number) => {
    if (quantity < product.minimum_quantity) {
      toast.error(`Minimum order quantity is ${product.minimum_quantity}.`);
      return;
    }
    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} units are available.`);
      return;
    }
    setQuote((value) => ({ ...value, [product.id]: quantity }));
  };
  const generate = async () => {
    if (!quoteProducts.length) {
      toast.error("Select at least one product.");
      return;
    }
    try {
      setBusy(true);
      const result = await createQuotation({
        data: {
          items: quoteProducts.map((product) => ({
            productId: product.id,
            quantity: quote[product.id] ?? product.minimum_quantity,
          })),
        },
      });
      toast.success(`${result.quotationNumber} generated.`);
      await navigate({ to: "/wholesale/quotation/$id", params: { id: String(result.id) } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate quotation.");
    } finally {
      setBusy(false);
    }
  };
  const signOut = async () => {
    await logoutB2b();
    await navigate({ to: "/wholesale/login" });
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
      <aside className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col">
        <div className="hidden px-3 pb-4 lg:block">
          <p className="text-xs uppercase text-muted-foreground">Wholesale account</p>
          <p className="mt-1 truncate font-medium">{String(dashboard.customer.business_name)}</p>
        </div>
        {sections.map(([label, Icon]) => (
          <button
            key={label}
            onClick={() => setSection(label)}
            className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm ${section === label ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
        <button
          onClick={signOut}
          className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-sm text-destructive hover:bg-secondary"
        >
          <LogOut size={17} />
          Logout
        </button>
      </aside>

      <main className="min-w-0">
        {section === "Overview" ? (
          <Overview quotes={dashboard.quotations} setSection={setSection} />
        ) : null}
        {section === "Wholesale Products" ? (
          <section>
            <Heading
              title="Wholesale Products"
              subtitle="Approved business pricing and live stock."
            />
            <div className="grid gap-3 border-y border-border py-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_150px_150px_150px]">
              <label className="relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={17} />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name or SKU"
                  className="h-11 w-full rounded-md border border-border bg-card pl-10 pr-3 text-sm"
                />
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-md border border-border bg-card px-3 text-sm"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <label className="sr-only" htmlFor="b2b-max-price">
                Maximum price
              </label>
              <input
                id="b2b-max-price"
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                placeholder="Max price"
                className="h-11 rounded-md border border-border bg-card px-3 text-sm"
              />
              <select
                value={availability}
                onChange={(e) => {
                  setAvailability(e.target.value);
                  setPage(1);
                }}
                className="h-11 rounded-md border border-border bg-card px-3 text-sm"
                aria-label="Availability"
              >
                <option value="all">All stock</option>
                <option value="available">Available</option>
                <option value="unavailable">Out of stock</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 rounded-md border border-border bg-card px-3 text-sm"
              >
                <option value="name">Sort: Name</option>
                <option value="low">Price: Low to high</option>
                <option value="high">Price: High to low</option>
              </select>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={quote[product.id]}
                  add={add}
                  setQuantity={setQuantity}
                />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span>{filtered.length} products</span>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md border px-3 py-2"
                  disabled={page === 1}
                  onClick={() => setPage((v) => v - 1)}
                >
                  Previous
                </button>
                <span>
                  {page} / {pageCount}
                </span>
                <button
                  className="rounded-md border px-3 py-2"
                  disabled={page === pageCount}
                  onClick={() => setPage((v) => v + 1)}
                >
                  Next
                </button>
              </div>
            </div>
            {quoteProducts.length ? (
              <button
                onClick={() => setSection("Create Quotation")}
                className="sticky bottom-4 mt-6 w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground shadow-lift"
              >
                Review quotation ({quoteProducts.length})
              </button>
            ) : null}
          </section>
        ) : null}
        {section === "Create Quotation" ? (
          <section>
            <Heading
              title="Create Quotation"
              subtitle="Review quantities before generating your quotation."
            />
            {!quoteProducts.length ? (
              <Empty text="No products selected." action={() => setSection("Wholesale Products")} />
            ) : (
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="space-y-3">
                  {quoteProducts.map((product) => (
                    <div
                      key={product.id}
                      className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card p-3"
                    >
                      <img
                        src={product.image}
                        alt=""
                        className="h-14 w-14 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.sku} · {money(product.wholesale_price)} each
                        </p>
                        <div className="mt-2 grid w-32 grid-cols-[36px_minmax(0,1fr)_36px] overflow-hidden rounded-md border border-border bg-background">
                          <button
                            type="button"
                            aria-label={`Decrease ${product.name} quantity`}
                            onClick={() =>
                              setQuantity(
                                product,
                                Math.max(
                                  product.minimum_quantity,
                                  (quote[product.id] ?? product.minimum_quantity) - 1,
                                ),
                              )
                            }
                            disabled={
                              (quote[product.id] ?? product.minimum_quantity) <=
                              product.minimum_quantity
                            }
                            className="grid h-9 place-items-center border-r border-border disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={15} />
                          </button>
                          <input
                            aria-label={`${product.name} quantity`}
                            type="number"
                            min={product.minimum_quantity}
                            max={product.stock}
                            value={quote[product.id]}
                            onChange={(e) => setQuantity(product, Number(e.target.value))}
                            className="h-9 min-w-0 border-0 bg-transparent px-1 text-center text-sm outline-none"
                          />
                          <button
                            type="button"
                            aria-label={`Increase ${product.name} quantity`}
                            onClick={() =>
                              setQuantity(
                                product,
                                (quote[product.id] ?? product.minimum_quantity) + 1,
                              )
                            }
                            disabled={
                              (quote[product.id] ?? product.minimum_quantity) >= product.stock
                            }
                            className="grid h-9 place-items-center border-l border-border disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {money(product.wholesale_price * (quote[product.id] ?? 0))}
                        </p>
                        <button
                          aria-label={`Remove ${product.name}`}
                          onClick={() =>
                            setQuote((value) => {
                              const next = { ...value };
                              delete next[product.id];
                              return next;
                            })
                          }
                          className="mt-2 text-destructive"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <aside className="h-fit rounded-md border border-border bg-card p-5">
                  <h2 className="font-display text-lg">Quotation totals</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd>{money(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>GST ({gstRate}%)</dt>
                      <dd>{money(gst)}</dd>
                    </div>
                    <div className="flex justify-between border-t pt-3 text-base font-semibold">
                      <dt>Delivery</dt>
                      <dd>{delivery ? money(delivery) : "Free"}</dd>
                    </div>
                    <div className="flex justify-between border-t pt-3 text-base font-semibold">
                      <dt>Grand total</dt>
                      <dd>{money(subtotal + gst + delivery)}</dd>
                    </div>
                  </dl>
                  <button
                    onClick={generate}
                    disabled={busy}
                    className="mt-5 w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
                  >
                    {busy ? "Generating..." : "Generate quotation"}
                  </button>
                </aside>
              </div>
            )}
          </section>
        ) : null}
        {section === "Saved Quotations" ? <Quotes quotes={dashboard.quotations} /> : null}
        {section === "Downloaded Quotations" ? (
          <Quotes
            quotes={dashboard.quotations.filter((item) => item.download_count > 0)}
            title="Downloaded Quotations"
          />
        ) : null}
        {section === "Previous Enquiries" ? (
          <Quotes
            quotes={dashboard.quotations.filter((item) =>
              ["new enquiry", "contacted", "follow-up", "negotiation"].includes(item.status),
            )}
            title="Previous Enquiries"
          />
        ) : null}
        {section === "My Profile" ? <Profile customer={dashboard.customer} /> : null}
        {section === "Change Password" ? <ChangePassword navigate={navigate} /> : null}
      </main>
    </div>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-2xl text-leaf-deep">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
function Overview({
  quotes,
  setSection,
}: {
  quotes: Quote[];
  setSection: (value: (typeof sections)[number][0]) => void;
}) {
  const downloaded = quotes.filter((quote) => quote.download_count > 0).length;
  const cards = [
    ["Total Quotations", quotes.length, FileText],
    ["Downloaded", downloaded, Download],
    [
      "Pending Enquiries",
      quotes.filter((quote) => ["new enquiry", "contacted", "follow-up"].includes(quote.status))
        .length,
      MessageCircle,
    ],
    [
      "Confirmed Orders",
      quotes.filter((quote) => quote.status === "converted to order").length,
      ShoppingBag,
    ],
  ] as const;
  return (
    <section>
      <Heading title="Dashboard Overview" subtitle="Your wholesale activity at a glance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="border-l-4 border-primary bg-card p-5 shadow-soft">
            <Icon size={20} className="text-primary" />
            <p className="mt-4 text-2xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => setSection("Wholesale Products")}
        className="mt-6 rounded-md bg-primary px-5 py-3 text-sm text-primary-foreground"
      >
        Create new quotation
      </button>
      <div className="mt-8">
        <Quotes quotes={quotes.slice(0, 5)} />
      </div>
    </section>
  );
}
function ProductCard({
  product,
  quantity,
  add,
  setQuantity,
}: {
  product: Product;
  quantity: number | undefined;
  add: (product: Product) => void;
  setQuantity: (product: Product, quantity: number) => void;
}) {
  return (
    <article className="overflow-hidden border border-border bg-card">
      <img src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover" />
      <div className="p-4">
        <p className="text-xs text-muted-foreground">
          {product.sku} · {product.category}
        </p>
        <h2 className="mt-1 truncate font-medium">{product.name}</h2>
        <p className="mt-3 text-lg font-semibold text-primary">{money(product.wholesale_price)}</p>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>MOQ: {product.minimum_quantity}</span>
          <span>{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</span>
        </div>
        {quantity ? (
          <div className="mt-4 flex items-center gap-2">
            <button
              aria-label="Decrease quantity"
              onClick={() => setQuantity(product, Math.max(product.minimum_quantity, quantity - 1))}
              className="grid h-9 w-9 place-items-center border"
            >
              <Minus size={15} />
            </button>
            <input
              aria-label="Quantity"
              type="number"
              value={quantity}
              min={product.minimum_quantity}
              max={product.stock}
              onChange={(e) => setQuantity(product, Number(e.target.value))}
              className="h-9 min-w-0 flex-1 border text-center text-sm"
            />
            <button
              aria-label="Increase quantity"
              onClick={() => setQuantity(product, quantity + 1)}
              className="grid h-9 w-9 place-items-center border"
            >
              <Plus size={15} />
            </button>
          </div>
        ) : (
          <button
            disabled={!product.stock}
            onClick={() => add(product)}
            className="mt-4 w-full rounded-md bg-primary py-2.5 text-sm text-primary-foreground disabled:opacity-40"
          >
            Add to Quotation
          </button>
        )}
        <details className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-primary">Product details</summary>
          <p className="mt-2 leading-relaxed">{product.description}</p>
        </details>
      </div>
    </article>
  );
}
function Quotes({ quotes, title = "Saved Quotations" }: { quotes: Quote[]; title?: string }) {
  return (
    <section>
      <Heading title={title} subtitle="Generated quotations and download activity." />
      {quotes.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="p-3">Quotation</th>
                <th className="p-3">Date</th>
                <th className="p-3">Products</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Downloads</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b">
                  <td className="p-3 font-medium">{quote.quotation_number}</td>
                  <td className="p-3">{new Date(quote.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-3">{quote.product_count}</td>
                  <td className="p-3">{money(quote.grand_total)}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs capitalize">
                      {quote.status}
                    </span>
                  </td>
                  <td className="p-3">{quote.download_count}</td>
                  <td className="p-3">
                    <AppLink
                      to="/wholesale/quotation/$id"
                      params={{ id: String(quote.id) }}
                      className="text-primary"
                    >
                      View
                    </AppLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No quotations yet.</p>
      )}
    </section>
  );
}
function Profile({ customer }: { customer: Customer }) {
  return (
    <section>
      <Heading title="My Profile" subtitle="Verified business account details." />
      <dl className="grid gap-x-8 gap-y-5 border-y py-6 sm:grid-cols-2">
        {[
          ["Full name", customer.full_name],
          ["Business", customer.business_name],
          ["Email", customer.email],
          ["Mobile", customer.mobile],
          ["GST number", customer.gst_number || "Not provided"],
          [
            "Address",
            `${customer.business_address}, ${customer.city}, ${customer.state} - ${customer.pin_code}`,
          ],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <dt className="text-xs text-muted-foreground">{String(label)}</dt>
            <dd className="mt-1 text-sm">{String(value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ChangePassword({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      setBusy(true);
      await changeB2bPassword({
        data: {
          currentPassword: String(form.get("currentPassword")),
          password: String(form.get("password")),
          confirmPassword: String(form.get("confirmPassword")),
        },
      });
      toast.success("Password changed. Please sign in again.");
      await navigate({ to: "/wholesale/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to change password.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section>
      <Heading
        title="Change Password"
        subtitle="Changing your password signs out other sessions."
      />
      <form onSubmit={submit} className="max-w-lg space-y-4 border-y py-6">
        {[
          ["currentPassword", "Current password"],
          ["password", "New password"],
          ["confirmPassword", "Confirm new password"],
        ].map(([name, label]) => (
          <label key={name} className="block text-sm">
            {label}
            <input
              name={name}
              type="password"
              minLength={name === "currentPassword" ? 1 : 8}
              className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3"
              required
            />
          </label>
        ))}
        <button
          disabled={busy}
          className="rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground"
        >
          {busy ? "Updating..." : "Update password"}
        </button>
      </form>
    </section>
  );
}
function Empty({ text, action }: { text: string; action: () => void }) {
  return (
    <div className="border border-dashed border-border p-10 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      <button
        onClick={action}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Browse products
      </button>
    </div>
  );
}
