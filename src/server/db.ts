import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { products as retailProducts } from "@/data/catalog";

const dataDir = join(process.cwd(), ".data");
mkdirSync(dataDir, { recursive: true });

export const db = new Database(join(dataDir, "verdant.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
  password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'admin', active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS b2b_customers (
  id INTEGER PRIMARY KEY, full_name TEXT NOT NULL, mobile TEXT NOT NULL UNIQUE, whatsapp TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, business_name TEXT NOT NULL,
  business_type TEXT NOT NULL, gst_number TEXT, pan_number TEXT, years_in_business INTEGER,
  expected_monthly_purchase TEXT, product_interests TEXT, business_address TEXT NOT NULL,
  city TEXT NOT NULL, state TEXT NOT NULL, pin_code TEXT NOT NULL, delivery_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','suspended')),
  rejection_remarks TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS customer_documents (
  id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES b2b_customers(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, original_name TEXT NOT NULL, stored_name TEXT NOT NULL, mime_type TEXT NOT NULL,
  size INTEGER NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS product_categories (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY, source_id TEXT UNIQUE, slug TEXT NOT NULL UNIQUE, sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, category_id INTEGER REFERENCES product_categories(id), description TEXT,
  image TEXT, retail_price REAL NOT NULL, wholesale_price REAL NOT NULL, gst_rate REAL NOT NULL DEFAULT 18,
  minimum_quantity INTEGER NOT NULL DEFAULT 1, stock INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1, featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  path TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS quotations (
  id INTEGER PRIMARY KEY, quotation_number TEXT UNIQUE, customer_id INTEGER NOT NULL REFERENCES b2b_customers(id),
  status TEXT NOT NULL DEFAULT 'draft', subtotal REAL NOT NULL DEFAULT 0, gst_rate REAL NOT NULL DEFAULT 18,
  gst_amount REAL NOT NULL DEFAULT 0, delivery_charges REAL NOT NULL DEFAULT 0, grand_total REAL NOT NULL DEFAULT 0,
  pdf_path TEXT, valid_until TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  archived INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS quotation_items (
  id INTEGER PRIMARY KEY, quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id), product_name TEXT NOT NULL, sku TEXT NOT NULL,
  unit_price REAL NOT NULL, minimum_quantity INTEGER NOT NULL, quantity INTEGER NOT NULL, line_total REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS quotation_downloads (
  id INTEGER PRIMARY KEY, quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES b2b_customers(id), downloaded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS whatsapp_enquiry_clicks (
  id INTEGER PRIMARY KEY, quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES b2b_customers(id), clicked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY, type TEXT NOT NULL, message TEXT NOT NULL, entity_type TEXT, entity_id INTEGER,
  read_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY, quotation_id INTEGER NOT NULL UNIQUE REFERENCES quotations(id), customer_id INTEGER NOT NULL REFERENCES b2b_customers(id),
  order_number TEXT NOT NULL UNIQUE, total REAL NOT NULL, status TEXT NOT NULL DEFAULT 'confirmed', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS admin_notes (
  id INTEGER PRIMARY KEY, quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES admin_users(id), note TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, actor_type TEXT NOT NULL, actor_id INTEGER NOT NULL, expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY, identifier TEXT NOT NULL, attempted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES b2b_customers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_customers_status ON b2b_customers(status);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
`);

function ensureColumn(table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some((item) => item.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

ensureColumn("quotation_downloads", "customer_name", "TEXT");
ensureColumn("quotation_downloads", "company_name", "TEXT");
ensureColumn("quotation_downloads", "product_details", "TEXT");
ensureColumn("quotation_downloads", "subtotal", "REAL");
ensureColumn("quotation_downloads", "gst_amount", "REAL");
ensureColumn("quotation_downloads", "grand_total", "REAL");
ensureColumn("quotation_downloads", "pdf_path", "TEXT");

db.prepare(
  "INSERT OR IGNORE INTO system_settings(key,value) VALUES ('gst_rate','18'),('delivery_charges','0')",
).run();

const insertCategory = db.prepare(
  "INSERT OR IGNORE INTO product_categories(name,slug) VALUES (?,?)",
);
const categoryId = db.prepare("SELECT id FROM product_categories WHERE slug = ?");
const insertProduct = db.prepare(`
  INSERT INTO products(source_id,slug,sku,name,category_id,description,image,retail_price,wholesale_price,minimum_quantity,stock,active,featured)
  VALUES (@source_id,@slug,@sku,@name,@category_id,@description,@image,@retail_price,@wholesale_price,@minimum_quantity,@stock,1,@featured)
  ON CONFLICT(source_id) DO UPDATE SET
    slug=excluded.slug,
    sku=excluded.sku,
    name=excluded.name,
    category_id=excluded.category_id,
    description=excluded.description,
    image=excluded.image,
    retail_price=excluded.retail_price,
    wholesale_price=excluded.wholesale_price,
    minimum_quantity=excluded.minimum_quantity,
    stock=excluded.stock,
    featured=excluded.featured
`);
const seededProductId = db.prepare("SELECT id FROM products WHERE source_id = ?");
const productImageCount = db.prepare("SELECT count(*) count FROM product_images WHERE product_id = ?");
const insertSeededImage = db.prepare(
  "INSERT INTO product_images(product_id,path,sort_order) VALUES (?,?,?)",
);

db.transaction(() => {
  for (const product of retailProducts) {
    insertCategory.run(product.category, product.categorySlug);
    const category = categoryId.get(product.categorySlug) as { id: number };
    insertProduct.run({
      source_id: product.id,
      slug: product.slug,
      sku: product.id,
      name: product.name,
      category_id: category.id,
      description: product.description,
      image: product.image,
      retail_price: product.price,
      wholesale_price: product.wholesalePrice,
      minimum_quantity: product.moq,
      stock: product.inStock ? 500 : 0,
      featured: product.groups.includes("bestsellers") ? 1 : 0,
    });
    const seededProduct = seededProductId.get(product.id) as { id: number };
    const imageCount = productImageCount.get(seededProduct.id) as { count: number };
    if (imageCount.count === 0) {
      product.gallery.forEach((image, index) =>
        insertSeededImage.run(seededProduct.id, image, index),
      );
    }
  }
})();

export type SessionActor = { actorType: "admin" | "customer"; actorId: number };
