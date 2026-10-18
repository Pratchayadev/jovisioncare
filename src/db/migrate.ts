// รัน migration — Vercel รันให้อัตโนมัติก่อน build ทุกครั้ง (script "vercel-build")
// ถ้าเป็นฐานข้อมูลใหม่เอี่ยม จะใส่ข้อมูลตั้งต้นจากดีไซน์ให้ครั้งเดียว
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "../lib/db";
import { seed } from "./seed";

async function main() {
  const existing = await db.all<{ name: string }>(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'`);
  const fresh = existing.length === 0;
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("migrate เรียบร้อย");
  if (fresh && process.env.SKIP_SEED !== "1") {
    console.log("ฐานข้อมูลใหม่ — ใส่ข้อมูลตั้งต้น");
    await seed();
  }
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
