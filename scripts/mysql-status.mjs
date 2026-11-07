import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [tables] = await connection.query("SHOW TABLES");
  const [products] = await connection.query(
    `SELECT count(*) total,
     sum(case when c.slug='indoor-plants' then 1 else 0 end) indoor
     FROM products p JOIN product_categories c ON c.id=p.category_id
     WHERE p.deleted_at IS NULL`,
  );
  const tableNames = new Set(tables.map((row) => String(Object.values(row)[0])));
  console.log(`MySQL connected: yes`);
  console.log(`Tables: ${tables.length}`);
  console.log(`Products: ${Number(products[0]?.total || 0)}`);
  console.log(`Indoor products: ${Number(products[0]?.indoor || 0)}`);
  console.log(
    `Retail order schema: ${tableNames.has("retail_orders") && tableNames.has("retail_order_items") ? "ready" : "upgrade required"}`,
  );
} finally {
  await connection.end();
}
