import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

export async function requireAdmin() {
  const store = await cookies();
  const user = await verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!user) redirect("/admin/login");
  return user;
}

export function checkCredentials(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const stored = process.env.ADMIN_PASSWORD_HASH || "";
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const got = scryptSync(password, salt, 64);
  const want = Buffer.from(hash, "hex");
  return username === expectedUser && want.length === got.length && timingSafeEqual(got, want);
}
