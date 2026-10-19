import { plainText } from "./markdown";

export type Level = "ok" | "warn" | "bad" | "tip";
export type Check = { level: Level; text: string };
const SUFFIX = " | J.O. Vision Care".length;

function metaChecks(metaTitle: string, title: string, metaDesc: string, out: Check[]) {
  const t = (metaTitle || title).length + SUFFIX;
  if (t > 65) out.push({ level: "warn", text: `ชื่อที่แสดงบน Google ยาว ${t} ตัวอักษร จะถูกตัดท้าย — ควรไม่เกิน 60` });
  if (metaDesc && metaDesc.length > 160) out.push({ level: "warn", text: `Meta description ยาว ${metaDesc.length} ตัวอักษร — ควรไม่เกิน 160` });
  if (metaDesc && metaDesc.length < 60) out.push({ level: "warn", text: "Meta description สั้นไป — ควรมี 70–160 ตัวอักษร บอกจุดเด่น + ชวนให้คลิก" });
}

export type ProductInput = {
  name: string; description: string; price: string; categoryId: string; brandId: string;
  images: number; missingAlt: number; metaTitle: string; metaDescription: string;
};

export function checkProduct(p: ProductInput): Check[] {
  const out: Check[] = [];
  const d = p.description.trim().length;
  if (!d) out.push({ level: "bad", text: "ยังไม่มีรายละเอียด — ระบบจะใช้ข้อความมาตรฐานที่ซ้ำกับสินค้าอื่น Google จะไม่ค่อยจัดอันดับให้" });
  else if (d < 80) out.push({ level: "warn", text: `รายละเอียดสั้น (${d} ตัวอักษร) — เพิ่มวัสดุ ขนาด สีที่มี เหมาะกับหน้าแบบไหน ให้ได้ 80+` });
  else out.push({ level: "ok", text: "รายละเอียดเฉพาะรุ่นยาวพอ" });
  if (!p.images) out.push({ level: "bad", text: "ยังไม่มีรูป — สินค้าที่ไม่มีรูปแทบไม่ได้ขึ้น Google รูปภาพ" });
  else if (p.images < 3) out.push({ level: "warn", text: `มีรูป ${p.images} รูป — แนะนำ 3 รูปขึ้นไป (ด้านหน้า ด้านข้าง ตอนสวม)` });
  else out.push({ level: "ok", text: `มีรูป ${p.images} รูป` });
  if (p.missingAlt) out.push({ level: "warn", text: `รูป ${p.missingAlt} รูปไม่มีคำอธิบาย (alt)` });
  else if (p.images) out.push({ level: "ok", text: "รูปทุกรูปมีคำอธิบาย (alt)" });
  out.push(p.brandId ? { level: "ok", text: "ระบุแบรนด์แล้ว" } : { level: "warn", text: "ยังไม่ระบุแบรนด์ — คนค้นด้วยชื่อแบรนด์บ่อยมาก" });
  out.push(p.categoryId ? { level: "ok", text: "ระบุหมวดหมู่แล้ว" } : { level: "warn", text: "ยังไม่ระบุหมวดหมู่ — หน้าสินค้าจะไม่ถูกลิงก์จากหน้าหมวด" });
  if (!p.price) out.push({ level: "tip", text: "ใส่ราคาแล้ว Google จะแสดงสินค้าแบบมีราคา (rich result) และส่งเข้า Google Shopping ได้" });
  metaChecks(p.metaTitle, p.name, p.metaDescription, out);
  return out;
}

export type ArticleInput = {
  title: string; excerpt: string; content: string; cover: boolean; coverAlt: string;
  metaTitle: string; metaDescription: string; faqCount: number;
};

export function checkArticle(a: ArticleInput): Check[] {
  const out: Check[] = [];
  const tl = a.title.trim().length;
  if (!tl) out.push({ level: "bad", text: "ยังไม่มีชื่อบทความ" });
  else if (tl < 15) out.push({ level: "warn", text: "ชื่อบทความสั้นไป — ใส่คำที่คนค้นหา เช่น “ตัดแว่น อุดรธานี” หรือ “เลนส์ Progressive คืออะไร”" });
  else out.push({ level: "ok", text: "ชื่อบทความความยาวเหมาะสม" });
  const len = plainText(a.content).length;
  if (len < 600) out.push({ level: "bad", text: `เนื้อหาสั้น (${len} ตัวอักษร) — บทความที่ติดอันดับมักยาว 1,500 ตัวอักษรขึ้นไป` });
  else if (len < 1500) out.push({ level: "warn", text: `เนื้อหา ${len.toLocaleString()} ตัวอักษร — ถ้าเพิ่มรายละเอียดถึง 1,500+ จะมีโอกาสติดอันดับมากขึ้น` });
  else out.push({ level: "ok", text: `เนื้อหา ${len.toLocaleString()} ตัวอักษร` });
  const h2 = (a.content.match(/^##\s+/gm) ?? []).length;
  out.push(h2 >= 2 ? { level: "ok", text: `มีหัวข้อย่อย ${h2} หัวข้อ` } : { level: "warn", text: "แบ่งเนื้อหาด้วยหัวข้อ ## อย่างน้อย 2 หัวข้อ ช่วยให้อ่านง่ายและ Google เข้าใจโครงสร้าง" });
  const internal = (a.content.match(/\]\((\/|https?:\/\/(www\.)?jovisioncare\.com)/g) ?? []).length;
  out.push(internal ? { level: "ok", text: `มีลิงก์ไปหน้าอื่นในเว็บ ${internal} ลิงก์` } : { level: "warn", text: "ยังไม่มีลิงก์ไปหน้าในเว็บ — ลิงก์ไปหน้าสาขา/สินค้า/หมวด เช่น [ร้านแว่นอุดร](/udon-thani)" });
  const imgs = a.content.match(/!\[([^\]]*)\]\(/g) ?? [];
  const noAlt = imgs.filter((m) => m === "![](").length;
  if (noAlt) out.push({ level: "warn", text: `รูปในเนื้อหา ${noAlt} รูปไม่มีคำอธิบาย — ใส่ใน ![ตรงนี้](...)` });
  if (!a.cover) out.push({ level: "warn", text: "ยังไม่มีรูปปก — ใช้เป็นภาพตอนแชร์ใน LINE/Facebook และใน Google" });
  else if (!a.coverAlt.trim()) out.push({ level: "warn", text: "รูปปกยังไม่มีคำอธิบาย (alt)" });
  else out.push({ level: "ok", text: "มีรูปปกพร้อมคำอธิบาย" });
  if (!a.excerpt.trim() && !a.metaDescription.trim()) out.push({ level: "warn", text: "ใส่คำโปรย หรือ Meta description — ไม่งั้น Google จะตัดประโยคแรกไปแสดงเอง" });
  if (!a.faqCount) out.push({ level: "tip", text: "เพิ่มคำถามที่พบบ่อยท้ายบทความ ช่วยตอบคำค้นแบบคำถาม (เช่น “ตัดแว่นกี่วันได้”)" });
  metaChecks(a.metaTitle, a.title, a.metaDescription, out);
  return out;
}

export type TaxonomyInput = { name: string; description: string; content: string; faqCount: number; metaTitle: string; metaDescription: string };

export function checkTaxonomy(x: TaxonomyInput): Check[] {
  const out: Check[] = [];
  const d = x.description.trim().length;
  out.push(!d ? { level: "warn", text: "ยังไม่มีคำแนะนำสั้น ๆ ใต้ชื่อหน้า" } : d < 60 ? { level: "warn", text: "คำแนะนำสั้นไป — 1–2 ประโยค บอกว่าหน้านี้มีอะไร เหมาะกับใคร" } : { level: "ok", text: "มีคำแนะนำใต้ชื่อหน้า" });
  const c = plainText(x.content).length;
  out.push(c >= 300 ? { level: "ok", text: `มีเนื้อหาแนะนำ ${c.toLocaleString()} ตัวอักษร` } : { level: "warn", text: "เพิ่มเนื้อหาแนะนำใต้รายการสินค้า (300+ ตัวอักษร) — หน้าที่มีแต่รายการสินค้า Google มองว่าเนื้อหาน้อย" });
  out.push(x.faqCount >= 2 ? { level: "ok", text: `มีคำถามที่พบบ่อย ${x.faqCount} ข้อ` } : { level: "tip", text: "เพิ่มคำถามที่พบบ่อย 2–3 ข้อ" });
  metaChecks(x.metaTitle, x.name, x.metaDescription, out);
  return out;
}

export function score(checks: Check[]) {
  const graded = checks.filter((c) => c.level !== "tip");
  if (!graded.length) return 100;
  const pts = graded.reduce((s, c) => s + (c.level === "ok" ? 1 : c.level === "warn" ? 0.5 : 0), 0);
  return Math.round((pts / graded.length) * 100);
}
