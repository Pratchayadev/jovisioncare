import "server-only";
import { and, asc, desc, eq, gt, isNull, ne, or, sql } from "drizzle-orm";
import { db, t } from "./db";

const withRelations = {
  brand: true as const,
  category: true as const,
  images: { orderBy: [asc(t.productImages.sortOrder), asc(t.productImages.id)] },
};

const productOrder = [asc(t.products.sortOrder), desc(t.products.id)];

export type ProductFull = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export function getPublishedProducts(opts: { categoryId?: number; brandId?: number; featuredOnly?: boolean; limit?: number } = {}) {
  const conds = [eq(t.products.published, true)];
  if (opts.categoryId) conds.push(eq(t.products.categoryId, opts.categoryId));
  if (opts.brandId) conds.push(eq(t.products.brandId, opts.brandId));
  if (opts.featuredOnly) conds.push(eq(t.products.featured, true));
  return db.query.products.findMany({ where: and(...conds), with: withRelations, orderBy: productOrder, limit: opts.limit });
}

export function getProductBySlug(slug: string) {
  return db.query.products.findFirst({ where: and(eq(t.products.slug, slug), eq(t.products.published, true)), with: withRelations });
}

export async function getRelatedProducts(p: { id: number; categoryId: number | null; brandId: number | null }, limit = 4) {
  const where = and(eq(t.products.published, true), ne(t.products.id, p.id), p.brandId ? eq(t.products.brandId, p.brandId) : undefined);
  let rows = await db.query.products.findMany({ where, with: withRelations, orderBy: productOrder, limit });
  if (rows.length < limit && p.categoryId) {
    const more = await db.query.products.findMany({
      where: and(eq(t.products.published, true), ne(t.products.id, p.id), eq(t.products.categoryId, p.categoryId)),
      with: withRelations,
      orderBy: productOrder,
      limit: limit * 2,
    });
    const seen = new Set(rows.map((r) => r.id));
    rows = [...rows, ...more.filter((r) => !seen.has(r.id))].slice(0, limit);
  }
  return rows;
}

export const getCategories = () => db.query.categories.findMany({ orderBy: [asc(t.categories.sortOrder), asc(t.categories.name)] });
export const getBrands = () => db.query.brands.findMany({ orderBy: [asc(t.brands.sortOrder), asc(t.brands.name)] });
export const getCategoryBySlug = (slug: string) => db.query.categories.findFirst({ where: eq(t.categories.slug, slug) });
export const getBrandBySlug = (slug: string) => db.query.brands.findFirst({ where: eq(t.brands.slug, slug) });

/** แปลงสินค้าเป็นข้อมูลเบา ๆ สำหรับส่งให้ client component */
export function toCard(p: ProductFull) {
  return {
    id: p.id,
    code: p.code,
    slug: p.slug,
    name: p.name,
    brand: p.brand?.name ?? "",
    brandSlug: p.brand?.slug ?? null,
    categorySlug: p.category?.slug ?? null,
    categoryName: p.category?.name ?? null,
    tag: p.tag ?? "",
    price: p.price,
    description: p.description,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt || `${p.brand?.name ?? ""} ${p.name}`.trim() })),
  };
}
export type ProductCard = ReturnType<typeof toCard>;

export const getPublishedReviews = () =>
  db.query.reviews.findMany({ where: eq(t.reviews.published, true), orderBy: [asc(t.reviews.sortOrder), desc(t.reviews.id)], limit: 12 });

/* ---------- บทความ ---------- */
// บทความที่ตั้งเวลาเผยแพร่ล่วงหน้า จะแสดงเมื่อถึงเวลา (หน้าเว็บ cache 1 ชม. จึงขึ้นภายในราว 1 ชม.)
const liveArticle = () => and(eq(t.articles.published, true), or(isNull(t.articles.publishedAt), sql`${t.articles.publishedAt} <= unixepoch()`));
export const getPublishedArticles = (limit?: number) =>
  db.query.articles.findMany({ where: liveArticle(), orderBy: [desc(t.articles.publishedAt), desc(t.articles.id)], limit });
export const getArticleBySlug = (slug: string) => db.query.articles.findFirst({ where: and(eq(t.articles.slug, slug), liveArticle()) });

/** แบรนด์ทั้งหมด พร้อมจำนวนสินค้าที่เผยแพร่ */
export async function getBrandsWithCounts() {
  const [brands, counts] = await Promise.all([
    getBrands(),
    db.select({ brandId: t.products.brandId, n: sql<number>`count(*)` }).from(t.products).where(eq(t.products.published, true)).groupBy(t.products.brandId),
  ]);
  const m = new Map(counts.map((c) => [c.brandId, Number(c.n)]));
  return brands.map((b) => ({ ...b, count: m.get(b.id) ?? 0 }));
}

/* ---------- บริการ ---------- */
export const getPublishedServices = () =>
  db.query.services.findMany({ where: eq(t.services.published, true), orderBy: [asc(t.services.sortOrder), asc(t.services.id)] });
export const getServiceBySlug = (slug: string) =>
  db.query.services.findFirst({ where: and(eq(t.services.slug, slug), eq(t.services.published, true), eq(t.services.hasPage, true)) });
/** ลิงก์ของบริการ: หน้าของตัวเอง หรือหน้าที่มีอยู่แล้ว */
export const serviceHref = (s: { hasPage: boolean; slug: string; linkUrl: string | null }) => (s.hasPage ? `/services/${s.slug}` : s.linkUrl || "/services");

/* ---------- โปรโมชัน ---------- */
/** โปรโมชันที่ยังไม่หมดอายุ (เลือกสาขาได้) */
export async function getActivePromotions(branch?: "udon" | "nongkhai") {
  const rows = await db.query.promotions.findMany({
    where: and(eq(t.promotions.published, true), or(isNull(t.promotions.endsAt), gt(t.promotions.endsAt, new Date()))),
    orderBy: [asc(t.promotions.sortOrder), desc(t.promotions.id)],
  });
  return branch ? rows.filter((p) => p.branches === "all" || p.branches === branch) : rows;
}
