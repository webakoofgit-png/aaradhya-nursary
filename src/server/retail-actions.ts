import { createServerFn } from "@tanstack/react-start";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import {
  createSession,
  getSession,
  hashPassword,
  logout,
  requireRetailCustomer,
  verifyPassword,
} from "./auth";

type RetailSessionUser = {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  status: string;
  created_at: string;
  last_login_at: string | null;
};

async function retailOrderSchemaReady() {
  const row = await db
    .prepare(
      `SELECT count(*) count FROM information_schema.tables
       WHERE table_schema=DATABASE() AND table_name IN ('retail_orders','retail_order_items')`,
    )
    .get<{ count: number }>();
  return Number(row?.count || 0) === 2;
}

const credentialsSchema = z.object({
  identifier: z.string().trim().min(3).max(150),
  password: z.string().min(1).max(128),
  remember: z.boolean().default(false),
});

export const registerRetailCustomer = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        fullName: z.string().trim().min(2).max(120),
        mobile: z
          .string()
          .trim()
          .regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit mobile number."),
        email: z.string().trim().email().max(150),
        password: z.string().min(8).max(128),
        confirmPassword: z.string().max(128),
      })
      .refine((value) => value.password === value.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      }),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    const duplicate = await db
      .prepare("SELECT id FROM retail_customers WHERE lower(email)=? OR mobile=?")
      .get(email, data.mobile);
    if (duplicate) throw new Error("An account with this email or mobile already exists.");

    const result = await db
      .prepare(
        "INSERT INTO retail_customers(full_name,mobile,email,password_hash) VALUES (?,?,?,?)",
      )
      .run(data.fullName, data.mobile, email, hashPassword(data.password));
    const customerId = Number(result.lastInsertRowid);
    await db
      .prepare(
        "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('retail_registration',?,'retail_customer',?)",
      )
      .run(`New retail customer: ${data.fullName}`, customerId);
    await createSession("retail", customerId, false);
    return { ok: true };
  });

export const loginRetailCustomer = createServerFn({ method: "POST" })
  .validator(credentialsSchema)
  .handler(async ({ data }) => {
    const identifier = data.identifier.toLowerCase();
    await db
      .prepare(
        "DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)",
      )
      .run();
    const attemptKey = `retail:${identifier}`;
    const recent = (await db
      .prepare(
        "SELECT count(*) count FROM login_attempts WHERE identifier=? AND attempted_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)",
      )
      .get(attemptKey)) as { count: number };
    if (recent.count >= 8)
      throw new Error("Too many login attempts. Please try again in 15 minutes.");
    await db.prepare("INSERT INTO login_attempts(identifier) VALUES (?)").run(attemptKey);

    const customer = (await db
      .prepare(
        "SELECT id,password_hash,status FROM retail_customers WHERE lower(email)=? OR mobile=?",
      )
      .get(identifier, data.identifier)) as
      { id: number; password_hash: string; status: string } | undefined;
    if (!customer || !verifyPassword(data.password, customer.password_hash))
      throw new Error("Invalid email, mobile number, or password.");
    if (customer.status !== "active")
      throw new Error("Your account is suspended. Please contact support.");

    await db
      .prepare(
        "UPDATE retail_customers SET last_login_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
      .run(customer.id);
    await db.prepare("DELETE FROM login_attempts WHERE identifier=?").run(attemptKey);
    await createSession("retail", customer.id, data.remember);
    return { ok: true };
  });

export const getRetailSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session || session.actorType !== "retail") return null;
  const customer = (await db
    .prepare(
      "SELECT id,full_name,email,mobile,status,created_at,last_login_at FROM retail_customers WHERE id=? AND status='active'",
    )
    .get(session.actorId)) as RetailSessionUser | undefined;
  return customer ? { actorType: "retail" as const, user: customer } : null;
});

export const logoutRetailCustomer = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getSession();
  if (session?.actorType === "retail") await logout();
  return { ok: true };
});

export const getRetailAccount = createServerFn({ method: "GET" }).handler(async () => {
  const user = await requireRetailCustomer();
  if (!(await retailOrderSchemaReady())) return { user, orders: [], items: [] };
  const orders = await db
    .prepare("SELECT * FROM retail_orders WHERE customer_id=? ORDER BY id DESC")
    .all(user.id);
  const items = await db
    .prepare(
      `SELECT i.* FROM retail_order_items i
       JOIN retail_orders o ON o.id=i.order_id WHERE o.customer_id=? ORDER BY i.order_id DESC,i.id`,
    )
    .all(user.id);
  return { user, orders, items };
});

export const getCheckoutConfiguration = createServerFn({ method: "GET" }).handler(async () => ({
  upiAvailable: Boolean(process.env["UPI_ID"]?.trim()),
  orderSchemaReady: await retailOrderSchemaReady(),
}));

const orderSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit mobile number."),
  email: z.string().trim().email().max(190),
  gstNumber: z.string().trim().max(30).optional().default(""),
  billingAddress: z.string().trim().min(8).max(1000),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pinCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN code."),
  notes: z.string().trim().max(1000).optional().default(""),
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["upi", "cod"]),
  lines: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(190),
        qty: z.number().int().min(1).max(99),
        size: z.string().trim().min(1).max(80),
        pot: z.string().trim().min(1).max(100),
      }),
    )
    .min(1, "Your cart is empty.")
    .max(100),
});

type OrderRow = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  category_id: number;
  retail_price: number;
  stock: number;
};
type OfferRow = {
  id: number;
  offer_type: "percentage" | "fixed" | "buy_x_get_percentage";
  discount_value: number;
  buy_quantity: number;
  reward_quantity: number;
  category_id: number | null;
};

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const createRetailOrder = createServerFn({ method: "POST" })
  .validator(orderSchema)
  .handler(async ({ data }) => {
    const customer = await requireRetailCustomer();
    if (!(await retailOrderSchemaReady()))
      throw new Error(
        "Ordering is being configured. Please contact the nursery or try again shortly.",
      );
    const upiId = process.env["UPI_ID"]?.trim();
    if (data.paymentMethod === "upi" && !upiId)
      throw new Error("UPI is temporarily unavailable. Please choose Cash on Delivery.");

    return db.transaction(async () => {
      const uniqueSlugs = [...new Set(data.lines.map((line) => line.slug))];
      const placeholders = uniqueSlugs.map(() => "?").join(",");
      const products = await db
        .prepare(
          `SELECT id,slug,sku,name,category_id,retail_price,stock FROM products
           WHERE slug IN (${placeholders}) AND active=1 AND deleted_at IS NULL FOR UPDATE`,
        )
        .all<OrderRow>(...uniqueSlugs);
      const productMap = new Map(products.map((product) => [product.slug, product]));
      if (products.length !== uniqueSlugs.length)
        throw new Error("One or more cart products are no longer available.");

      const offers = await db
        .prepare(
          `SELECT * FROM offers WHERE active=1
           AND (starts_at IS NULL OR starts_at<=CURRENT_TIMESTAMP)
           AND (ends_at IS NULL OR ends_at>=CURRENT_TIMESTAMP) ORDER BY id DESC`,
        )
        .all<OfferRow>();
      const offerProducts = await db
        .prepare("SELECT offer_id,product_id FROM offer_products")
        .all<{ offer_id: number; product_id: number }>();
      const selectedProducts = new Map<number, Set<number>>();
      for (const selected of offerProducts) {
        const ids = selectedProducts.get(Number(selected.offer_id)) ?? new Set<number>();
        ids.add(Number(selected.product_id));
        selectedProducts.set(Number(selected.offer_id), ids);
      }
      const offerFor = (product: OrderRow) =>
        offers.find((offer) => {
          const selected = selectedProducts.get(Number(offer.id));
          if (selected?.size) return selected.has(Number(product.id));
          return !offer.category_id || Number(offer.category_id) === Number(product.category_id);
        });

      const pricedLines = data.lines.map((line) => {
        const product = productMap.get(line.slug)!;
        if (product.stock < line.qty)
          throw new Error(`${product.name} does not have enough stock.`);
        const offer = offerFor(product);
        let unitPrice = Number(product.retail_price);
        if (offer?.offer_type === "percentage")
          unitPrice = Math.max(0, unitPrice * (1 - Number(offer.discount_value) / 100));
        if (offer?.offer_type === "fixed")
          unitPrice = Math.max(0, unitPrice - Number(offer.discount_value));
        return { line, product, offer, unitPrice: roundMoney(unitPrice) };
      });

      const subtotal = roundMoney(
        pricedLines.reduce(
          (sum, item) => sum + Number(item.product.retail_price) * item.line.qty,
          0,
        ),
      );
      let discountTotal = roundMoney(
        pricedLines.reduce(
          (sum, item) => sum + (Number(item.product.retail_price) - item.unitPrice) * item.line.qty,
          0,
        ),
      );
      const groupedBuyOffers = new Map<number, typeof pricedLines>();
      for (const item of pricedLines) {
        if (item.offer?.offer_type !== "buy_x_get_percentage") continue;
        const group = groupedBuyOffers.get(item.offer.id) ?? [];
        group.push(item);
        groupedBuyOffers.set(item.offer.id, group);
      }
      for (const group of groupedBuyOffers.values()) {
        const offer = group[0]!.offer!;
        const buy = Math.max(1, Number(offer.buy_quantity));
        const reward = Math.max(1, Number(offer.reward_quantity));
        const totalUnits = group.reduce((sum, item) => sum + item.line.qty, 0);
        let discountedUnits = Math.floor(totalUnits / (buy + reward)) * reward;
        for (const item of [...group].sort(
          (a, b) => Number(a.product.retail_price) - Number(b.product.retail_price),
        )) {
          const units = Math.min(discountedUnits, item.line.qty);
          discountedUnits -= units;
          discountTotal +=
            units * Number(item.product.retail_price) * (Number(offer.discount_value) / 100);
        }
      }
      discountTotal = roundMoney(discountTotal);
      const discountedSubtotal = roundMoney(Math.max(0, subtotal - discountTotal));
      const shippingTotal =
        data.shippingMethod === "express" ? 149 : discountedSubtotal >= 999 ? 0 : 79;
      const grandTotal = roundMoney(discountedSubtotal + shippingTotal);
      const orderNumber = `AR-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(4).toString("hex").toUpperCase()}`;
      const status = data.paymentMethod === "upi" ? "payment_pending" : "placed";
      const paymentStatus = data.paymentMethod === "upi" ? "pending" : "cod";
      const result = await db
        .prepare(
          `INSERT INTO retail_orders(customer_id,order_number,status,payment_method,payment_status,
           shipping_method,full_name,mobile,email,gst_number,billing_address,city,state,pin_code,
           order_notes,subtotal,discount_total,shipping_total,grand_total)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          customer.id,
          orderNumber,
          status,
          data.paymentMethod,
          paymentStatus,
          data.shippingMethod,
          data.fullName,
          data.mobile,
          data.email.toLowerCase(),
          data.gstNumber || null,
          data.billingAddress,
          data.city,
          data.state,
          data.pinCode,
          data.notes || null,
          subtotal,
          discountTotal,
          shippingTotal,
          grandTotal,
        );
      for (const item of pricedLines) {
        await db
          .prepare(
            `INSERT INTO retail_order_items(order_id,product_id,product_name,sku,product_slug,
             size_label,pot_type,quantity,unit_price,line_total) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          )
          .run(
            result.lastInsertRowid,
            item.product.id,
            item.product.name,
            item.product.sku,
            item.product.slug,
            item.line.size,
            item.line.pot,
            item.line.qty,
            item.unitPrice,
            roundMoney(item.unitPrice * item.line.qty),
          );
        const updated = await db
          .prepare("UPDATE products SET stock=stock-? WHERE id=? AND stock>=?")
          .run(item.line.qty, item.product.id, item.line.qty);
        if (updated.changes !== 1)
          throw new Error(`${item.product.name} stock changed. Please retry.`);
      }
      await db
        .prepare(
          "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('retail_order',?,'retail_order',?)",
        )
        .run(`New retail order ${orderNumber}`, result.lastInsertRowid);

      const upiUrl =
        data.paymentMethod === "upi" && upiId
          ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("Aaradhya Rose Nursery")}&am=${grandTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderNumber)}`
          : null;
      return { ok: true, orderId: result.lastInsertRowid, orderNumber, grandTotal, status, upiUrl };
    })();
  });
