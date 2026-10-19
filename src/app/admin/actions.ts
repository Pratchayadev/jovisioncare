"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, inArray, ne } from "drizzle-orm";
import { db, t } from "@/lib/db";
import { checkCredentials, requireAdmin } from "@/lib/admin";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { deleteImage, saveImage } from "@/lib/storage";

export type FormState = { error?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const opt = (f: FormData, k: string) => str(f, k) || null;
const int = (f: FormData, k: string) => { const v = str(f, k).replace(/[,\s]/g, ""); return v === "" ? null : Number.parseInt(v, 10) || 0; };
const files = (f: FormData, k: string) => f.getAll(k).filter((x): x is File => x instanceof File && x.size > 0);
const refresh = () => revalidatePath("/", "layout");

function friendly(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  if (/UNIQUE constraint failed: \w+\.slug/.test(msg)) return "Slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน";
  if (/UNIQUE constraint failed: \w+\.code/.test(msg)) return "รหัสสินค้านี้ถูกใช้แล้ว";
  return msg;
}

/* ---------- Auth ---------- */
let lastFail = 0;
export async function login(_: FormState, f: FormData): Promise<FormState> {
  if (Date.now() - lastFail < 1500) await new Promise((r) => setTimeout(r, 1500));
  if (!process.env.ADMIN_PASSWORD_HASH) return { error: "ยังไม่ได้ตั้งค่า ADMIN_PASSWORD_HASH ในไฟล์ .env" };
  if (!checkCredentials(str(f, "username"), String(f.get("password") ?? ""))) {
    lastFail = Date.now();
    return { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
  }
  const { token, maxAge } = await createSessionToken(str(f, "username"));
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------- Products ---------- */
export async function saveProduct(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = int(f, "id");
  const name = str(f, "name");
  const code = str(f, "code").toUpperCase();
  if (!name || !code) return { error: "กรุณากรอกชื่อสินค้าและรหัสสินค้า" };
  const brandId = int(f, "brandId") || null;
  const brand = brandId ? await db.query.brands.findFirst({ where: eq(t.brands.id, brandId) }) : null;
  const slug = slugify(str(f, "slug") || `${brand?.slug ?? ""} ${code}`) || slugify(name);

  const values = {
    name, code, slug,
    description: opt(f, "description"),
    tag: opt(f, "tag"),
    price: int(f, "price"),
    published: f.get("published") === "on",
    featured: f.get("featured") === "on",
    sortOrder: int(f, "sortOrder") ?? 0,
    categoryId: int(f, "categoryId") || null,
    brandId,
    metaTitle: opt(f, "metaTitle"),
    metaDescription: opt(f, "metaDescription"),
  };

  let productId = id;
  try {
    if (id) await db.update(t.products).set(values).where(eq(t.products.id, id));
    else productId = (await db.insert(t.products).values(values).returning({ id: t.products.id }))[0].id;

    // รูปเดิม: แก้ alt / ลำดับ / ลบ
    const existing = productId ? await db.query.productImages.findMany({ where: eq(t.productImages.productId, productId) }) : [];
    const toDelete = f.getAll("deleteImage").map(Number);
    for (const img of existing) {
      if (toDelete.includes(img.id)) continue;
      await db.update(t.productImages).set({ alt: opt(f, `alt_${img.id}`), sortOrder: int(f, `order_${img.id}`) ?? img.sortOrder }).where(eq(t.productImages.id, img.id));
    }
    if (toDelete.length) {
      const rows = existing.filter((i) => toDelete.includes(i.id));
      await db.delete(t.productImages).where(and(eq(t.productImages.productId, productId!), inArray(t.productImages.id, toDelete)));
      await Promise.all(rows.map((r) => deleteImage(r.url)));
    }
    // รูปใหม่
    const uploads = files(f, "images");
    const start = existing.length ? Math.max(...existing.map((i) => i.sortOrder)) + 1 : 0;
    for (const [k, file] of uploads.entries()) {
      const url = await saveImage(file, "products");
      await db.insert(t.productImages).values({ url, productId: productId!, sortOrder: start + k, alt: `${brand?.name ?? ""} ${name}`.trim() });
    }
  } catch (e) {
    return { error: friendly(e) };
  }
  refresh();
  redirect(`/admin/products?saved=${productId}`);
}

export async function deleteProduct(f: FormData) {
  await requireAdmin();
  const id = int(f, "id");
  if (!id) return;
  const imgs = await db.query.productImages.findMany({ where: eq(t.productImages.productId, id) });
  await db.delete(t.productImages).where(eq(t.productImages.productId, id));
  await db.delete(t.products).where(eq(t.products.id, id));
  await Promise.all(imgs.map((i) => deleteImage(i.url)));
  refresh();
  redirect("/admin/products?deleted=1");
}

export async function togglePublished(f: FormData) {
  await requireAdmin();
  const id = int(f, "id");
  if (!id) return;
  const p = await db.query.products.findFirst({ where: eq(t.products.id, id) });
  if (p) await db.update(t.products).set({ published: !p.published }).where(eq(t.products.id, id));
  refresh();
}

/* ---------- Categories & Brands ---------- */
type Kind = "categories" | "brands";

async function saveTaxonomy(kind: Kind, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = int(f, "id");
  const name = str(f, "name");
  if (!name) return { error: "กรุณากรอกชื่อ" };
  const slug = slugify(str(f, "slug") || name);
  if (!slug) return { error: "Slug ไม่ถูกต้อง" };
  const table = t[kind];
  const values: Record<string, unknown> = {
    name, slug,
    description: opt(f, "description"),
    sortOrder: int(f, "sortOrder") ?? 0,
    metaTitle: opt(f, "metaTitle"),
    metaDescription: opt(f, "metaDescription"),
  };
  try {
    const dupe = await db.select({ id: table.id }).from(table).where(id ? and(eq(table.slug, slug), ne(table.id, id)) : eq(table.slug, slug));
    if (dupe.length) return { error: "Slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน" };
    if (kind === "brands") {
      const logo = files(f, "logo")[0];
      const current = id ? await db.query.brands.findFirst({ where: eq(t.brands.id, id) }) : null;
      if (logo) { values.logo = await saveImage(logo, "brands"); if (current?.logo) await deleteImage(current.logo); }
      else if (f.get("removeLogo") === "on") { values.logo = null; if (current?.logo) await deleteImage(current.logo); }
    }
    if (id) await db.update(table).set(values).where(eq(table.id, id));
    else await db.insert(table).values(values as typeof table.$inferInsert);
  } catch (e) {
    return { error: friendly(e) };
  }
  refresh();
  redirect(`/admin/${kind}?saved=1`);
}

export async function saveCategory(_: FormState, f: FormData) { return saveTaxonomy("categories", f); }
export async function saveBrand(_: FormState, f: FormData) { return saveTaxonomy("brands", f); }

async function deleteTaxonomy(kind: Kind, f: FormData) {
  await requireAdmin();
  const id = int(f, "id");
  if (!id) return;
  if (kind === "brands") {
    const b = await db.query.brands.findFirst({ where: eq(t.brands.id, id) });
    if (b?.logo) await deleteImage(b.logo);
  }
  // สินค้าในหมวด/แบรนด์นี้จะไม่ถูกลบ แค่ไม่มีหมวด/แบรนด์
  if (kind === "categories") await db.update(t.products).set({ categoryId: null }).where(eq(t.products.categoryId, id));
  else await db.update(t.products).set({ brandId: null }).where(eq(t.products.brandId, id));
  await db.delete(t[kind]).where(eq(t[kind].id, id));
  refresh();
  redirect(`/admin/${kind}?deleted=1`);
}
export async function deleteCategory(f: FormData) { return deleteTaxonomy("categories", f); }
export async function deleteBrand(f: FormData) { return deleteTaxonomy("brands", f); }

/* ---------- Reviews (IG) ---------- */
function normalizeHandle(h: string) {
  return h.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?#].*$/, "").replace(/^@+/, "");
}

export async function saveReview(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = int(f, "id");
  const handle = normalizeHandle(str(f, "handle"));
  if (!handle) return { error: "กรุณากรอกชื่อ IG ของลูกค้า" };
  const postUrl = opt(f, "postUrl");
  if (postUrl && !/^https:\/\/(www\.)?instagram\.com\//i.test(postUrl)) return { error: "ลิงก์โพสต์ต้องเป็นลิงก์ instagram.com" };

  const current = id ? await db.query.reviews.findFirst({ where: eq(t.reviews.id, id) }) : null;
  const values: Partial<typeof t.reviews.$inferInsert> = {
    handle,
    postUrl,
    brand: opt(f, "brand"),
    branch: opt(f, "branch"),
    caption: opt(f, "caption"),
    published: f.get("published") === "on",
    sortOrder: int(f, "sortOrder") ?? 0,
  };
  try {
    const image = files(f, "image")[0];
    const avatar = files(f, "avatar")[0];
    if (image) { values.image = await saveImage(image, "reviews"); if (current?.image) await deleteImage(current.image); }
    if (avatar) { values.avatar = await saveImage(avatar, "reviews"); if (current?.avatar) await deleteImage(current.avatar); }
    else if (f.get("removeAvatar") === "on" && current?.avatar) { values.avatar = null; await deleteImage(current.avatar); }
    if (!values.image && !current?.image) return { error: "กรุณาเลือกรูปโพสต์" };
    if (id) await db.update(t.reviews).set(values).where(eq(t.reviews.id, id));
    else await db.insert(t.reviews).values(values as typeof t.reviews.$inferInsert);
  } catch (e) {
    return { error: friendly(e) };
  }
  refresh();
  redirect("/admin/reviews?saved=1");
}

export async function deleteReview(f: FormData) {
  await requireAdmin();
  const id = int(f, "id");
  if (!id) return;
  const r = await db.query.reviews.findFirst({ where: eq(t.reviews.id, id) });
  await db.delete(t.reviews).where(eq(t.reviews.id, id));
  if (r) await Promise.all([deleteImage(r.image), r.avatar ? deleteImage(r.avatar) : null]);
  refresh();
  redirect("/admin/reviews?deleted=1");
}

export async function toggleReview(f: FormData) {
  await requireAdmin();
  const id = int(f, "id");
  if (!id) return;
  const r = await db.query.reviews.findFirst({ where: eq(t.reviews.id, id) });
  if (r) await db.update(t.reviews).set({ published: !r.published }).where(eq(t.reviews.id, id));
  refresh();
}
