import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import { dbUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const n = async (q: Promise<{ c: number }[]>) => (await q)[0].c;
  const [products, hidden, categories, brands, reviews] = await Promise.all([
    n(db.select({ c: count() }).from(t.products)),
    n(db.select({ c: count() }).from(t.products).where(eq(t.products.published, false))),
    n(db.select({ c: count() }).from(t.categories)),
    n(db.select({ c: count() }).from(t.brands)),
    n(db.select({ c: count() }).from(t.reviews)),
  ]);
  const init = await db.query.settings.findFirst({ where: eq(t.settings.key, "db_initialized_at") });
  const host = (() => { try { return new URL(dbUrl.replace(/^libsql:/, "https:")).host || dbUrl; } catch { return dbUrl; } })();
  return (
    <>
      <div className="adm-head">
        <h1>ภาพรวม</h1>
        <div className="actions"><Link href="/admin/products/new" className="btn-a primary">+ เพิ่มสินค้า</Link></div>
      </div>
      <div className="stats">
        <div className="card stat"><b>{products}</b><span>สินค้าทั้งหมด{hidden ? ` (ซ่อน ${hidden})` : ""}</span><Link href="/admin/products">จัดการสินค้า</Link></div>
        <div className="card stat"><b>{categories}</b><span>หมวดหมู่</span><Link href="/admin/categories">จัดการหมวดหมู่</Link></div>
        <div className="card stat"><b>{brands}</b><span>แบรนด์</span><Link href="/admin/brands">จัดการแบรนด์</Link></div>
        <div className="card stat"><b>{reviews}</b><span>รีวิว IG</span><Link href="/admin/reviews">จัดการรีวิว</Link></div>
      </div>
      <div className="card panel">
        <h2>ทิปส์ SEO</h2>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.9, color: "var(--muted)" }}>
          <li>ใส่ <b>รายละเอียดสินค้า</b> ที่ไม่ซ้ำกัน และคำที่ลูกค้าค้นหา เช่น “ร้านแว่นอุดร”, “แว่นกรองแสง”</li>
          <li>ใส่ <b>คำอธิบายรูป (alt)</b> ให้ทุกรูป ช่วยให้ติด Google Images</li>
          <li>เขียน <b>คำอธิบายหมวดหมู่และแบรนด์</b> หน้าเหล่านี้คือหน้าที่มีโอกาสติดอันดับสูง</li>
          <li>เปลี่ยนแล้วหน้าเว็บอัปเดตทันที และ <code>/sitemap.xml</code> อัปเดตอัตโนมัติ</li>
        </ul>
      </div>
      <p style={{ marginTop: 18, fontSize: 12, color: "var(--muted)", fontFamily: "IBM Plex Mono, monospace", wordBreak: "break-all" }}>
        ฐานข้อมูล: {host} · เริ่มใช้: {init?.value ? new Date(init.value).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) : "—"} · รีวิว {reviews} · สินค้า {products}
      </p>
    </>
  );
}
