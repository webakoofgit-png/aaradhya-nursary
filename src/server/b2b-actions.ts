import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { extname, join } from "node:path";
import { db } from "./db";
import { ensureQuotationPdf } from "./quotation-pdf";
import {
  createSession,
  getSession,
  hashPassword,
  logout,
  requireAdmin,
  requireCustomer,
  verifyPassword,
} from "./auth";

const registrationSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    mobile: z.string().regex(/^[6-9]\d{9}$/),
    whatsapp: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
    businessName: z.string().trim().min(2).max(150),
    businessType: z.string().trim().min(2).max(80),
    gstNumber: z.string().trim().max(15),
    panNumber: z.string().trim().max(10),
    yearsInBusiness: z.coerce.number().int().min(0).max(100),
    expectedMonthlyPurchase: z.string().trim().min(1),
    productInterests: z.string().trim().min(1),
    businessAddress: z.string().trim().min(8).max(500),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pinCode: z.string().regex(/^\d{6}$/),
    deliveryAddress: z.string().trim().min(8).max(500),
    documents: z
      .array(
        z.object({
          kind: z.enum([
            "gst_certificate",
            "pan_document",
            "business_registration",
            "identity_proof",
          ]),
          name: z.string().min(1).max(180),
          type: z.enum(["application/pdf", "image/jpeg", "image/png"]),
          size: z
            .number()
            .int()
            .positive()
            .max(5 * 1024 * 1024),
          data: z.string().min(1),
        }),
      )
      .length(4),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type CustomerSessionRow = {
  id: number;
  full_name: string;
  email: string;
  mobile: string;
  business_name: string;
  status: string;
  business_address: string;
  city: string;
  state: string;
  pin_code: string;
  gst_number: string | null;
};

export const registerB2b = createServerFn({ method: "POST" })
  .validator(registrationSchema)
  .handler(async ({ data }) => {
    const duplicate = await db
      .prepare("SELECT id FROM b2b_customers WHERE lower(email)=? OR mobile=?")
      .get(data.email, data.mobile);
    if (duplicate) throw new Error("An account with this email or mobile already exists.");

    const result = await db
      .prepare(
        `INSERT INTO b2b_customers(
        full_name,mobile,whatsapp,email,password_hash,business_name,business_type,gst_number,pan_number,
        years_in_business,expected_monthly_purchase,product_interests,business_address,city,state,pin_code,delivery_address
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        data.fullName,
        data.mobile,
        data.whatsapp,
        data.email,
        hashPassword(data.password),
        data.businessName,
        data.businessType,
        data.gstNumber.toUpperCase(),
        data.panNumber.toUpperCase(),
        data.yearsInBusiness,
        data.expectedMonthlyPurchase,
        data.productInterests,
        data.businessAddress,
        data.city,
        data.state,
        data.pinCode,
        data.deliveryAddress,
      );
    const customerId = Number(result.lastInsertRowid);
    const uploadDir = join(process.cwd(), ".data", "documents", String(customerId));
    mkdirSync(uploadDir, { recursive: true });
    const insertDocument = db.prepare(
      "INSERT INTO customer_documents(customer_id,kind,original_name,stored_name,mime_type,size) VALUES (?,?,?,?,?,?)",
    );
    for (const document of data.documents) {
      const extension =
        document.type === "application/pdf"
          ? ".pdf"
          : document.type === "image/png"
            ? ".png"
            : ".jpg";
      const storedName = `${document.kind}-${randomBytes(16).toString("hex")}${extension}`;
      const payload = document.data.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(payload, "base64");
      if (buffer.length !== document.size || extname(storedName) !== extension)
        throw new Error("Invalid document upload.");
      writeFileSync(join(uploadDir, storedName), buffer, { mode: 0o600 });
      await insertDocument.run(
        customerId,
        document.kind,
        document.name,
        storedName,
        document.type,
        buffer.length,
      );
    }
    await db
      .prepare(
        "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('registration',?,'customer',?)",
      )
      .run(`New B2B registration from ${data.businessName}`, customerId);
    return { ok: true };
  });

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(150),
  password: z.string().min(1).max(128),
  remember: z.boolean().default(false),
  actor: z.enum(["customer", "admin"]),
});

export const loginB2b = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    await db
      .prepare(
        "DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)",
      )
      .run();
    const recent = (await db
      .prepare(
        "SELECT count(*) count FROM login_attempts WHERE identifier=? AND attempted_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 MINUTE)",
      )
      .get(data.identifier.toLowerCase())) as { count: number };
    if (recent.count >= 8)
      throw new Error("Too many login attempts. Please try again in 15 minutes.");
    await db
      .prepare("INSERT INTO login_attempts(identifier) VALUES (?)")
      .run(data.identifier.toLowerCase());

    if (data.actor === "admin") {
      const admin = (await db
        .prepare("SELECT * FROM admin_users WHERE lower(email)=lower(?) AND active=1")
        .get(data.identifier)) as { id: number; password_hash: string } | undefined;
      if (!admin || !verifyPassword(data.password, admin.password_hash))
        throw new Error("Invalid credentials.");
      await createSession("admin", admin.id, data.remember);
      return { ok: true, status: "approved" };
    }

    const customer = (await db
      .prepare(
        "SELECT id,password_hash,status FROM b2b_customers WHERE lower(email)=lower(?) OR mobile=?",
      )
      .get(data.identifier, data.identifier)) as
      { id: number; password_hash: string; status: string } | undefined;
    if (!customer || !verifyPassword(data.password, customer.password_hash))
      throw new Error("Invalid credentials.");
    if (customer.status === "pending")
      throw new Error("Your B2B account is currently under verification.");
    if (customer.status === "rejected")
      throw new Error("Your B2B registration was not approved. Please contact our support team.");
    if (customer.status === "suspended")
      throw new Error("Your B2B account is suspended. Please contact support.");
    await createSession("customer", customer.id, data.remember);
    return { ok: true, status: customer.status };
  });

export const logoutB2b = createServerFn({ method: "POST" }).handler(async () => {
  await logout();
  return { ok: true };
});

export const changeB2bPassword = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        currentPassword: z.string().min(1),
        password: z.string().min(8).max(128),
        confirmPassword: z.string(),
      })
      .refine((value) => value.password === value.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
      }),
  )
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const row = (await db
      .prepare("SELECT password_hash FROM b2b_customers WHERE id=?")
      .get(customer.id)) as {
      password_hash: string;
    };
    if (!verifyPassword(data.currentPassword, row.password_hash))
      throw new Error("Current password is incorrect.");
    await db
      .prepare("UPDATE b2b_customers SET password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .run(hashPassword(data.password), customer.id);
    await db
      .prepare("DELETE FROM sessions WHERE actor_type='customer' AND actor_id=?")
      .run(customer.id);
    await logout();
    return { ok: true };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator(z.object({ identifier: z.string().trim().min(3).max(150) }))
  .handler(async ({ data }) => {
    const customer = (await db
      .prepare(
        "SELECT id,email,full_name FROM b2b_customers WHERE lower(email)=lower(?) OR mobile=?",
      )
      .get(data.identifier, data.identifier)) as
      { id: number; email: string; full_name: string } | undefined;
    if (!customer) return { ok: true, developmentToken: null as string | null };
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await db
      .prepare(
        "UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE customer_id=? AND used_at IS NULL",
      )
      .run(customer.id);
    await db
      .prepare(
        "INSERT INTO password_reset_tokens(customer_id,token_hash,expires_at) VALUES (?,?,?)",
      )
      .run(customer.id, tokenHash, new Date(Date.now() + 30 * 60 * 1000));
    const baseUrl = process.env["PUBLIC_APP_URL"] ?? "http://127.0.0.1:8080";
    const resetUrl = `${baseUrl}/wholesale/reset-password?token=${token}`;
    const webhook = process.env["PASSWORD_RESET_WEBHOOK_URL"];
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: customer.email, name: customer.full_name, resetUrl }),
      });
    }
    await db
      .prepare(
        "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('password_reset',?,'customer',?)",
      )
      .run(`Password reset requested by ${customer.email}`, customer.id);
    return { ok: true };
  });

export const resetB2bPassword = createServerFn({ method: "POST" })
  .validator(
    z
      .object({
        token: z.string().length(64),
        password: z.string().min(8).max(128),
        confirmPassword: z.string(),
      })
      .refine((value) => value.password === value.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
      }),
  )
  .handler(async ({ data }) => {
    const tokenHash = createHash("sha256").update(data.token).digest("hex");
    const reset = (await db
      .prepare(
        "SELECT id,customer_id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>CURRENT_TIMESTAMP",
      )
      .get(tokenHash)) as { id: number; customer_id: number } | undefined;
    if (!reset) throw new Error("This password reset link is invalid or has expired.");
    await db.transaction(async () => {
      await db
        .prepare("UPDATE b2b_customers SET password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
        .run(hashPassword(data.password), reset.customer_id);
      await db
        .prepare("UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?")
        .run(reset.id);
      await db
        .prepare("DELETE FROM sessions WHERE actor_type='customer' AND actor_id=?")
        .run(reset.customer_id);
    })();
    return { ok: true };
  });

export const getB2bSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session) return null;
  if (session.actorType === "admin") {
    const admin = await db
      .prepare("SELECT id,name,email,role FROM admin_users WHERE id=? AND active=1")
      .get(session.actorId);
    return admin ? { actorType: "admin" as const, user: admin } : null;
  }
  const customer = (await db
    .prepare(
      "SELECT id,full_name,email,mobile,business_name,status,business_address,city,state,pin_code,gst_number FROM b2b_customers WHERE id=?",
    )
    .get(session.actorId)) as CustomerSessionRow | undefined;
  return customer?.status === "approved"
    ? { actorType: "customer" as const, user: customer }
    : null;
});

export const getWholesaleProducts = createServerFn({ method: "GET" }).handler(async () => {
  await requireCustomer();
  return await db
    .prepare(
      `SELECT p.id,p.slug,p.sku,p.name,p.description,COALESCE((SELECT pi.path FROM product_images pi WHERE pi.product_id=p.id ORDER BY pi.sort_order LIMIT 1),p.image) image,p.wholesale_price,p.gst_rate,p.minimum_quantity,p.stock,
      c.name category,c.slug category_slug FROM products p JOIN product_categories c ON c.id=p.category_id WHERE p.active=1 AND p.deleted_at IS NULL AND p.wholesale_enabled=1 AND c.active=1 ORDER BY p.name`,
    )
    .all();
});

const quoteSchema = z.object({
  items: z
    .array(
      z.object({ productId: z.number().int().positive(), quantity: z.number().int().positive() }),
    )
    .min(1),
});

export const createQuotation = createServerFn({ method: "POST" })
  .validator(quoteSchema)
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    return await db.transaction(async () => {
      const gstRate = Number(
        (
          (await db
            .prepare("SELECT value FROM system_settings WHERE key_name='gst_rate'")
            .get()) as {
            value: string;
          }
        ).value,
      );
      const delivery = Number(
        (
          (await db
            .prepare("SELECT value FROM system_settings WHERE key_name='delivery_charges'")
            .get()) as {
            value: string;
          }
        ).value,
      );
      const resolved = await Promise.all(
        data.items.map(async (item: z.infer<typeof quoteSchema>["items"][number]) => {
          const product = (await db
            .prepare(
              "SELECT id,name,sku,wholesale_price,minimum_quantity,stock FROM products WHERE id=? AND active=1 AND deleted_at IS NULL AND wholesale_enabled=1",
            )
            .get(item.productId)) as
            | {
                id: number;
                name: string;
                sku: string;
                wholesale_price: number;
                minimum_quantity: number;
                stock: number;
              }
            | undefined;
          if (!product) throw new Error("A selected product is no longer available.");
          if (item.quantity < product.minimum_quantity)
            throw new Error(
              `${product.name} requires a minimum quantity of ${product.minimum_quantity}.`,
            );
          if (item.quantity > product.stock)
            throw new Error(`Only ${product.stock} units of ${product.name} are available.`);
          return {
            ...product,
            quantity: item.quantity,
            lineTotal: product.wholesale_price * item.quantity,
          };
        }),
      );
      const subtotal = resolved.reduce(
        (sum: number, item: { lineTotal: number }) => sum + item.lineTotal,
        0,
      );
      const gstAmount = Math.round(subtotal * (gstRate / 100) * 100) / 100;
      const grandTotal = subtotal + gstAmount + delivery;
      const year = new Date().getFullYear();
      const sequence = (await db
        .prepare("SELECT count(*) count FROM quotations WHERE quotation_number LIKE ?")
        .get(`QT-B2B-${year}-%`)) as { count: number };
      const number = `QT-B2B-${year}-${String(sequence.count + 1).padStart(4, "0")}`;
      const validUntil = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
      const quote = await db
        .prepare(
          `INSERT INTO quotations(quotation_number,customer_id,status,subtotal,gst_rate,gst_amount,delivery_charges,grand_total,valid_until)
          VALUES (?,?, 'generated',?,?,?,?,?,?)`,
        )
        .run(number, customer.id, subtotal, gstRate, gstAmount, delivery, grandTotal, validUntil);
      const quotationId = Number(quote.lastInsertRowid);
      const insert =
        db.prepare(`INSERT INTO quotation_items(quotation_id,product_id,product_name,sku,unit_price,minimum_quantity,quantity,line_total)
        VALUES (?,?,?,?,?,?,?,?)`);
      for (const item of resolved) {
        await insert.run(
          quotationId,
          item.id,
          item.name,
          item.sku,
          item.wholesale_price,
          item.minimum_quantity,
          item.quantity,
          item.lineTotal,
        );
      }
      await db
        .prepare(
          "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('quotation',?,'quotation',?)",
        )
        .run(`${number} generated by ${customer.business_name}`, quotationId);
      return { id: quotationId, quotationNumber: number };
    })();
  });

export const getMyB2bData = createServerFn({ method: "GET" }).handler(async () => {
  const customer = await requireCustomer();
  const quotations = await db
    .prepare(
      `SELECT q.*,count(qi.id) product_count,
      (SELECT count(*) FROM quotation_downloads d WHERE d.quotation_id=q.id) download_count,
      (SELECT count(*) FROM whatsapp_enquiry_clicks w WHERE w.quotation_id=q.id) whatsapp_count
      FROM quotations q LEFT JOIN quotation_items qi ON qi.quotation_id=q.id WHERE q.customer_id=? AND q.archived=0 GROUP BY q.id ORDER BY q.id DESC`,
    )
    .all(customer.id);
  const settings = Object.fromEntries(
    (
      (await db.prepare("SELECT key_name AS `key`,value FROM system_settings").all()) as {
        key: string;
        value: string;
      }[]
    ).map((setting) => [setting.key, Number(setting.value)]),
  );
  return { customer, quotations, settings };
});

export const getQuotation = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("UNAUTHORIZED");
    const quotation = (await db
      .prepare(
        `SELECT q.*,c.full_name,c.business_name,c.mobile,c.email,c.business_address,c.city,c.state,c.pin_code,c.gst_number
        FROM quotations q JOIN b2b_customers c ON c.id=q.customer_id WHERE q.id=?`,
      )
      .get(data.id)) as ({ customer_id: number } & Record<string, any>) | undefined;
    if (
      !quotation ||
      (session.actorType === "customer" && quotation.customer_id !== session.actorId)
    )
      throw new Error("NOT_FOUND");
    const items = await db
      .prepare("SELECT * FROM quotation_items WHERE quotation_id=? ORDER BY id")
      .all(data.id);
    const notes =
      session.actorType === "admin"
        ? await db
            .prepare(
              "SELECT n.*,a.name admin_name FROM admin_notes n LEFT JOIN admin_users a ON a.id=n.admin_id WHERE n.quotation_id=? ORDER BY n.id DESC",
            )
            .all(data.id)
        : [];
    return { quotation, items, notes };
  });

export const trackWhatsapp = createServerFn({ method: "POST" })
  .validator(z.object({ quotationId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const customer = await requireCustomer();
    const quote = await db
      .prepare("SELECT id FROM quotations WHERE id=? AND customer_id=?")
      .get(data.quotationId, customer.id);
    if (!quote) throw new Error("NOT_FOUND");
    await db
      .prepare("INSERT INTO whatsapp_enquiry_clicks(quotation_id,customer_id) VALUES (?,?)")
      .run(data.quotationId, customer.id);
    await db
      .prepare("UPDATE quotations SET status='new enquiry',updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .run(data.quotationId);
    await db
      .prepare(
        "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('whatsapp','WhatsApp enquiry opened','quotation',?)",
      )
      .run(data.quotationId);
    return { ok: true };
  });

export const downloadQuotationPdf = createServerFn({ method: "POST" })
  .validator(
    z.object({
      quotationId: z.number().int().positive(),
      trackDownload: z.boolean().default(true),
    }),
  )
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("UNAUTHORIZED");
    const quote = (await db
      .prepare("SELECT id,customer_id,quotation_number FROM quotations WHERE id=?")
      .get(data.quotationId)) as
      { id: number; customer_id: number; quotation_number: string } | undefined;
    if (!quote || (session.actorType === "customer" && quote.customer_id !== session.actorId))
      throw new Error("NOT_FOUND");
    if (session.actorType === "admin") await requireAdmin();
    else await requireCustomer();
    const pdf = await ensureQuotationPdf(data.quotationId);
    if (session.actorType === "customer" && data.trackDownload) {
      const details = (await db
        .prepare(
          `SELECT q.subtotal,q.gst_amount,q.grand_total,q.pdf_path,c.full_name,c.business_name,
          JSON_ARRAYAGG(JSON_OBJECT('product',qi.product_name,'sku',qi.sku,'quantity',qi.quantity,'unit_price',qi.unit_price,'line_total',qi.line_total)) product_details
          FROM quotations q JOIN b2b_customers c ON c.id=q.customer_id
          JOIN quotation_items qi ON qi.quotation_id=q.id WHERE q.id=? GROUP BY q.id`,
        )
        .get(data.quotationId)) as {
        subtotal: number;
        gst_amount: number;
        grand_total: number;
        pdf_path: string;
        full_name: string;
        business_name: string;
        product_details: string | Record<string, unknown>[];
      };
      await db
        .prepare(
          `INSERT INTO quotation_downloads(
          quotation_id,customer_id,customer_name,company_name,product_details,subtotal,gst_amount,grand_total,pdf_path
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          data.quotationId,
          session.actorId,
          details.full_name,
          details.business_name,
          typeof details.product_details === "string"
            ? details.product_details
            : JSON.stringify(details.product_details),
          details.subtotal,
          details.gst_amount,
          details.grand_total,
          details.pdf_path,
        );
      await db
        .prepare(
          "UPDATE quotations SET status=CASE WHEN status='generated' THEN 'downloaded' ELSE status END,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        )
        .run(data.quotationId);
      await db
        .prepare(
          "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('download',?,'quotation',?)",
        )
        .run(`${quote.quotation_number} downloaded`, data.quotationId);
    }
    return { fileName: `${quote.quotation_number}.pdf`, base64: pdf.buffer.toString("base64") };
  });

export const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const customers = await db.prepare("SELECT * FROM b2b_customers ORDER BY id DESC").all();
  const retailCustomers = await db
    .prepare(
      "SELECT id,full_name,mobile,email,status,last_login_at,created_at,updated_at FROM retail_customers ORDER BY id DESC",
    )
    .all();
  const retailOrderTables = await db
    .prepare(
      `SELECT count(*) count FROM information_schema.tables
       WHERE table_schema=DATABASE() AND table_name IN ('retail_orders','retail_order_items')`,
    )
    .get<{ count: number }>();
  const retailOrderSchemaReady = Number(retailOrderTables?.count || 0) === 2;
  const retailOrders = retailOrderSchemaReady
    ? await db
        .prepare(
          `SELECT o.*,c.full_name customer_name,c.mobile customer_mobile,
           count(i.id) item_count FROM retail_orders o
           JOIN retail_customers c ON c.id=o.customer_id
           LEFT JOIN retail_order_items i ON i.order_id=o.id
           GROUP BY o.id ORDER BY o.id DESC`,
        )
        .all()
    : [];
  const retailOrderItems = retailOrderSchemaReady
    ? await db.prepare("SELECT * FROM retail_order_items ORDER BY order_id,id").all()
    : [];
  const quotations = await db
    .prepare(
      `SELECT q.*,c.full_name,c.business_name,c.mobile,c.email,count(DISTINCT qi.id) product_count,
      count(DISTINCT d.id) download_count,max(d.downloaded_at) downloaded_at,count(DISTINCT w.id) whatsapp_count
      FROM quotations q JOIN b2b_customers c ON c.id=q.customer_id
      LEFT JOIN quotation_items qi ON qi.quotation_id=q.id LEFT JOIN quotation_downloads d ON d.quotation_id=q.id
      LEFT JOIN whatsapp_enquiry_clicks w ON w.quotation_id=q.id GROUP BY q.id ORDER BY q.id DESC`,
    )
    .all();
  const notifications = await db
    .prepare("SELECT * FROM notifications ORDER BY id DESC LIMIT 50")
    .all();
  const products = await db
    .prepare(
      `SELECT p.*,c.name category,
      COALESCE((SELECT pi.path FROM product_images pi WHERE pi.product_id=p.id ORDER BY pi.sort_order LIMIT 1),p.image) display_image,
      (SELECT count(*) FROM product_images pi WHERE pi.product_id=p.id) image_count
      FROM products p LEFT JOIN product_categories c ON c.id=p.category_id ORDER BY p.id DESC`,
    )
    .all();
  const categories = await db
    .prepare(
      `SELECT c.*,count(p.id) product_count FROM product_categories c
       LEFT JOIN products p ON p.category_id=c.id AND p.deleted_at IS NULL
       GROUP BY c.id ORDER BY c.sort_order,c.name`,
    )
    .all();
  const offers = await db
    .prepare(
      `SELECT o.*,c.name category,GROUP_CONCAT(op.product_id ORDER BY op.product_id) product_ids
       FROM offers o LEFT JOIN product_categories c ON c.id=o.category_id
       LEFT JOIN offer_products op ON op.offer_id=o.id GROUP BY o.id ORDER BY o.id DESC`,
    )
    .all();
  const productImages = await db
    .prepare("SELECT * FROM product_images ORDER BY product_id,sort_order,id")
    .all();
  const documents = await db
    .prepare(
      "SELECT id,customer_id,kind,original_name,mime_type,size,created_at FROM customer_documents ORDER BY id",
    )
    .all();
  const settings = await db.prepare("SELECT key_name AS `key`,value FROM system_settings").all();
  const quotationItems = await db
    .prepare("SELECT * FROM quotation_items ORDER BY quotation_id,id")
    .all();
  const notes = await db
    .prepare(
      "SELECT n.*,a.name admin_name FROM admin_notes n LEFT JOIN admin_users a ON a.id=n.admin_id ORDER BY n.id DESC",
    )
    .all();
  return {
    customers,
    retailCustomers,
    retailOrders,
    retailOrderItems,
    quotations,
    notifications,
    products,
    categories,
    offers,
    productImages,
    documents,
    settings,
    quotationItems,
    notes,
  };
});

export const updateRetailOrderStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      orderId: z.number().int().positive(),
      status: z.enum([
        "payment_pending",
        "placed",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ]),
      paymentStatus: z.enum(["pending", "paid", "cod", "failed", "refunded"]),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const result = await db
      .prepare(
        "UPDATE retail_orders SET status=?,payment_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
      .run(data.status, data.paymentStatus, data.orderId);
    if (!result.changes) throw new Error("Retail order not found.");
    return { ok: true };
  });

export const downloadCustomerDocument = createServerFn({ method: "POST" })
  .validator(z.object({ documentId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const document = (await db
      .prepare("SELECT * FROM customer_documents WHERE id=?")
      .get(data.documentId)) as
      | { customer_id: number; original_name: string; stored_name: string; mime_type: string }
      | undefined;
    if (!document) throw new Error("Document not found.");
    const path = join(
      process.cwd(),
      ".data",
      "documents",
      String(document.customer_id),
      document.stored_name,
    );
    return {
      fileName: document.original_name,
      mimeType: document.mime_type,
      base64: readFileSync(path).toString("base64"),
    };
  });

export const updateCustomerStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      customerId: z.number().int().positive(),
      status: z.enum(["pending", "approved", "rejected", "suspended"]),
      remarks: z.string().max(500),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    await db
      .prepare(
        "UPDATE b2b_customers SET status=?,rejection_remarks=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      )
      .run(data.status, data.remarks, data.customerId);
    return { ok: true };
  });

export const updateQuotationStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      quotationId: z.number().int().positive(),
      status: z.string().min(2).max(40),
      note: z.string().max(1000),
    }),
  )
  .handler(async ({ data }) => {
    const admin = await requireAdmin();
    await db
      .prepare("UPDATE quotations SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .run(data.status, data.quotationId);
    if (data.note.trim())
      await db
        .prepare("INSERT INTO admin_notes(quotation_id,admin_id,note) VALUES (?,?,?)")
        .run(data.quotationId, admin.id, data.note.trim());
    if (data.status === "converted to order") {
      const quote = (await db
        .prepare("SELECT customer_id,grand_total FROM quotations WHERE id=?")
        .get(data.quotationId)) as { customer_id: number; grand_total: number };
      await db
        .prepare(
          "INSERT IGNORE INTO orders(quotation_id,customer_id,order_number,total) VALUES (?,?,?,?)",
        )
        .run(
          data.quotationId,
          quote.customer_id,
          `ORD-B2B-${new Date().getFullYear()}-${String(data.quotationId).padStart(4, "0")}`,
          quote.grand_total,
        );
      await db
        .prepare(
          "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('order','Quotation converted to order','quotation',?)",
        )
        .run(data.quotationId);
    }
    return { ok: true };
  });

export const archiveQuotation = createServerFn({ method: "POST" })
  .validator(z.object({ quotationId: z.number().int().positive(), archived: z.boolean() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await db
      .prepare("UPDATE quotations SET archived=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .run(data.archived ? 1 : 0, data.quotationId);
    return { ok: true };
  });

const productSchema = z.object({
  id: z.number().int().positive().optional(),
  sku: z.string().trim().min(2).max(50),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(2).max(160),
  category: z.string().trim().min(2).max(100),
  description: z.string().trim().max(2000),
  image: z.string().trim().max(500),
  retailPrice: z.number().nonnegative(),
  mrp: z.number().nonnegative(),
  wholesalePrice: z.number().nonnegative(),
  gstRate: z.number().min(0).max(100),
  minimumQuantity: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
  active: z.boolean(),
  featured: z.boolean(),
  isNew: z.boolean(),
  wholesaleEnabled: z.boolean(),
  botanical: z.string().trim().max(190),
  sunlight: z.enum(["Bright Indirect", "Full Sun", "Partial Shade", "Low Light"]),
  water: z.enum(["Low", "Medium", "High"]),
  sizeLabel: z.enum(["Small", "Medium", "Large"]),
  potSize: z.string().trim().min(1).max(80),
  potType: z.string().trim().min(1).max(100),
  placement: z.enum(["Indoor", "Outdoor"]),
  petSafe: z.boolean(),
  difficulty: z.enum(["Easy", "Moderate"]),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  care: z.array(z.string().trim().min(1).max(300)).max(12),
  groups: z.array(z.string().trim().min(1).max(60)).max(20),
  images: z
    .array(
      z.object({
        name: z.string().max(180),
        type: z.enum(["image/jpeg", "image/png", "image/webp"]),
        size: z
          .number()
          .positive()
          .max(5 * 1024 * 1024),
        data: z.string().min(1),
      }),
    )
    .max(8)
    .default([]),
});

export const saveProduct = createServerFn({ method: "POST" })
  .validator(productSchema)
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.prepare("INSERT IGNORE INTO product_categories(name,slug) VALUES (?,?)").run(
      data.category,
      data.category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
    const category = (await db
      .prepare("SELECT id FROM product_categories WHERE name=?")
      .get(data.category)) as { id: number };
    if (data.id) {
      await db
        .prepare(
          `UPDATE products SET sku=?,slug=?,name=?,category_id=?,description=?,image=?,retail_price=?,mrp=?,wholesale_price=?,gst_rate=?,minimum_quantity=?,stock=?,active=?,featured=?,is_new=?,wholesale_enabled=?,botanical=?,sunlight=?,water_requirement=?,size_label=?,pot_size=?,pot_type=?,placement=?,pet_safe=?,difficulty=?,rating=?,review_count=?,care_instructions=?,product_groups=?,deleted_at=NULL WHERE id=?`,
        )
        .run(
          data.sku,
          data.slug,
          data.name,
          category.id,
          data.description,
          data.image,
          data.retailPrice,
          data.mrp,
          data.wholesalePrice,
          data.gstRate,
          data.minimumQuantity,
          data.stock,
          data.active ? 1 : 0,
          data.featured ? 1 : 0,
          data.isNew ? 1 : 0,
          data.wholesaleEnabled ? 1 : 0,
          data.botanical,
          data.sunlight,
          data.water,
          data.sizeLabel,
          data.potSize,
          data.potType,
          data.placement,
          data.petSafe ? 1 : 0,
          data.difficulty,
          data.rating,
          data.reviewCount,
          JSON.stringify(data.care),
          JSON.stringify(data.groups),
          data.id,
        );
    } else {
      await db
        .prepare(
          `INSERT INTO products(slug,sku,name,category_id,description,image,retail_price,mrp,wholesale_price,gst_rate,minimum_quantity,stock,active,featured,is_new,wholesale_enabled,botanical,sunlight,water_requirement,size_label,pot_size,pot_type,placement,pet_safe,difficulty,rating,review_count,care_instructions,product_groups)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          data.slug,
          data.sku,
          data.name,
          category.id,
          data.description,
          data.image,
          data.retailPrice,
          data.mrp,
          data.wholesalePrice,
          data.gstRate,
          data.minimumQuantity,
          data.stock,
          data.active ? 1 : 0,
          data.featured ? 1 : 0,
          data.isNew ? 1 : 0,
          data.wholesaleEnabled ? 1 : 0,
          data.botanical,
          data.sunlight,
          data.water,
          data.sizeLabel,
          data.potSize,
          data.potType,
          data.placement,
          data.petSafe ? 1 : 0,
          data.difficulty,
          data.rating,
          data.reviewCount,
          JSON.stringify(data.care),
          JSON.stringify(data.groups),
        );
    }
    if (data.images.length) {
      const product = (await db.prepare("SELECT id FROM products WHERE sku=?").get(data.sku)) as {
        id: number;
      };
      await db.prepare("DELETE FROM product_images WHERE product_id=?").run(product.id);
      const insertImage = db.prepare(
        "INSERT INTO product_images(product_id,path,sort_order) VALUES (?,?,?)",
      );
      for (const [index, image] of data.images.entries())
        await insertImage.run(product.id, image.data, index);
    }
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator(z.object({ productId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const referenced = (await db
      .prepare("SELECT count(*) count FROM quotation_items WHERE product_id=?")
      .get(data.productId)) as { count: number };
    if (Number(referenced.count) > 0) {
      await db
        .prepare("UPDATE products SET active=0,deleted_at=CURRENT_TIMESTAMP WHERE id=?")
        .run(data.productId);
      return { deleted: false, archived: true };
    }
    await db.prepare("DELETE FROM products WHERE id=?").run(data.productId);
    return { deleted: true, archived: false };
  });

export const deleteProductImage = createServerFn({ method: "POST" })
  .validator(z.object({ imageId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.prepare("DELETE FROM product_images WHERE id=?").run(data.imageId);
    return { ok: true };
  });

export const reorderProductImages = createServerFn({ method: "POST" })
  .validator(
    z.object({
      productId: z.number().int().positive(),
      imageIds: z.array(z.number().int().positive()).max(8),
    }),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const existing = (await db
      .prepare("SELECT id FROM product_images WHERE product_id=? ORDER BY sort_order,id")
      .all(data.productId)) as { id: number }[];
    const expected = existing.map((item) => Number(item.id)).sort((a, b) => a - b);
    const supplied = [...data.imageIds].sort((a, b) => a - b);
    if (expected.join(",") !== supplied.join(",")) throw new Error("Invalid image order.");
    await db.transaction(async () => {
      for (const [index, imageId] of data.imageIds.entries())
        await db
          .prepare("UPDATE product_images SET sort_order=? WHERE id=? AND product_id=?")
          .run(index, imageId, data.productId);
    })();
    return { ok: true };
  });

const categorySchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .max(160),
  description: z.string().trim().max(1000),
  image: z.string().trim().max(2000000),
  sortOrder: z.number().int().min(0).max(10000),
  active: z.boolean(),
});

export const saveCategory = createServerFn({ method: "POST" })
  .validator(categorySchema)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (data.id)
      await db
        .prepare(
          "UPDATE product_categories SET name=?,slug=?,description=?,image=?,sort_order=?,active=? WHERE id=?",
        )
        .run(
          data.name,
          data.slug,
          data.description,
          data.image,
          data.sortOrder,
          data.active ? 1 : 0,
          data.id,
        );
    else
      await db
        .prepare(
          "INSERT INTO product_categories(name,slug,description,image,sort_order,active) VALUES (?,?,?,?,?,?)",
        )
        .run(
          data.name,
          data.slug,
          data.description,
          data.image,
          data.sortOrder,
          data.active ? 1 : 0,
        );
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator(z.object({ categoryId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    const used = (await db
      .prepare("SELECT count(*) count FROM products WHERE category_id=? AND deleted_at IS NULL")
      .get(data.categoryId)) as { count: number };
    if (Number(used.count) > 0) {
      await db.prepare("UPDATE product_categories SET active=0 WHERE id=?").run(data.categoryId);
      return { deleted: false, archived: true };
    }
    await db.prepare("DELETE FROM product_categories WHERE id=?").run(data.categoryId);
    return { deleted: true, archived: false };
  });

const offerSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(190),
  description: z.string().trim().max(1000),
  offerType: z.enum(["percentage", "fixed", "buy_x_get_percentage"]),
  discountValue: z.number().min(0),
  buyQuantity: z.number().int().positive(),
  rewardQuantity: z.number().int().positive(),
  categoryId: z.number().int().positive().nullable(),
  productIds: z.array(z.number().int().positive()).max(500),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  active: z.boolean(),
});

export const saveOffer = createServerFn({ method: "POST" })
  .validator(offerSchema)
  .handler(async ({ data }) => {
    await requireAdmin();
    return db.transaction(async () => {
      let offerId = data.id;
      if (offerId) {
        await db
          .prepare(
            `UPDATE offers SET name=?,description=?,offer_type=?,discount_value=?,buy_quantity=?,reward_quantity=?,category_id=?,starts_at=?,ends_at=?,active=? WHERE id=?`,
          )
          .run(
            data.name,
            data.description,
            data.offerType,
            data.discountValue,
            data.buyQuantity,
            data.rewardQuantity,
            data.categoryId,
            data.startsAt,
            data.endsAt,
            data.active ? 1 : 0,
            offerId,
          );
      } else {
        const result = await db
          .prepare(
            `INSERT INTO offers(name,description,offer_type,discount_value,buy_quantity,reward_quantity,category_id,starts_at,ends_at,active) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          )
          .run(
            data.name,
            data.description,
            data.offerType,
            data.discountValue,
            data.buyQuantity,
            data.rewardQuantity,
            data.categoryId,
            data.startsAt,
            data.endsAt,
            data.active ? 1 : 0,
          );
        offerId = result.insertId;
      }
      await db.prepare("DELETE FROM offer_products WHERE offer_id=?").run(offerId);
      for (const productId of data.productIds)
        await db
          .prepare("INSERT INTO offer_products(offer_id,product_id) VALUES (?,?)")
          .run(offerId, productId);
      return { id: offerId };
    })();
  });

export const deleteOffer = createServerFn({ method: "POST" })
  .validator(z.object({ offerId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await db.prepare("DELETE FROM offers WHERE id=?").run(data.offerId);
    return { ok: true };
  });

export const updateSystemSettings = createServerFn({ method: "POST" })
  .validator(
    z.object({ gstRate: z.number().min(0).max(100), deliveryCharges: z.number().nonnegative() }),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const update = db.prepare(
      "INSERT INTO system_settings(key_name,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE value=VALUES(value),updated_at=CURRENT_TIMESTAMP",
    );
    await update.run("gst_rate", String(data.gstRate));
    await update.run("delivery_charges", String(data.deliveryCharges));
    return { ok: true };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .validator(z.object({ notificationId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await requireAdmin();
    await db
      .prepare("UPDATE notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE id=?")
      .run(data.notificationId);
    return { ok: true };
  });
