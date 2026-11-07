SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  name VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'admin',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS b2b_customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL, mobile VARCHAR(20) NOT NULL, whatsapp VARCHAR(20) NOT NULL,
  email VARCHAR(190) NOT NULL, password_hash VARCHAR(255) NOT NULL,
  business_name VARCHAR(190) NOT NULL, business_type VARCHAR(100) NOT NULL,
  gst_number VARCHAR(30) NULL, pan_number VARCHAR(20) NULL, years_in_business INT NULL,
  expected_monthly_purchase VARCHAR(100) NULL, product_interests TEXT NULL,
  business_address TEXT NOT NULL, city VARCHAR(100) NOT NULL, state VARCHAR(100) NOT NULL,
  pin_code VARCHAR(10) NOT NULL, delivery_address TEXT NOT NULL,
  status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  rejection_remarks VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_b2b_mobile (mobile), UNIQUE KEY uq_b2b_email (email),
  KEY idx_b2b_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS retail_customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL, mobile VARCHAR(20) NOT NULL, email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active','suspended') NOT NULL DEFAULT 'active',
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_retail_mobile (mobile), UNIQUE KEY uq_retail_email (email),
  KEY idx_retail_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, customer_id BIGINT UNSIGNED NOT NULL,
  kind VARCHAR(60) NOT NULL, original_name VARCHAR(255) NOT NULL, stored_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL, size INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_documents_customer (customer_id),
  CONSTRAINT fk_documents_customer FOREIGN KEY (customer_id) REFERENCES b2b_customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, name VARCHAR(120) NOT NULL, slug VARCHAR(160) NOT NULL,
  description TEXT NULL, image MEDIUMTEXT NULL, sort_order INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id), UNIQUE KEY uq_category_name (name), UNIQUE KEY uq_category_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, source_id VARCHAR(80) NULL,
  slug VARCHAR(190) NOT NULL, sku VARCHAR(80) NOT NULL, name VARCHAR(190) NOT NULL,
  category_id BIGINT UNSIGNED NULL, description TEXT NULL, image MEDIUMTEXT NULL,
  retail_price DECIMAL(12,2) NOT NULL, mrp DECIMAL(12,2) NOT NULL DEFAULT 0,
  wholesale_price DECIMAL(12,2) NOT NULL,
  gst_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00, minimum_quantity INT UNSIGNED NOT NULL DEFAULT 1,
  stock INT UNSIGNED NOT NULL DEFAULT 0, active TINYINT(1) NOT NULL DEFAULT 1,
  featured TINYINT(1) NOT NULL DEFAULT 0, is_new TINYINT(1) NOT NULL DEFAULT 0,
  wholesale_enabled TINYINT(1) NOT NULL DEFAULT 1, botanical VARCHAR(190) NULL,
  sunlight VARCHAR(40) NOT NULL DEFAULT 'Bright Indirect', water_requirement VARCHAR(20) NOT NULL DEFAULT 'Medium',
  size_label VARCHAR(20) NOT NULL DEFAULT 'Medium', pot_size VARCHAR(80) NOT NULL DEFAULT '6 inch',
  pot_type VARCHAR(100) NOT NULL DEFAULT 'Nursery Pot', placement VARCHAR(20) NOT NULL DEFAULT 'Indoor',
  pet_safe TINYINT(1) NOT NULL DEFAULT 1, difficulty VARCHAR(20) NOT NULL DEFAULT 'Easy',
  rating DECIMAL(2,1) NOT NULL DEFAULT 4.5, review_count INT UNSIGNED NOT NULL DEFAULT 0,
  care_instructions JSON NULL, product_groups JSON NULL, deleted_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_product_source (source_id), UNIQUE KEY uq_product_slug (slug),
  UNIQUE KEY uq_product_sku (sku), KEY idx_products_category (category_id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, name VARCHAR(190) NOT NULL, description TEXT NULL,
  offer_type ENUM('percentage','fixed','buy_x_get_percentage') NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(12,2) NOT NULL DEFAULT 0, buy_quantity INT UNSIGNED NOT NULL DEFAULT 1,
  reward_quantity INT UNSIGNED NOT NULL DEFAULT 1, category_id BIGINT UNSIGNED NULL,
  starts_at DATETIME NULL, ends_at DATETIME NULL, active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_offers_active_dates (active,starts_at,ends_at),
  CONSTRAINT fk_offers_category FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offer_products (
  offer_id BIGINT UNSIGNED NOT NULL, product_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (offer_id,product_id), KEY idx_offer_products_product (product_id),
  CONSTRAINT fk_offer_products_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  CONSTRAINT fk_offer_products_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, product_id BIGINT UNSIGNED NOT NULL,
  path MEDIUMTEXT NOT NULL, sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id), KEY idx_images_product (product_id),
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quotations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, quotation_number VARCHAR(80) NULL,
  customer_id BIGINT UNSIGNED NOT NULL, status VARCHAR(40) NOT NULL DEFAULT 'draft',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0, gst_rate DECIMAL(5,2) NOT NULL DEFAULT 18,
  gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0, delivery_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(12,2) NOT NULL DEFAULT 0, pdf_path VARCHAR(500) NULL, valid_until DATE NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  archived TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id), UNIQUE KEY uq_quotation_number (quotation_number), KEY idx_quotation_customer (customer_id),
  CONSTRAINT fk_quotation_customer FOREIGN KEY (customer_id) REFERENCES b2b_customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quotation_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, quotation_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL, product_name VARCHAR(190) NOT NULL, sku VARCHAR(80) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL, minimum_quantity INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL, line_total DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id), KEY idx_items_quotation (quotation_id), KEY idx_items_product (product_id),
  CONSTRAINT fk_items_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quotation_downloads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, quotation_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL, customer_name VARCHAR(120) NULL, company_name VARCHAR(190) NULL,
  product_details TEXT NULL, subtotal DECIMAL(12,2) NULL, gst_amount DECIMAL(12,2) NULL,
  grand_total DECIMAL(12,2) NULL, pdf_path VARCHAR(500) NULL,
  downloaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_download_quotation (quotation_id), KEY idx_download_customer (customer_id),
  CONSTRAINT fk_download_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  CONSTRAINT fk_download_customer FOREIGN KEY (customer_id) REFERENCES b2b_customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS whatsapp_enquiry_clicks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, quotation_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL, clicked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_whatsapp_quotation (quotation_id),
  CONSTRAINT fk_whatsapp_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  CONSTRAINT fk_whatsapp_customer FOREIGN KEY (customer_id) REFERENCES b2b_customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, type VARCHAR(60) NOT NULL,
  message VARCHAR(500) NOT NULL, entity_type VARCHAR(60) NULL, entity_id BIGINT UNSIGNED NULL,
  read_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_notifications_created (created_at), KEY idx_notifications_entity (entity_type,entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, quotation_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL, order_number VARCHAR(80) NOT NULL,
  total DECIMAL(12,2) NOT NULL, status VARCHAR(40) NOT NULL DEFAULT 'confirmed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_order_quotation (quotation_id), UNIQUE KEY uq_order_number (order_number),
  CONSTRAINT fk_order_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id),
  CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES b2b_customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS retail_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS retail_order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL, product_name VARCHAR(190) NOT NULL,
  sku VARCHAR(80) NOT NULL, product_slug VARCHAR(190) NOT NULL,
  size_label VARCHAR(80) NOT NULL, pot_type VARCHAR(100) NOT NULL,
  quantity INT UNSIGNED NOT NULL, unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id), KEY idx_retail_items_order (order_id), KEY idx_retail_items_product (product_id),
  CONSTRAINT fk_retail_item_order FOREIGN KEY (order_id) REFERENCES retail_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_retail_item_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_notes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, quotation_id BIGINT UNSIGNED NOT NULL,
  admin_id BIGINT UNSIGNED NULL, note TEXT NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_notes_quotation (quotation_id),
  CONSTRAINT fk_notes_quotation FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
  CONSTRAINT fk_notes_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_settings (
  key_name VARCHAR(100) NOT NULL, value TEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) NOT NULL, actor_type ENUM('admin','customer','retail') NOT NULL,
  actor_id BIGINT UNSIGNED NOT NULL, expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_sessions_expiry (expires_at), KEY idx_sessions_actor (actor_type,actor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, identifier VARCHAR(255) NOT NULL,
  attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), KEY idx_attempts_identifier_time (identifier,attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, customer_id BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL, expires_at DATETIME NOT NULL, used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id), UNIQUE KEY uq_reset_token (token_hash), KEY idx_reset_customer (customer_id),
  CONSTRAINT fk_reset_customer FOREIGN KEY (customer_id) REFERENCES b2b_customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO system_settings(key_name,value) VALUES ('gst_rate','18'),('delivery_charges','0');
