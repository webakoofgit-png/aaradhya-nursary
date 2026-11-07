import { randomBytes, scryptSync } from "node:crypto";
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const sslEnabled = process.env.DATABASE_SSL === "true";
const caPath = process.env.DATABASE_SSL_CA;
const ca = caPath ? await readFile(caPath, "utf8") : undefined;
const localConfigAvailable = Boolean(
  process.env.MYSQL_APP_USER && process.env.MYSQL_APP_PASSWORD && process.env.MYSQL_DATABASE,
);
const connectionUrl = process.env.DATABASE_URL;
const parsed = connectionUrl ? new URL(connectionUrl) : null;
if (!localConfigAvailable && !parsed) {
  throw new Error(
    "Set DATABASE_URL or the MYSQL_APP_USER, MYSQL_APP_PASSWORD and MYSQL_DATABASE values.",
  );
}
if (parsed && parsed.protocol !== "mysql:")
  throw new Error("DATABASE_URL must start with mysql://");

const connection = await mysql.createConnection({
  host: localConfigAvailable ? process.env.MYSQL_ADMIN_HOST || "127.0.0.1" : parsed?.hostname,
  port: Number(localConfigAvailable ? process.env.MYSQL_ADMIN_PORT || 3306 : parsed?.port || 3306),
  user: localConfigAvailable
    ? process.env.MYSQL_APP_USER
    : decodeURIComponent(parsed?.username || ""),
  password: localConfigAvailable
    ? process.env.MYSQL_APP_PASSWORD
    : decodeURIComponent(parsed?.password || ""),
  database: localConfigAvailable ? process.env.MYSQL_DATABASE : parsed?.pathname.replace(/^\//, ""),
  multipleStatements: true,
  ssl: sslEnabled ? { rejectUnauthorized: true, ...(ca ? { ca } : {}) } : undefined,
});

try {
  const schema = await readFile(new URL("../database/mysql-schema.sql", import.meta.url), "utf8");
  await connection.query(schema);

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12)
      throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
    const salt = randomBytes(16).toString("hex");
    const passwordHash = `${salt}:${scryptSync(adminPassword, salt, 64).toString("hex")}`;
    await connection.execute(
      "INSERT IGNORE INTO admin_users(email,name,password_hash) VALUES (?,?,?)",
      [adminEmail, "Aaradhya Administrator", passwordHash],
    );
    console.log(`MySQL schema is ready. Administrator ensured for ${adminEmail}.`);
  } else {
    console.log(
      "MySQL schema is ready. No administrator was created because ADMIN_EMAIL or ADMIN_PASSWORD is missing.",
    );
  }
} finally {
  await connection.end();
}
