import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`).$onUpdate(() => new Date()),
};

const seo = {
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
};

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  content: text("content"), // บทความแนะนำใต้รายการสินค้า (markdown)
  faq: text("faq"), // JSON [{q,a}]
  sortOrder: integer("sort_order").notNull().default(0),
  ...seo,
  ...timestamps,
});

export const brands = sqliteTable("brands", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  description: text("description"),
  content: text("content"),
  faq: text("faq"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...seo,
  ...timestamps,
});

export const products = sqliteTable(
  "products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    tag: text("tag"),
    price: integer("price"),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    featured: integer("featured", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),
    ...seo,
    ...timestamps,
  },
  (t) => [index("products_category_idx").on(t.categoryId), index("products_brand_idx").on(t.brandId)],
);

export const productImages = sqliteTable(
  "product_images",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    url: text("url").notNull(),
    alt: text("alt"),
    sortOrder: integer("sort_order").notNull().default(0),
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

// ค่าตั้งค่าร้านแบบ key-value (ลิงก์โซเชียล เบอร์โทร ฯลฯ) — แก้ได้ที่ /admin/settings
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`).$onUpdate(() => new Date()),
});

// รีวิวจากโพสต์ IG ที่ลูกค้าแท็กร้าน — จัดการได้ที่ /admin/reviews
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  handle: text("handle").notNull(), // ชื่อ IG ลูกค้า เช่น barayb (ไม่ต้องมี @)
  avatar: text("avatar"), // รูปโปรไฟล์ (ไม่ใส่ = แสดงตัวอักษรแรก)
  image: text("image").notNull(), // รูปโพสต์
  postUrl: text("post_url"), // ลิงก์โพสต์ IG ต้นฉบับ
  brand: text("brand"), // แบรนด์กรอบในรูป
  branch: text("branch"), // สาขา
  caption: text("caption"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

// บทความ — จัดการได้ที่ /admin/articles
export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull().default(""), // markdown
  cover: text("cover"),
  coverAlt: text("cover_alt"),
  faq: text("faq"),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  ...seo,
  ...timestamps,
});

// บริการของร้าน — จัดการได้ที่ /admin/services
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary"), // 1–2 ประโยค ใช้ในรายการบริการและใต้หัวข้อ
  content: text("content").notNull().default(""), // markdown
  faq: text("faq"),
  hasPage: integer("has_page", { mode: "boolean" }).notNull().default(true), // false = แสดงในรายการ แล้วลิงก์ไป linkUrl
  linkUrl: text("link_url"), // เช่น /category/sunglasses
  branches: text("branches").notNull().default("all"), // all | udon | nongkhai
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...seo,
  ...timestamps,
});

// โปรโมชัน — จัดการได้ที่ /admin/promotions · หมดอายุแล้วซ่อนเอง
export const promotions = sqliteTable("promotions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  highlight: text("highlight"), // ข้อความเด่นบนแถบหน้าแรก เช่น "1,700 บาท"
  summary: text("summary"),
  details: text("details").notNull().default(""), // markdown
  image: text("image"),
  imageAlt: text("image_alt"),
  branches: text("branches").notNull().default("all"),
  endsAt: integer("ends_at", { mode: "timestamp" }), // ว่าง = ไม่มีกำหนด
  featured: integer("featured", { mode: "boolean" }).notNull().default(false), // แสดงบนแถบหน้าแรก
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

// URL เก่า → URL ใหม่ (301) สร้างอัตโนมัติเมื่อเปลี่ยน slug หรือลบ
export const redirects = sqliteTable("redirects", {
  fromPath: text("from_path").primaryKey(),
  toPath: text("to_path").notNull(),
  hits: integer("hits").notNull().default(0),
  createdAt: timestamps.createdAt,
});

export const categoriesRelations = relations(categories, ({ many }) => ({ products: many(products) }));
export const brandsRelations = relations(brands, ({ many }) => ({ products: many(products) }));
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  images: many(productImages),
}));
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export type Category = typeof categories.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type Redirect = typeof redirects.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
