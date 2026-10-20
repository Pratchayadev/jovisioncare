// รัน migration — Vercel รันให้อัตโนมัติก่อน build ทุกครั้ง (script "vercel-build")
// ถ้าเป็นฐานข้อมูลใหม่เอี่ยม จะใส่ข้อมูลตั้งต้นจากดีไซน์ให้ครั้งเดียว
// และพิมพ์ข้อมูลตรวจสอบลง build log (ฐานข้อมูลไหน, มีข้อมูลกี่แถว) เพื่อจับปัญหาข้อมูลหาย
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db, t } from "../lib/db";
import { dbUrl } from "../lib/env";
import { seed } from "./seed";
import { PROMO_SEED } from "./promos-seed";
import { ARTICLE_SEED } from "./articles-seed";
import { EYE_EXAM_BEFORE_FREE, SERVICE_SEED, TURNAROUND_FAQ } from "./services-seed";
import { eq } from "drizzle-orm";

const host = (() => { try { return new URL(dbUrl.replace(/^libsql:/, "https:")).host || dbUrl; } catch { return dbUrl; } })();

async function counts() {
  const out: Record<string, number | string> = {};
  for (const name of ["products", "categories", "brands", "reviews", "settings", "articles", "services", "promotions"]) {
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
  // ครั้งเดียว: แบรนด์เพิ่มเติมที่ร้านแจ้ง (20 ต.ค. 2569) — ใส่ต่อท้าย ไม่แตะแบรนด์เดิม
  const brandsFlag = await db.query.settings.findFirst({ where: (s, { eq }) => eq(s.key, "brands_v2") });
  if (!brandsFlag) {
    const extra: [string, string][] = [["PAUL HUEMAN", "paul-hueman"], ["LEVI'S", "levis"], ["MACQUARRIE", "macquarrie"], ["UNDER ARMOUR", "under-armour"], ["APRIL", "april"], ["CARRERA", "carrera"], ["PYRAMID", "pyramid"], ["PRADA", "prada"]];
    const existing = await db.select({ name: t.brands.name, sortOrder: t.brands.sortOrder }).from(t.brands);
    const names = new Set(existing.map((b) => b.name.toUpperCase().replace(/[^A-Z0-9]/g, "")));
    let order = Math.max(0, ...existing.map((b) => b.sortOrder)) + 1;
    let added = 0;
    for (const [name, slug] of extra) {
      if (names.has(name.replace(/[^A-Z0-9]/g, ""))) continue;
      const r = await db.insert(t.brands).values({ name, slug, sortOrder: order++ }).onConflictDoNothing().returning({ id: t.brands.id });
      added += r.length;
    }
    await db.insert(t.settings).values({ key: "brands_v2", value: new Date().toISOString() }).onConflictDoNothing();
    console.log(`[db] เพิ่มแบรนด์ใหม่ ${added} แบรนด์`);
  }
  // ครั้งเดียว: เพิ่มคำถาม “รอกี่วัน” ในหน้าบริการ (ข้ามถ้ามีคำถามเรื่องนี้อยู่แล้ว)
  const turnFlag = await db.query.settings.findFirst({ where: (s, { eq }) => eq(s.key, "content_turnaround_v1") });
  if (!turnFlag) {
    for (const [slug, item] of Object.entries(TURNAROUND_FAQ)) {
      const row = await db.query.services.findFirst({ where: (s, { eq }) => eq(s.slug, slug) });
      if (!row) continue;
      let faq: { q: string; a: string }[] = [];
      try { faq = JSON.parse(row.faq || "[]"); } catch { continue; }
      if (faq.some((f) => /กี่วัน|รอนาน/.test(f.q))) continue;
      await db.update(t.services).set({ faq: JSON.stringify([...faq, item]) }).where(eq(t.services.id, row.id));
    }
    await db.insert(t.settings).values({ key: "content_turnaround_v1", value: new Date().toISOString() }).onConflictDoNothing();
    console.log("[db] เพิ่มคำถาม “รอกี่วัน” ในหน้าบริการ");
  }
  // ครั้งเดียว: โปรโมชันจากภาพที่ร้านส่งมา
  const promoFlag = await db.query.settings.findFirst({ where: (s, { eq }) => eq(s.key, "promos_v1") });
  if (!promoFlag) {
    for (const row of PROMO_SEED) await db.insert(t.promotions).values(row);
    await db.insert(t.settings).values({ key: "promos_v1", value: new Date().toISOString() }).onConflictDoNothing();
    console.log(`[db] ใส่โปรโมชัน ${PROMO_SEED.length} รายการ`);
  }
  // ครั้งเดียว: บทความชุดแรก (ตั้งเวลาเผยแพร่สัปดาห์ละ 1)
  const artFlag = await db.query.settings.findFirst({ where: (s, { eq }) => eq(s.key, "articles_v1") });
  if (!artFlag) {
    for (const row of ARTICLE_SEED) await db.insert(t.articles).values(row).onConflictDoNothing();
    await db.insert(t.settings).values({ key: "articles_v1", value: new Date().toISOString() }).onConflictDoNothing();
    console.log(`[db] ใส่บทความ ${ARTICLE_SEED.length} บทความ`);
  }
  // บันทึกเวลาที่ฐานข้อมูลนี้ถูกใช้ครั้งแรก — ถ้าค่านี้เปลี่ยน แปลว่าฐานข้อมูลถูกสร้างใหม่
  await db.insert(t.settings).values({ key: "db_initialized_at", value: new Date().toISOString() }).onConflictDoNothing();
  console.log(`[db] หลัง migrate: ${JSON.stringify(await counts())}`);
}
main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
