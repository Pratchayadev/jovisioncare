// รัน migration — Vercel รันให้อัตโนมัติก่อน build ทุกครั้ง (script "vercel-build")
// ถ้าเป็นฐานข้อมูลใหม่เอี่ยม จะใส่ข้อมูลตั้งต้นจากดีไซน์ให้ครั้งเดียว
// และพิมพ์ข้อมูลตรวจสอบลง build log (ฐานข้อมูลไหน, มีข้อมูลกี่แถว) เพื่อจับปัญหาข้อมูลหาย
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db, t } from "../lib/db";
import { dbUrl } from "../lib/env";
import { seed } from "./seed";

const host = (() => { try { return new URL(dbUrl.replace(/^libsql:/, "https:")).host || dbUrl; } catch { return dbUrl; } })();

async function counts() {
  const out: Record<string, number | string> = {};
  for (const name of ["products", "categories", "brands", "reviews", "settings"]) {
    try {
      const r = await db.all<{ n: number }>(sql.raw(`SELECT count(*) AS n FROM ${name}`));
      out[name] = r[0]?.n ?? 0;
    } catch { out[name] = "—"; }
  }
  return out;
}

async function main() {
  console.log(`[db] ฐานข้อมูล: ${host}`);
  const existing = await db.all<{ name: string }>(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'`);
  const fresh = existing.length === 0;
  console.log(`[db] ก่อน migrate: ${fresh ? "ฐานข้อมูลว่าง (ใหม่)" : JSON.stringify(await counts())}`);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("migrate เรียบร้อย");
  if (fresh && process.env.SKIP_SEED !== "1") {
    console.log("ฐานข้อมูลใหม่ — ใส่ข้อมูลตั้งต้น");
    await seed();
  }
  // บันทึกเวลาที่ฐานข้อมูลนี้ถูกใช้ครั้งแรก — ถ้าค่านี้เปลี่ยน แปลว่าฐานข้อมูลถูกสร้างใหม่
  await db.insert(t.settings).values({ key: "db_initialized_at", value: new Date().toISOString() }).onConflictDoNothing();
  console.log(`[db] หลัง migrate: ${JSON.stringify(await counts())}`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
