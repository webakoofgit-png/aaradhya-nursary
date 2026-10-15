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
    const duplicate = db
      .prepare("SELECT id FROM b2b_customers WHERE lower(email)=? OR mobile=?")
      .get(data.email, data.mobile);
    if (duplicate) throw new Error("An account with this email or mobile already exists.");

    const result = db
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
      insertDocument.run(
        customerId,
        document.kind,
        document.name,
        storedName,
        document.type,
        buffer.length,
      );
    }
    db.prepare(
      "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('registration',?,'customer',?)",
    ).run(`New B2B registration from ${data.businessName}`, customerId);
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
    const recent = db
      .prepare(
        "SELECT count(*) count FROM login_attempts WHERE identifier=? AND attempted_at > datetime('now','-15 minutes')",
      )
      .get(data.identifier.toLowerCase()) as { count: number };
    if (recent.count >= 8)
      throw new Error("Too many login attempts. Please try again in 15 minutes.");
    db.prepare("INSERT INTO login_attempts(identifier) VALUES (?)").run(
      data.identifier.toLowerCase(),
    );

    if (data.actor === "admin") {
      const admin = db
        .prepare("SELECT * FROM admin_users WHERE lower(email)=lower(?) AND active=1")
        .get(data.identifier) as { id: number; password_hash: string } | undefined;
      if (!admin || !verifyPassword(data.password, admin.password_hash))
        throw new Error("Invalid credentials.");
      createSession("admin", admin.id, data.remember);
      return { ok: true, status: "approved" };
    }

    const customer = db
      .prepare(
        "SELECT id,password_hash,status FROM b2b_customers WHERE lower(email)=lower(?) OR mobile=?",
      )
      .get(data.identifier, data.identifier) as
      { id: number; password_hash: string; status: string } | undefined;
    if (!customer || !verifyPassword(data.password, customer.password_hash))
      throw new Error("Invalid credentials.");
    if (customer.status === "pending")
      throw new Error("Your B2B account is currently under verification.");
    if (customer.status === "rejected")
      throw new Error("Your B2B registration was not approved. Please contact our support team.");
    if (customer.status === "suspended")
      throw new Error("Your B2B account is suspended. Please contact support.");
    createSession("customer", customer.id, data.remember);
    return { ok: true, status: customer.status };
  });

export const logoutB2b = createServerFn({ method: "POST" }).handler(async () => {
  logout();
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
    const customer = requireCustomer();
    const row = db
      .prepare("SELECT password_hash FROM b2b_customers WHERE id=?")
      .get(customer.id) as {
      password_hash: string;
    };
    if (!verifyPassword(data.currentPassword, row.password_hash))
      throw new Error("Current password is incorrect.");
    db.prepare(
      "UPDATE b2b_customers SET password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
    ).run(hashPassword(data.password), customer.id);
    db.prepare("DELETE FROM sessions WHERE actor_type='customer' AND actor_id=?").run(customer.id);
    logout();
    return { ok: true };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator(z.object({ identifier: z.string().trim().min(3).max(150) }))
  .handler(async ({ data }) => {
    const customer = db
      .prepare(
        "SELECT id,email,full_name FROM b2b_customers WHERE lower(email)=lower(?) OR mobile=?",
      )
      .get(data.identifier, data.identifier) as
      { id: number; email: string; full_name: string } | undefined;
    if (!customer) return { ok: true, developmentToken: null as string | null };
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    db.prepare(
      "UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE customer_id=? AND used_at IS NULL",
    ).run(customer.id);
    db.prepare(
      "INSERT INTO password_reset_tokens(customer_id,token_hash,expires_at) VALUES (?,?,?)",
    ).run(customer.id, tokenHash, new Date(Date.now() + 30 * 60 * 1000).toISOString());
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
    db.prepare(
      "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('password_reset',?,'customer',?)",
    ).run(`Password reset requested by ${customer.email}`, customer.id);
    return { ok: true, developmentToken: process.env["NODE_ENV"] === "production" ? null : token };
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
    const reset = db
      .prepare(
        "SELECT id,customer_id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>?",
      )
      .get(tokenHash, new Date().toISOString()) as { id: number; customer_id: number } | undefined;
    if (!reset) throw new Error("This password reset link is invalid or has expired.");
    db.transaction(() => {
      db.prepare(
        "UPDATE b2b_customers SET password_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      ).run(hashPassword(data.password), reset.customer_id);
      db.prepare("UPDATE password_reset_tokens SET used_at=CURRENT_TIMESTAMP WHERE id=?").run(
        reset.id,
      );
      db.prepare("DELETE FROM sessions WHERE actor_type='customer' AND actor_id=?").run(
        reset.customer_id,
      );
    })();
    return { ok: true };
  });

export const getB2bSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = getSession();
  if (!session) return null;
  if (session.actorType === "admin") {
    const admin = db
      .prepare("SELECT id,name,email,role FROM admin_users WHERE id=? AND active=1")
      .get(session.actorId);
    return admin ? { actorType: "admin" as const, user: admin } : null;
  }
  const customer = db
    .prepare(
      "SELECT id,full_name,email,mobile,business_name,status,business_address,city,state,pin_code,gst_number FROM b2b_customers WHERE id=?",
    )
    .get(session.actorId) as CustomerSessionRow | undefined;
  return customer?.status === "approved"
    ? { actorType: "customer" as const, user: customer }
    : null;
});

export const getWholesaleProducts = createServerFn({ method: "GET" }).handler(async () => {
  requireCustomer();
  return db
    .prepare(
      `SELECT p.id,p.slug,p.sku,p.name,p.description,COALESCE((SELECT pi.path FROM product_images pi WHERE pi.product_id=p.id ORDER BY pi.sort_order LIMIT 1),p.image) image,p.wholesale_price,p.gst_rate,p.minimum_quantity,p.stock,
      c.name category,c.slug category_slug FROM products p JOIN product_categories c ON c.id=p.category_id WHERE p.active=1 ORDER BY p.name`,
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
    const customer = requireCustomer();
    return db.transaction(() => {
      const gstRate = Number(
        (
          db.prepare("SELECT value FROM system_settings WHERE key='gst_rate'").get() as {
            value: string;
          }
        ).value,
      );
      const delivery = Number(
        (
          db.prepare("SELECT value FROM system_settings WHERE key='delivery_charges'").get() as {
            value: string;
          }
        ).value,
      );
      const resolved = data.items.map((item: z.infer<typeof quoteSchema>["items"][number]) => {
        const product = db
          .prepare(
            "SELECT id,name,sku,wholesale_price,minimum_quantity,stock FROM products WHERE id=? AND active=1",
          )
          .get(item.productId) as
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
      });
      const subtotal = resolved.reduce(
        (sum: number, item: { lineTotal: number }) => sum + item.lineTotal,
        0,
      );
      const gstAmount = Math.round(subtotal * (gstRate / 100) * 100) / 100;
      const grandTotal = subtotal + gstAmount + delivery;
      const year = new Date().getFullYear();
      const sequence = db
        .prepare("SELECT count(*) count FROM quotations WHERE quotation_number LIKE ?")
        .get(`QT-B2B-${year}-%`) as { count: number };
      const number = `QT-B2B-${year}-${String(sequence.count + 1).padStart(4, "0")}`;
      const validUntil = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
      const quote = db
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
        insert.run(
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
      db.prepare(
        "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('quotation',?,'quotation',?)",
      ).run(`${number} generated by ${customer.business_name}`, quotationId);
      return { id: quotationId, quotationNumber: number };
    })();
  });

export const getMyB2bData = createServerFn({ method: "GET" }).handler(async () => {
  const customer = requireCustomer();
  const quotations = db
    .prepare(
      `SELECT q.*,count(qi.id) product_count,
      (SELECT count(*) FROM quotation_downloads d WHERE d.quotation_id=q.id) download_count,
      (SELECT count(*) FROM whatsapp_enquiry_clicks w WHERE w.quotation_id=q.id) whatsapp_count
      FROM quotations q LEFT JOIN quotation_items qi ON qi.quotation_id=q.id WHERE q.customer_id=? AND q.archived=0 GROUP BY q.id ORDER BY q.id DESC`,
    )
    .all(customer.id);
  const settings = Object.fromEntries(
    (
      db.prepare("SELECT key,value FROM system_settings").all() as { key: string; value: string }[]
    ).map((setting) => [setting.key, Number(setting.value)]),
  );
  return { customer, quotations, settings };
});

export const getQuotation = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const session = getSession();
    if (!session) throw new Error("UNAUTHORIZED");
    const quotation = db
      .prepare(
        `SELECT q.*,c.full_name,c.business_name,c.mobile,c.email,c.business_address,c.city,c.state,c.pin_code,c.gst_number
        FROM quotations q JOIN b2b_customers c ON c.id=q.customer_id WHERE q.id=?`,
      )
      .get(data.id) as ({ customer_id: number } & Record<string, unknown>) | undefined;
    if (
      !quotation ||
      (session.actorType === "customer" && quotation.customer_id !== session.actorId)
    )
      throw new Error("NOT_FOUND");
    const items = db
      .prepare("SELECT * FROM quotation_items WHERE quotation_id=? ORDER BY id")
      .all(data.id);
    const notes =
      session.actorType === "admin"
        ? db
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
    const customer = requireCustomer();
    const quote = db
      .prepare("SELECT id FROM quotations WHERE id=? AND customer_id=?")
      .get(data.quotationId, customer.id);
    if (!quote) throw new Error("NOT_FOUND");
    db.prepare("INSERT INTO whatsapp_enquiry_clicks(quotation_id,customer_id) VALUES (?,?)").run(
      data.quotationId,
      customer.id,
    );
    db.prepare(
      "UPDATE quotations SET status='new enquiry',updated_at=CURRENT_TIMESTAMP WHERE id=?",
    ).run(data.quotationId);
    db.prepare(
      "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('whatsapp','WhatsApp enquiry opened','quotation',?)",
    ).run(data.quotationId);
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
    const session = getSession();
    if (!session) throw new Error("UNAUTHORIZED");
    const quote = db
      .prepare("SELECT id,customer_id,quotation_number FROM quotations WHERE id=?")
      .get(data.quotationId) as
      { id: number; customer_id: number; quotation_number: string } | undefined;
    if (!quote || (session.actorType === "customer" && quote.customer_id !== session.actorId))
      throw new Error("NOT_FOUND");
    if (session.actorType === "admin") requireAdmin();
    else requireCustomer();
    const pdf = await ensureQuotationPdf(data.quotationId);
    if (session.actorType === "customer" && data.trackDownload) {
      const details = db
        .prepare(
          `SELECT q.subtotal,q.gst_amount,q.grand_total,q.pdf_path,c.full_name,c.business_name,
          json_group_array(json_object('product',qi.product_name,'sku',qi.sku,'quantity',qi.quantity,'unit_price',qi.unit_price,'line_total',qi.line_total)) product_details
          FROM quotations q JOIN b2b_customers c ON c.id=q.customer_id
          JOIN quotation_items qi ON qi.quotation_id=q.id WHERE q.id=? GROUP BY q.id`,
        )
        .get(data.quotationId) as {
        subtotal: number;
        gst_amount: number;
        grand_total: number;
        pdf_path: string;
        full_name: string;
        business_name: string;
        product_details: string;
      };
      db.prepare(
        `INSERT INTO quotation_downloads(
          quotation_id,customer_id,customer_name,company_name,product_details,subtotal,gst_amount,grand_total,pdf_path
        ) VALUES (?,?,?,?,?,?,?,?,?)`,
      ).run(
        data.quotationId,
        session.actorId,
        details.full_name,
        details.business_name,
        details.product_details,
        details.subtotal,
        details.gst_amount,
        details.grand_total,
        details.pdf_path,
      );
      db.prepare(
        "UPDATE quotations SET status=CASE WHEN status='generated' THEN 'downloaded' ELSE status END,updated_at=CURRENT_TIMESTAMP WHERE id=?",
      ).run(data.quotationId);
      db.prepare(
        "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('download',?,'quotation',?)",
      ).run(`${quote.quotation_number} downloaded`, data.quotationId);
    }
    return { fileName: `${quote.quotation_number}.pdf`, base64: pdf.buffer.toString("base64") };
  });

export const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  const customers = db.prepare("SELECT * FROM b2b_customers ORDER BY id DESC").all();
  const quotations = db
    .prepare(
      `SELECT q.*,c.full_name,c.business_name,c.mobile,c.email,count(DISTINCT qi.id) product_count,
      count(DISTINCT d.id) download_count,max(d.downloaded_at) downloaded_at,count(DISTINCT w.id) whatsapp_count
      FROM quotations q JOIN b2b_customers c ON c.id=q.customer_id
      LEFT JOIN quotation_items qi ON qi.quotation_id=q.id LEFT JOIN quotation_downloads d ON d.quotation_id=q.id
      LEFT JOIN whatsapp_enquiry_clicks w ON w.quotation_id=q.id GROUP BY q.id ORDER BY q.id DESC`,
    )
    .all();
  const notifications = db.prepare("SELECT * FROM notifications ORDER BY id DESC LIMIT 50").all();
  const products = db
    .prepare(
      "SELECT p.*,c.name category FROM products p LEFT JOIN product_categories c ON c.id=p.category_id ORDER BY p.id DESC",
    )
    .all();
  const documents = db
    .prepare(
      "SELECT id,customer_id,kind,original_name,mime_type,size,created_at FROM customer_documents ORDER BY id",
    )
    .all();
  const settings = db.prepare("SELECT key,value FROM system_settings").all();
  const quotationItems = db.prepare("SELECT * FROM quotation_items ORDER BY quotation_id,id").all();
  const notes = db
    .prepare(
      "SELECT n.*,a.name admin_name FROM admin_notes n LEFT JOIN admin_users a ON a.id=n.admin_id ORDER BY n.id DESC",
    )
    .all();
  return {
    customers,
    quotations,
    notifications,
    products,
    documents,
    settings,
    quotationItems,
    notes,
  };
});

export const downloadCustomerDocument = createServerFn({ method: "POST" })
  .validator(z.object({ documentId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    requireAdmin();
    const document = db
      .prepare("SELECT * FROM customer_documents WHERE id=?")
      .get(data.documentId) as
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
    requireAdmin();
    db.prepare(
      "UPDATE b2b_customers SET status=?,rejection_remarks=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
    ).run(data.status, data.remarks, data.customerId);
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
    const admin = requireAdmin();
    db.prepare("UPDATE quotations SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(
      data.status,
      data.quotationId,
    );
    if (data.note.trim())
      db.prepare("INSERT INTO admin_notes(quotation_id,admin_id,note) VALUES (?,?,?)").run(
        data.quotationId,
        admin.id,
        data.note.trim(),
      );
    if (data.status === "converted to order") {
      const quote = db
        .prepare("SELECT customer_id,grand_total FROM quotations WHERE id=?")
        .get(data.quotationId) as { customer_id: number; grand_total: number };
      db.prepare(
        "INSERT OR IGNORE INTO orders(quotation_id,customer_id,order_number,total) VALUES (?,?,?,?)",
      ).run(
        data.quotationId,
        quote.customer_id,
        `ORD-B2B-${new Date().getFullYear()}-${String(data.quotationId).padStart(4, "0")}`,
        quote.grand_total,
      );
      db.prepare(
        "INSERT INTO notifications(type,message,entity_type,entity_id) VALUES ('order','Quotation converted to order','quotation',?)",
      ).run(data.quotationId);
    }
    return { ok: true };
  });

export const archiveQuotation = createServerFn({ method: "POST" })
  .validator(z.object({ quotationId: z.number().int().positive(), archived: z.boolean() }))
  .handler(async ({ data }) => {
    requireAdmin();
    db.prepare("UPDATE quotations SET archived=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(
      data.archived ? 1 : 0,
      data.quotationId,
    );
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
  wholesalePrice: z.number().nonnegative(),
  gstRate: z.number().min(0).max(100),
  minimumQuantity: z.number().int().positive(),
  stock: z.number().int().nonnegative(),
  active: z.boolean(),
  featured: z.boolean(),
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
    requireAdmin();
    db.prepare("INSERT OR IGNORE INTO product_categories(name,slug) VALUES (?,?)").run(
      data.category,
      data.category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
    const category = db
      .prepare("SELECT id FROM product_categories WHERE name=?")
      .get(data.category) as { id: number };
    if (data.id) {
      db.prepare(
        `UPDATE products SET sku=?,slug=?,name=?,category_id=?,description=?,image=?,retail_price=?,wholesale_price=?,gst_rate=?,minimum_quantity=?,stock=?,active=?,featured=? WHERE id=?`,
      ).run(
        data.sku,
        data.slug,
        data.name,
        category.id,
        data.description,
        data.image,
        data.retailPrice,
        data.wholesalePrice,
        data.gstRate,
        data.minimumQuantity,
        data.stock,
        data.active ? 1 : 0,
        data.featured ? 1 : 0,
        data.id,
      );
    } else {
      db.prepare(
        `INSERT INTO products(slug,sku,name,category_id,description,image,retail_price,wholesale_price,gst_rate,minimum_quantity,stock,active,featured)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ).run(
        data.slug,
        data.sku,
        data.name,
        category.id,
        data.description,
        data.image,
        data.retailPrice,
        data.wholesalePrice,
        data.gstRate,
        data.minimumQuantity,
        data.stock,
        data.active ? 1 : 0,
        data.featured ? 1 : 0,
      );
    }
    if (data.images.length) {
      const product = db.prepare("SELECT id FROM products WHERE sku=?").get(data.sku) as {
        id: number;
      };
      db.prepare("DELETE FROM product_images WHERE product_id=?").run(product.id);
      const insertImage = db.prepare(
        "INSERT INTO product_images(product_id,path,sort_order) VALUES (?,?,?)",
      );
      data.images.forEach((image: { data: string }, index: number) =>
        insertImage.run(product.id, image.data, index),
      );
    }
    return { ok: true };
  });

export const updateSystemSettings = createServerFn({ method: "POST" })
  .validator(
    z.object({ gstRate: z.number().min(0).max(100), deliveryCharges: z.number().nonnegative() }),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const update = db.prepare(
      "INSERT INTO system_settings(key,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP",
    );
    update.run("gst_rate", String(data.gstRate));
    update.run("delivery_charges", String(data.deliveryCharges));
    return { ok: true };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .validator(z.object({ notificationId: z.number().int().positive() }))
  .handler(async ({ data }) => {
    requireAdmin();
    db.prepare(
      "UPDATE notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE id=?",
    ).run(data.notificationId);
    return { ok: true };
  });
