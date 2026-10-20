// รัน migration — Vercel รันให้อัตโนมัติก่อน build ทุกครั้ง (script "vercel-build")
// ถ้าเป็นฐานข้อมูลใหม่เอี่ยม จะใส่ข้อมูลตั้งต้นจากดีไซน์ให้ครั้งเดียว
// และพิมพ์ข้อมูลตรวจสอบลง build log (ฐานข้อมูลไหน, มีข้อมูลกี่แถว) เพื่อจับปัญหาข้อมูลหาย
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db, t } from "../lib/db";
import { dbUrl } from "../lib/env";
import { seed } from "./seed";
import { EYE_EXAM_BEFORE_FREE, SERVICE_SEED } from "./services-seed";
import { eq } from "drizzle-orm";

const host = (() => { try { return new URL(dbUrl.replace(/^libsql:/, "https:")).host || dbUrl; } catch { return dbUrl; } })();

async function counts() {
  const out: Record<string, number | string> = {};
  for (const name of ["products", "categories", "brands", "reviews", "settings", "articles", "services"]) {
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
  // ใส่บริการตั้งต้นครั้งเดียว (ถ้าลบบริการในหลังบ้านภายหลัง จะไม่ถูกใส่กลับ)
  const flag = await db.query.settings.findFirst({ where: (s, { eq }) => eq(s.key, "services_seeded") });
  if (!flag) {
    for (const row of SERVICE_SEED) await db.insert(t.services).values(row).onConflictDoNothing();
    await db.insert(t.settings).values({ key: "services_seeded", value: new Date().toISOString() }).onConflictDoNothing();
    console.log(`[db] ใส่บริการตั้งต้น ${SERVICE_SEED.length} รายการ`);
  }
  // อัปเดตครั้งเดียว: ร้านยืนยันว่าตรวจวัดสายตาฟรี — แก้เฉพาะช่องที่ยังเป็นข้อความตั้งต้น (ไม่ทับสิ่งที่แก้ในหลังบ้าน)
  const freeFlag = await db.query.settings.findFirst({ where: (s, { eq }) => eq(s.key, "content_free_exam_v1") });
  if (!freeFlag) {
    const row = await db.query.services.findFirst({ where: (s, { eq }) => eq(s.slug, "eye-exam") });
    const seedRow = SERVICE_SEED.find((x) => x.slug === "eye-exam")!;
    if (row) {
      const patch: Partial<typeof t.services.$inferInsert> = {};
      const B = EYE_EXAM_BEFORE_FREE;
      if (row.summary === B.summary) patch.summary = seedRow.summary;
      if (row.metaTitle === B.metaTitle) patch.metaTitle = seedRow.metaTitle;
      if (row.metaDescription === B.metaDescription) patch.metaDescription = seedRow.metaDescription;
      const newIntro = (seedRow.content as string).split("\n")[0];
      if (row.content.split("\n")[0].endsWith(B.intro)) patch.content = [newIntro, ...row.content.split("\n").slice(1)].join("\n");
      try {
        const faq = JSON.parse(row.faq || "[]") as { q: string; a: string }[];
        if (!faq.some((f) => /ค่าใช้จ่าย|ฟรี/.test(f.q))) patch.faq = JSON.stringify([JSON.parse(seedRow.faq as string)[0], ...faq]);
      } catch { /* faq เสีย — ข้าม */ }
      if (Object.keys(patch).length) await db.update(t.services).set(patch).where(eq(t.services.id, row.id));
      console.log(`[db] อัปเดต “ตรวจวัดสายตาฟรี” ในหน้าบริการ: ${Object.keys(patch).join(", ") || "ไม่มี (ถูกแก้ในหลังบ้านแล้ว)"}`);
    }
    await db.insert(t.settings).values({ key: "content_free_exam_v1", value: new Date().toISOString() }).onConflictDoNothing();
  }
  // บันทึกเวลาที่ฐานข้อมูลนี้ถูกใช้ครั้งแรก — ถ้าค่านี้เปลี่ยน แปลว่าฐานข้อมูลถูกสร้างใหม่
  await db.insert(t.settings).values({ key: "db_initialized_at", value: new Date().toISOString() }).onConflictDoNothing();
  console.log(`[db] หลัง migrate: ${JSON.stringify(await counts())}`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
