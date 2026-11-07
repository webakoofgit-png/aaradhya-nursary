import mysql from "mysql2/promise";

const databaseUrl = new URL(process.env.DATABASE_URL || "");
const database = databaseUrl.pathname.replace(/^\//, "");
const password = process.env.MYSQL_ADMIN_PASSWORD;
if (!database || !password) throw new Error("DATABASE_URL and MYSQL_ADMIN_PASSWORD are required.");

const connection = await mysql.createConnection({
  host: process.env.MYSQL_ADMIN_HOST || databaseUrl.hostname || "127.0.0.1",
  port: Number(process.env.MYSQL_ADMIN_PORT || databaseUrl.port || 3306),
  user: process.env.MYSQL_ADMIN_USER || "root",
  password,
  database,
});

const columns = [
  ["product_categories", "description", "TEXT NULL"],
  ["product_categories", "image", "MEDIUMTEXT NULL"],
  ["product_categories", "sort_order", "INT NOT NULL DEFAULT 0"],
  ["products", "mrp", "DECIMAL(12,2) NOT NULL DEFAULT 0"],
  ["products", "is_new", "TINYINT(1) NOT NULL DEFAULT 0"],
  ["products", "wholesale_enabled", "TINYINT(1) NOT NULL DEFAULT 1"],
  ["products", "botanical", "VARCHAR(190) NULL"],
  ["products", "sunlight", "VARCHAR(40) NOT NULL DEFAULT 'Bright Indirect'"],
  ["products", "water_requirement", "VARCHAR(20) NOT NULL DEFAULT 'Medium'"],
  ["products", "size_label", "VARCHAR(20) NOT NULL DEFAULT 'Medium'"],
  ["products", "pot_size", "VARCHAR(80) NOT NULL DEFAULT '6 inch'"],
  ["products", "pot_type", "VARCHAR(100) NOT NULL DEFAULT 'Nursery Pot'"],
  ["products", "placement", "VARCHAR(20) NOT NULL DEFAULT 'Indoor'"],
  ["products", "pet_safe", "TINYINT(1) NOT NULL DEFAULT 1"],
  ["products", "difficulty", "VARCHAR(20) NOT NULL DEFAULT 'Easy'"],
  ["products", "rating", "DECIMAL(2,1) NOT NULL DEFAULT 4.5"],
  ["products", "review_count", "INT UNSIGNED NOT NULL DEFAULT 0"],
  ["products", "care_instructions", "JSON NULL"],
  ["products", "product_groups", "JSON NULL"],
  ["products", "deleted_at", "DATETIME NULL"],
];

try {
  for (const [table, column, definition] of columns) {
    const [rows] = await connection.execute(
      "SELECT 1 FROM information_schema.columns WHERE table_schema=? AND table_name=? AND column_name=?",
      [database, table, column],
    );
    if (!rows.length)
      await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
  await connection.query(`CREATE TABLE IF NOT EXISTS offers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, name VARCHAR(190) NOT NULL, description TEXT NULL,
    offer_type ENUM('percentage','fixed','buy_x_get_percentage') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(12,2) NOT NULL DEFAULT 0, buy_quantity INT UNSIGNED NOT NULL DEFAULT 1,
    reward_quantity INT UNSIGNED NOT NULL DEFAULT 1, category_id BIGINT UNSIGNED NULL,
    starts_at DATETIME NULL, ends_at DATETIME NULL, active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id), KEY idx_offers_active_dates (active,starts_at,ends_at),
    CONSTRAINT fk_offers_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await connection.query(`CREATE TABLE IF NOT EXISTS offer_products (
    offer_id BIGINT UNSIGNED NOT NULL, product_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (offer_id,product_id), KEY idx_offer_products_product (product_id),
    CONSTRAINT fk_offer_products_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    CONSTRAINT fk_offer_products_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await connection.query(`CREATE TABLE IF NOT EXISTS retail_orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, customer_id BIGINT UNSIGNED NOT NULL,
    order_number VARCHAR(80) NOT NULL,
    status ENUM('payment_pending','placed','confirmed','packed','shipped','delivered','cancelled') NOT NULL DEFAULT 'placed',
    payment_method ENUM('upi','cod') NOT NULL,
    payment_status ENUM('pending','paid','cod','failed','refunded') NOT NULL DEFAULT 'pending',
    shipping_method ENUM('standard','express') NOT NULL DEFAULT 'standard',
    full_name VARCHAR(120) NOT NULL, mobile VARCHAR(20) NOT NULL, email VARCHAR(190) NOT NULL,
    gst_number VARCHAR(30) NULL, billing_address TEXT NOT NULL, city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL, pin_code VARCHAR(10) NOT NULL, order_notes VARCHAR(1000) NULL,
    subtotal DECIMAL(12,2) NOT NULL, discount_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_total DECIMAL(12,2) NOT NULL DEFAULT 0, grand_total DECIMAL(12,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id), UNIQUE KEY uq_retail_order_number (order_number),
    KEY idx_retail_order_customer (customer_id), KEY idx_retail_order_status (status,created_at),
    CONSTRAINT fk_retail_order_customer FOREIGN KEY (customer_id) REFERENCES retail_customers(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await connection.query(`CREATE TABLE IF NOT EXISTS retail_order_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL, product_name VARCHAR(190) NOT NULL,
    sku VARCHAR(80) NOT NULL, product_slug VARCHAR(190) NOT NULL,
    size_label VARCHAR(80) NOT NULL, pot_type VARCHAR(100) NOT NULL,
    quantity INT UNSIGNED NOT NULL, unit_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (id), KEY idx_retail_items_order (order_id), KEY idx_retail_items_product (product_id),
    CONSTRAINT fk_retail_item_order FOREIGN KEY (order_id) REFERENCES retail_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_retail_item_product FOREIGN KEY (product_id) REFERENCES products(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  console.log("Catalogue, category, offer and retail order schema upgrade complete.");
} finally {
  await connection.end();
}
