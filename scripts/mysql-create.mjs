import mysql from "mysql2/promise";

const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required in .env.`);
  return value;
};

const database = required("MYSQL_DATABASE");
const appUser = required("MYSQL_APP_USER");
const appPassword = required("MYSQL_APP_PASSWORD");
const appHost = process.env.MYSQL_APP_HOST?.trim() || "localhost";

if (!/^[a-zA-Z0-9_]+$/.test(database))
  throw new Error("MYSQL_DATABASE may contain only letters, numbers, and underscores.");
if (!/^[a-zA-Z0-9_]+$/.test(appUser))
  throw new Error("MYSQL_APP_USER may contain only letters, numbers, and underscores.");
if (appPassword.length < 16) throw new Error("MYSQL_APP_PASSWORD must be at least 16 characters.");
if (!/^[a-zA-Z0-9_.:%-]+$/.test(appHost)) throw new Error("MYSQL_APP_HOST is invalid.");

const connection = await mysql.createConnection({
  host: process.env.MYSQL_ADMIN_HOST?.trim() || "127.0.0.1",
  port: Number(process.env.MYSQL_ADMIN_PORT || 3306),
  user: required("MYSQL_ADMIN_USER"),
  password: required("MYSQL_ADMIN_PASSWORD"),
});

try {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  const account = `${mysql.escape(appUser)}@${mysql.escape(appHost)}`;
  await connection.query(
    `CREATE USER IF NOT EXISTS ${account} IDENTIFIED BY ${mysql.escape(appPassword)}`,
  );
  await connection.query(`ALTER USER ${account} IDENTIFIED BY ${mysql.escape(appPassword)}`);
  await connection.query(
    `GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES ON \`${database}\`.* TO ${account}`,
  );
  console.log(`Created MySQL database ${database} and application user ${appUser}@${appHost}.`);
} finally {
  await connection.end();
}
