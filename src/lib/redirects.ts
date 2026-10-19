import "server-only";
import { eq, sql } from "drizzle-orm";
import { notFound, permanentRedirect } from "next/navigation";
import { db, t } from "./db";

/** บันทึกว่า URL เก่าย้ายไป URL ใหม่ (และแก้ redirect เดิมที่ชี้ไป URL เก่าให้ชี้ตรงไปที่ใหม่ ไม่ต้องเด้งหลายทอด) */
export async function recordMove(from: string, to: string) {
  if (!from || from === to) return;
  await db.delete(t.redirects).where(eq(t.redirects.fromPath, to)); // กลับมาใช้ slug เดิม = ไม่ต้อง redirect แล้ว
  await db.update(t.redirects).set({ toPath: to }).where(eq(t.redirects.toPath, from));
  await db.insert(t.redirects).values({ fromPath: from, toPath: to }).onConflictDoUpdate({ target: t.redirects.fromPath, set: { toPath: to } });
}

/** ถ้า URL นี้เคยย้าย คืน URL ใหม่ */
export async function findRedirect(path: string) {
  const r = await db.query.redirects.findFirst({ where: eq(t.redirects.fromPath, path) });
  if (!r) return null;
  db.update(t.redirects).set({ hits: sql`${t.redirects.hits} + 1` }).where(eq(t.redirects.fromPath, path)).catch(() => {});
  return r.toPath;
}

/** URL นี้กลับมาใช้งานแล้ว (เช่น สร้างสินค้าใหม่ด้วย slug เดิม) ลบ redirect ทิ้ง */
export async function clearRedirect(path: string) {
  await db.delete(t.redirects).where(eq(t.redirects.fromPath, path));
}

/** ไม่พบหน้า: ถ้าเคยย้ายให้ redirect ถาวร ไม่งั้น 404 */
export async function redirectOrNotFound(path: string): Promise<never> {
  const to = await findRedirect(path);
  if (to) permanentRedirect(to);
  notFound();
}
