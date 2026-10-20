import type { MetadataRoute } from "next";
import { and, eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, services, articles] = await Promise.all([
    db.query.products.findMany({ where: eq(t.products.published, true), columns: { slug: true, updatedAt: true, brandId: true, categoryId: true }, with: { images: { columns: { url: true } } } }),
    db.query.categories.findMany({ columns: { id: true, slug: true, updatedAt: true, content: true } }),
    db.query.brands.findMany({ columns: { id: true, slug: true, updatedAt: true, content: true } }),
    db.query.services.findMany({ where: and(eq(t.services.published, true), eq(t.services.hasPage, true)), columns: { slug: true, updatedAt: true } }),
    db.query.articles.findMany({ where: eq(t.articles.published, true), columns: { slug: true, updatedAt: true, cover: true } }),
  ]);
  const abs = (u: string) => (u.startsWith("http") ? u : SITE_URL + u);
  return [
    { url: SITE_URL + "/", changeFrequency: "weekly", priority: 1 },
    { url: SITE_URL + "/udon-thani", changeFrequency: "monthly", priority: 0.9 },
    ...(["/nong-khai", "/lo/nong-khai", "/en/nong-khai"] as const).map((p) => ({
      url: SITE_URL + p,
      changeFrequency: "monthly" as const,
      priority: p === "/nong-khai" ? 0.9 : 0.8,
      alternates: { languages: { th: SITE_URL + "/nong-khai", lo: SITE_URL + "/lo/nong-khai", en: SITE_URL + "/en/nong-khai" } },
    })),
    { url: SITE_URL + "/products", changeFrequency: "weekly", priority: 0.8 },
    { url: SITE_URL + "/brands", changeFrequency: "monthly", priority: 0.7 },
    { url: SITE_URL + "/services", changeFrequency: "monthly", priority: 0.8 },
    ...services.map((s) => ({ url: `${SITE_URL}/services/${s.slug}`, lastModified: s.updatedAt, priority: 0.8 })),
    { url: SITE_URL + "/privacy", changeFrequency: "yearly", priority: 0.2 },
    ...(articles.length ? [{ url: SITE_URL + "/articles", changeFrequency: "weekly" as const, priority: 0.7 }] : []),
    ...articles.map((a) => ({ url: `${SITE_URL}/articles/${a.slug}`, lastModified: a.updatedAt, priority: 0.7, images: a.cover ? [abs(a.cover)] : undefined })),
    ...categories.filter((c) => c.content?.trim() || products.some((p) => p.categoryId === c.id)).map((c) => ({ url: `${SITE_URL}/category/${c.slug}`, lastModified: c.updatedAt, priority: 0.7 })),
    ...brands.filter((b) => b.content?.trim() || products.some((p) => p.brandId === b.id)).map((b) => ({ url: `${SITE_URL}/brand/${b.slug}`, lastModified: b.updatedAt, priority: 0.6 })),
    ...products.map((p) => ({ url: `${SITE_URL}/products/${p.slug}`, lastModified: p.updatedAt, priority: 0.6, images: p.images.map((i) => abs(i.url)) })),
  ];
}
