import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { db, type SessionActor } from "./db";

const COOKIE = "vr_session";

type CustomerAuthRow = { id: number; status: string; business_name: string };
type AdminAuthRow = { id: number };

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
}

export function createSession(
  actorType: SessionActor["actorType"],
  actorId: number,
  remember = false,
) {
  const id = randomBytes(32).toString("hex");
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
  const expires = new Date(Date.now() + maxAge * 1000);
  db.prepare("INSERT INTO sessions(id,actor_type,actor_id,expires_at) VALUES (?,?,?,?)").run(
    id,
    actorType,
    actorId,
    expires.toISOString(),
  );
  setCookie(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    maxAge,
  });
}

export function getSession(): SessionActor | null {
  const id = getCookie(COOKIE);
  if (!id) return null;
  const row = db
    .prepare("SELECT actor_type,actor_id FROM sessions WHERE id=? AND expires_at > ?")
    .get(id, new Date().toISOString()) as
    { actor_type: SessionActor["actorType"]; actor_id: number } | undefined;
  return row ? { actorType: row.actor_type, actorId: row.actor_id } : null;
}

export function requireCustomer(): CustomerAuthRow {
  const session = getSession();
  if (!session || session.actorType !== "customer") throw new Error("UNAUTHORIZED");
  const customer = db.prepare("SELECT * FROM b2b_customers WHERE id=?").get(session.actorId) as
    CustomerAuthRow | undefined;
  if (!customer || customer.status !== "approved") throw new Error("ACCOUNT_NOT_APPROVED");
  return customer;
}

export function requireAdmin(): AdminAuthRow {
  const session = getSession();
  if (!session || session.actorType !== "admin") throw new Error("UNAUTHORIZED");
  const admin = db
    .prepare("SELECT * FROM admin_users WHERE id=? AND active=1")
    .get(session.actorId) as AdminAuthRow | undefined;
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export function logout() {
  const id = getCookie(COOKIE);
  if (id) db.prepare("DELETE FROM sessions WHERE id=?").run(id);
  deleteCookie(COOKIE, { path: "/" });
}

export function seedAdmin() {
  const email = process.env["ADMIN_EMAIL"] ?? "admin@verdantroots.in";
  const exists = db.prepare("SELECT id FROM admin_users WHERE email=?").get(email);
  if (!exists) {
    const password = process.env["ADMIN_PASSWORD"] ?? "Admin@12345";
    db.prepare("INSERT INTO admin_users(email,name,password_hash) VALUES (?,?,?)").run(
      email,
      "Verdant Administrator",
      hashPassword(password),
    );
  }
}

seedAdmin();
