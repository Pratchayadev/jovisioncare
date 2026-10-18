// ข้อมูลตั้งต้นจากดีไซน์ — รันซ้ำได้ ไม่สร้างซ้ำ
import { eq } from "drizzle-orm";
import { db, t } from "../lib/db";

const categories = [
  { slug: "optical", name: "แว่นสายตา", sortOrder: 1, description: "กรอบแว่นสายตาแบรนด์แท้ พร้อมตรวจวัดสายตาและประกอบเลนส์ ที่ร้านแว่นอุดรและหนองคาย" },
  { slug: "sunglasses", name: "แว่นกันแดด", sortOrder: 2, description: "แว่นกันแดดแบรนด์แท้ เลนส์ตัดแสง UV400 และโพลาไรซ์" },
  { slug: "promotion", name: "โปรโมชั่น", sortOrder: 3, description: "โปรโมชั่นกรอบแว่นพร้อมเลนส์ ราคาพิเศษ" },
];
const brands = ["BOLON", "HELEN KELLER", "CLROTTE", "S7&ILUVU", "AIRA", "EMPORIO ARMANI", "FILA", "ADIDAS", "PERCY", "COACH", "CATH KIDSTON", "J.O. SET"];
const brandSlug = (n: string) => n.toLowerCase().replace(/&/g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const pool = ["/images/gallery/g1.jpg", "/images/gallery/g2.jpg", "/images/gallery/g3.jpg"];
const products = [
  { code: "BL-01", img: "p1", brand: "BOLON", name: "กรอบโลหะทรงหยดน้ำ", cat: "sunglasses", tag: "NEW ARRIVAL" },
  { code: "BL-02", img: "p2", brand: "BOLON", name: "กรอบทรงกลม เลนส์ไล่สี", cat: "sunglasses", tag: "BEST SELLER" },
  { code: "CL-01", img: "p3", brand: "CLROTTE", name: "กรอบไทเทเนียมทรงหกเหลี่ยม", cat: "optical", tag: "น้ำหนักเบา" },
  { code: "HK-01", img: "p4", brand: "HELEN KELLER", name: "กรอบอะซิเตททรงสี่เหลี่ยม", cat: "optical", tag: "BEST SELLER" },
  { code: "S7-01", img: "p5", brand: "S7&ILUVU", name: "กรอบใสทรงกลม", cat: "optical", tag: "NEW ARRIVAL" },
  { code: "AR-01", img: "p6", brand: "AIRA", name: "กรอบทรงแคทอาย", cat: "sunglasses", tag: "ลิมิเต็ด" },
  { code: "HK-02", img: "p7", brand: "HELEN KELLER", name: "กรอบโลหะทรงกลมบาง", cat: "optical", tag: "" },
  { code: "PR-01", img: "p8", brand: "J.O. SET", name: "กรอบ + เลนส์กรองแสงสีฟ้า", cat: "promotion", tag: "1,700 บาท", price: 1700 },
];

export async function seed() {
  for (const c of categories) await db.insert(t.categories).values(c).onConflictDoNothing();
  for (const [i, name] of brands.entries()) await db.insert(t.brands).values({ name, slug: brandSlug(name), sortOrder: i }).onConflictDoNothing();

  for (const [i, p] of products.entries()) {
    const exists = await db.query.products.findFirst({ where: eq(t.products.code, p.code) });
    if (exists) continue;
    const brand = await db.query.brands.findFirst({ where: eq(t.brands.slug, brandSlug(p.brand)) });
    const cat = await db.query.categories.findFirst({ where: eq(t.categories.slug, p.cat) });
    const [row] = await db
      .insert(t.products)
      .values({ code: p.code, name: p.name, slug: `${brandSlug(p.brand)}-${p.code.toLowerCase()}`, tag: p.tag || null, price: p.price ?? null, sortOrder: i, brandId: brand?.id, categoryId: cat?.id })
      .returning();
    const imgs = [`/images/products/${p.img}.jpg`, pool[i % 3], pool[(i + 1) % 3]];
    await db.insert(t.productImages).values(imgs.map((url, k) => ({ url, sortOrder: k, productId: row.id, alt: `${p.brand} ${p.name} ภาพที่ ${k + 1}` })));
  }
  const count = async (tbl: typeof t.products | typeof t.brands | typeof t.categories) => (await db.select().from(tbl)).length;
  console.log(`seed เรียบร้อย: ${await count(t.products)} สินค้า, ${await count(t.brands)} แบรนด์, ${await count(t.categories)} หมวดหมู่`);
}
