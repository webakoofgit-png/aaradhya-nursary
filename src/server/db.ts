import { AsyncLocalStorage } from "node:async_hooks";
import mysql, {
  type PoolConnection,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { products as retailProducts } from "@/data/catalog";

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) throw new Error("DATABASE_URL is required for the MySQL database connection.");

const pool = mysql.createPool({
  uri: databaseUrl,
  ...(process.env["DATABASE_SSL"] === "true" ? { ssl: { rejectUnauthorized: true } } : {}),
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  decimalNumbers: true,
});
const transactionConnection = new AsyncLocalStorage<PoolConnection>();
const executor = () => transactionConnection.getStore() ?? pool;

async function queryRows<T>(sql: string, params: any[]) {
  await databaseReady;
  const [rows] = await executor().execute<RowDataPacket[]>(sql, params);
  return rows as T[];
}

async function execute(sql: string, params: any[]) {
  await databaseReady;
  const [result] = await executor().execute<ResultSetHeader>(sql, params);
  return {
    insertId: Number(result.insertId),
    affectedRows: result.affectedRows,
    changes: result.affectedRows,
    lastInsertRowid: Number(result.insertId),
  };
}

export const db = {
  prepare(sql: string) {
    return {
      async get<T = Record<string, any>>(...params: any[]) {
        return (await queryRows<T>(sql, params))[0];
      },
      async all<T = Record<string, any>>(...params: any[]) {
        return queryRows<T>(sql, params);
      },
      async run(...params: any[]) {
        return execute(sql, params);
      },
    };
  },
  transaction<TArgs extends unknown[], TResult>(callback: (...args: TArgs) => Promise<TResult>) {
    return async (...args: TArgs) => {
      await databaseReady;
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const result = await transactionConnection.run(connection, () => callback(...args));
        await connection.commit();
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    };
  },
};

async function initializeDatabase() {
  await pool.execute(
    "INSERT IGNORE INTO system_settings(key_name,value) VALUES ('gst_rate','18'),('delivery_charges','0')",
  );
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [metadataRows] = await connection.execute<RowDataPacket[]>(
      "SELECT value FROM system_settings WHERE key_name='catalog_metadata_v2'",
    );
    const populateMetadata = metadataRows.length === 0;
    for (const product of retailProducts) {
      await connection.execute("INSERT IGNORE INTO product_categories(name,slug) VALUES (?,?)", [
        product.category,
        product.categorySlug,
      ]);
      const [categoryRows] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM product_categories WHERE slug=?",
        [product.categorySlug],
      );
      const categoryId = Number(categoryRows[0]?.["id"]);
      await connection.execute(
        `INSERT IGNORE INTO products(source_id,slug,sku,name,category_id,description,image,retail_price,mrp,wholesale_price,minimum_quantity,stock,active,featured,is_new,wholesale_enabled,botanical,sunlight,water_requirement,size_label,pot_size,pot_type,placement,pet_safe,difficulty,rating,review_count,care_instructions,product_groups)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          product.id,
          product.slug,
          product.id,
          product.name,
          categoryId,
          product.description,
          product.image,
          product.price,
          product.mrp,
          product.wholesalePrice,
          product.moq,
          product.inStock ? 500 : 0,
          1,
          product.groups.includes("bestsellers") ? 1 : 0,
          product.isNew || product.groups.includes("new") ? 1 : 0,
          product.wholesale === false ? 0 : 1,
          product.botanical,
          product.sunlight,
          product.water,
          product.size,
          product.potSize,
          product.potType,
          product.placement,
          product.petSafe ? 1 : 0,
          product.difficulty,
          product.rating,
          product.reviews,
          JSON.stringify(product.care),
          JSON.stringify(product.groups),
        ],
      );
      if (populateMetadata) {
        await connection.execute(
          `UPDATE products SET mrp=?,is_new=?,wholesale_enabled=?,botanical=?,sunlight=?,water_requirement=?,size_label=?,pot_size=?,pot_type=?,placement=?,pet_safe=?,difficulty=?,rating=?,review_count=?,care_instructions=?,product_groups=? WHERE source_id=?`,
          [
            product.mrp,
            product.isNew || product.groups.includes("new") ? 1 : 0,
            product.wholesale === false ? 0 : 1,
            product.botanical,
            product.sunlight,
            product.water,
            product.size,
            product.potSize,
            product.potType,
            product.placement,
            product.petSafe ? 1 : 0,
            product.difficulty,
            product.rating,
            product.reviews,
            JSON.stringify(product.care),
            JSON.stringify(product.groups),
            product.id,
          ],
        );
      }
      await connection.execute(
        `UPDATE products SET mrp=IF(mrp=0,?,mrp),botanical=COALESCE(botanical,?),care_instructions=COALESCE(care_instructions,?),product_groups=COALESCE(product_groups,?) WHERE source_id=?`,
        [
          product.mrp,
          product.botanical,
          JSON.stringify(product.care),
          JSON.stringify(product.groups),
          product.id,
        ],
      );
      const [productRows] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM products WHERE source_id=? OR slug=? LIMIT 1",
        [product.id, product.slug],
      );
      const productId = Number(productRows[0]?.["id"]);
      if (!productId) continue;
      const [imageRows] = await connection.execute<RowDataPacket[]>(
        "SELECT count(*) count FROM product_images WHERE product_id=?",
        [productId],
      );
      if (Number(imageRows[0]?.["count"]) === 0) {
        for (const [index, image] of product.gallery.entries()) {
          await connection.execute(
            "INSERT INTO product_images(product_id,path,sort_order) VALUES (?,?,?)",
            [productId, image, index],
          );
        }
      }
    }
    if (populateMetadata)
      await connection.execute(
        "INSERT INTO system_settings(key_name,value) VALUES ('catalog_metadata_v2','complete')",
      );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

const databaseReady = initializeDatabase();

export type SessionActor = { actorType: "admin" | "customer" | "retail"; actorId: number };
