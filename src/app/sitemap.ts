import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, articles] = await Promise.all([
    db.query.products.findMany({ where: eq(t.products.published, true), columns: { slug: true, updatedAt: true }, with: { images: { columns: { url: true } } } }),
    db.query.categories.findMany({ columns: { slug: true, updatedAt: true } }),
    db.query.brands.findMany({ columns: { slug: true, updatedAt: true } }),
    db.query.articles.findMany({ where: eq(t.articles.published, true), columns: { slug: true, updatedAt: true, cover: true } }),
  ]);
  const abs = (u: string) => (u.startsWith("http") ? u : SITE_URL + u);
  return [
    { url: SITE_URL + "/", changeFrequency: "weekly", priority: 1 },
    { url: SITE_URL + "/udon-thani", changeFrequency: "monthly", priority: 0.9 },
    { url: SITE_URL + "/nong-khai", changeFrequency: "monthly", priority: 0.9 },
    { url: SITE_URL + "/products", changeFrequency: "weekly", priority: 0.8 },
    ...(articles.length ? [{ url: SITE_URL + "/articles", changeFrequency: "weekly" as const, priority: 0.7 }] : []),
    ...articles.map((a) => ({ url: `${SITE_URL}/articles/${a.slug}`, lastModified: a.updatedAt, priority: 0.7, images: a.cover ? [abs(a.cover)] : undefined })),
    ...categories.map((c) => ({ url: `${SITE_URL}/category/${c.slug}`, lastModified: c.updatedAt, priority: 0.7 })),
    ...brands.map((b) => ({ url: `${SITE_URL}/brand/${b.slug}`, lastModified: b.updatedAt, priority: 0.6 })),
    ...products.map((p) => ({ url: `${SITE_URL}/products/${p.slug}`, lastModified: p.updatedAt, priority: 0.6, images: p.images.map((i) => abs(i.url)) })),
  ];
}
