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
import { BRANCH_IDS, DAYS, parseLatLng } from "@/lib/branches";
import { branchKey } from "@/lib/settings";
import { clearRedirect, recordMove } from "@/lib/redirects";
import { parseFaq } from "@/lib/faq";
import { PRIVACY_KEY } from "@/lib/privacy";

export type FormState = { error?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const opt = (f: FormData, k: string) => str(f, k) || null;
const int = (f: FormData, k: string) => { const v = str(f, k).replace(/[,\s]/g, ""); return v === "" ? null : Number.parseInt(v, 10) || 0; };
const files = (f: FormData, k: string) => f.getAll(k).filter((x): x is File => x instanceof File && x.size > 0);
const refresh = () => revalidatePath("/", "layout");
const faqJson = (f: FormData) => { const v = parseFaq(str(f, "faq")); return v.length ? JSON.stringify(v.map(({ q, a }) => ({ q: q.trim(), a: a.trim() }))) : null; };

function friendly(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  if (/UNIQUE constraint failed: \w+\.slug/.test(msg)) return "Slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน";
  if (/UNIQUE constraint failed: \w+\.code/.test(msg)) return "รหัสสินค้านี้ถูกใช้แล้ว";
  if (msg.startsWith("Failed query")) {
    const cause = e instanceof Error && e.cause instanceof Error ? e.cause.message : "";
    return `ฐานข้อมูลไม่รับข้อมูล${cause ? ` (${cause.slice(0, 160)})` : ""}`;
  }
  return msg.slice(0, 300);
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
    const old = id ? await db.query.products.findFirst({ where: eq(t.products.id, id), columns: { slug: true } }) : null;
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
    if (old && old.slug !== slug) await recordMove(`/products/${old.slug}`, `/products/${slug}`);
    else await clearRedirect(`/products/${slug}`);
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
  const p = await db.query.products.findFirst({ where: eq(t.products.id, id), with: { category: true } });
  await db.delete(t.productImages).where(eq(t.productImages.productId, id));
  await db.delete(t.products).where(eq(t.products.id, id));
  // ลิงก์สินค้าที่ลบแล้ว ส่งไปหน้าหมวดแทน 404
  if (p) await recordMove(`/products/${p.slug}`, p.category ? `/category/${p.category.slug}` : "/products");
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
    content: opt(f, "content"),
    faq: faqJson(f),
    sortOrder: int(f, "sortOrder") ?? 0,
    metaTitle: opt(f, "metaTitle"),
    metaDescription: opt(f, "metaDescription"),
  };
  const base = kind === "brands" ? "/brand/" : "/category/";
  try {
    const old = id ? (await db.select({ slug: table.slug }).from(table).where(eq(table.id, id)))[0] : null;
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
    if (old && old.slug !== slug) await recordMove(base + old.slug, base + slug);
    else await clearRedirect(base + slug);
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
  const row = (await db.select({ slug: t[kind].slug }).from(t[kind]).where(eq(t[kind].id, id)))[0];
  if (row) await recordMove((kind === "brands" ? "/brand/" : "/category/") + row.slug, "/products");
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
  if (id && !current) return { error: "ไม่พบรีวิวนี้ในฐานข้อมูล (อาจถูกลบไปแล้ว)" };
  const image = files(f, "image")[0];
  const avatar = files(f, "avatar")[0];
  if (!image && !current?.image) return { error: "กรุณาเลือกรูปโพสต์" };

  const values: Partial<typeof t.reviews.$inferInsert> = {
    handle,
    postUrl,
    brand: opt(f, "brand"),
    branch: opt(f, "branch"),
    caption: opt(f, "caption"),
    published: f.get("published") === "on",
    sortOrder: int(f, "sortOrder") ?? 0,
  };
  const uploaded: string[] = [];
  let savedId = id;
  try {
    if (image) uploaded.push((values.image = await saveImage(image, "reviews")));
    if (avatar) uploaded.push((values.avatar = await saveImage(avatar, "reviews")));
    else if (f.get("removeAvatar") === "on") values.avatar = null;

    if (id) await db.update(t.reviews).set(values).where(eq(t.reviews.id, id));
    else savedId = (await db.insert(t.reviews).values(values as typeof t.reviews.$inferInsert).returning({ id: t.reviews.id }))[0]?.id ?? null;

    // อ่านกลับมาตรวจว่าบันทึกลงฐานข้อมูลจริง
    const check = savedId ? await db.query.reviews.findFirst({ where: eq(t.reviews.id, savedId) }) : null;
    if (!check || check.handle !== handle) throw new Error("บันทึกไม่สำเร็จ: อ่านข้อมูลกลับจากฐานข้อมูลไม่เจอ");
  } catch (e) {
    console.error("[saveReview] failed", { id, handle, uploaded, error: e instanceof Error ? e.message : e });
    await Promise.all(uploaded.map(deleteImage)); // ไม่ให้มีรูปค้างใน R2 ถ้าบันทึกไม่สำเร็จ
    return { error: `บันทึกไม่สำเร็จ — ${friendly(e)}` };
  }
  // ลบรูปเก่าหลังบันทึกสำเร็จเท่านั้น
  if (image && current?.image) await deleteImage(current.image);
  if ((avatar || f.get("removeAvatar") === "on") && current?.avatar) await deleteImage(current.avatar);
  console.info("[saveReview] ok", { id: savedId, handle });
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

/* ---------- Settings (ช่องทางติดต่อ) ---------- */
export async function saveSettings(_: FormState, f: FormData): Promise<FormState & { ok?: boolean }> {
  await requireAdmin();
  const handle = (v: string, host: RegExp) =>
    v.trim().replace(host, "").replace(/[/?#].*$/, "").replace(/^@+/, "");
  const ig = handle(str(f, "igHandle"), /^https?:\/\/(www\.)?instagram\.com\//i);
  const tt = handle(str(f, "tiktokHandle"), /^https?:\/\/(www\.)?tiktok\.com\/@?/i);
  const lineId = str(f, "lineId").replace(/\s/g, "");
  const lineUrl = str(f, "lineUrl");
  const fbUdon = str(f, "fbUdon");
  const fbNongkhai = str(f, "fbNongkhai");
  const phone = str(f, "phone");

  const okHandle = /^[A-Za-z0-9._]{1,30}$/;
  if (!okHandle.test(ig)) return { error: "ชื่อ Instagram ไม่ถูกต้อง (ใช้ได้เฉพาะ a-z 0-9 . _)" };
  if (!okHandle.test(tt)) return { error: "ชื่อ TikTok ไม่ถูกต้อง (ใช้ได้เฉพาะ a-z 0-9 . _)" };
  for (const [label, u] of [["Facebook สาขาอุดรธานี", fbUdon], ["Facebook สาขาหนองคาย", fbNongkhai]] as const)
    if (!/^https:\/\/(www\.|m\.)?(facebook|fb)\.com\/.+/i.test(u)) return { error: `ลิงก์${label} ต้องขึ้นต้นด้วย https://www.facebook.com/` };
  if (lineUrl && !/^https:\/\/(lin\.ee|line\.me|page\.line\.me)\/.+/i.test(lineUrl)) return { error: "ลิงก์ LINE ต้องเป็น https://lin.ee/... หรือ https://line.me/..." };
  if (lineId && !/^@?[A-Za-z0-9._-]{3,30}$/.test(lineId)) return { error: "LINE ID ไม่ถูกต้อง เช่น @jovisioncare" };
  const lineEnabled = f.get("lineEnabled") === "on";
  if (lineEnabled && !lineId && !lineUrl) return { error: "เปิดปุ่ม LINE ต้องใส่ LINE ID หรือลิงก์ LINE อย่างน้อย 1 อย่าง" };
  if (phone && !/^[0-9+\-\s()]{9,20}$/.test(phone)) return { error: "เบอร์โทรไม่ถูกต้อง เช่น 098-424-5224" };

  const values: Record<string, string> = {
    line_enabled: lineEnabled ? "1" : "0",
    line_id: lineId ? "@" + lineId.replace(/^@+/, "") : "",
    line_url: lineUrl,
    fb_udon: fbUdon,
    fb_nongkhai: fbNongkhai,
    ig_handle: ig,
    tiktok_handle: tt,
    phone,
  };
  for (const [key, value] of Object.entries(values))
    await db.insert(t.settings).values({ key, value }).onConflictDoUpdate({ target: t.settings.key, set: { value, updatedAt: new Date() } });
  refresh();
  return { ok: true };
}

/* ---------- Branches (สาขา) ---------- */
export async function saveBranch(_: FormState, f: FormData): Promise<FormState & { ok?: boolean }> {
  await requireAdmin();
  const id = str(f, "branchId") as (typeof BRANCH_IDS)[number];
  if (!BRANCH_IDS.includes(id)) return { error: "ไม่พบสาขา" };

  const place = str(f, "place"), line1 = str(f, "line1"), district = str(f, "district"), province = str(f, "province");
  const postalCode = str(f, "postalCode"), opens = str(f, "opens"), closes = str(f, "closes");
  if (!place || !line1 || !district || !province) return { error: "กรุณากรอกชื่อสถานที่ ที่อยู่ อำเภอ และจังหวัดให้ครบ" };
  if (!/^\d{5}$/.test(postalCode)) return { error: "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก" };
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!time.test(opens) || !time.test(closes)) return { error: "เวลาเปิด–ปิดต้องอยู่ในรูปแบบ 10:00" };
  if (opens >= closes) return { error: "เวลาปิดต้องหลังเวลาเปิด" };
  const pos = parseLatLng(str(f, "latlng"));
  if (!pos) return { error: "พิกัดไม่ถูกต้อง — ใส่แบบ 17.418690, 102.785187 หรือวางลิงก์ Google Maps ที่มีพิกัด" };
  if (pos.lat < 5 || pos.lat > 21 || pos.lng < 97 || pos.lng > 106) return { error: "พิกัดอยู่นอกประเทศไทย — ตรวจสอบอีกครั้ง" };
  const days = DAYS.map(([d]) => d).filter((d) => f.getAll("days").includes(d));
  if (!days.length) return { error: "เลือกวันที่เปิดอย่างน้อย 1 วัน" };

  const value = JSON.stringify({ place, line1, subdistrict: str(f, "subdistrict").replace(/^ต\.\s*/, ""), district: district.replace(/^อ\.\s*/, ""), province: province.replace(/^จ\.\s*/, ""), postalCode, lat: pos.lat, lng: pos.lng, opens, closes, days, directions: str(f, "directions").split("\n").map((l) => l.trim().replace(/^[-•*]\s*/, "")).filter(Boolean).slice(0, 12).join("\n"), parking: str(f, "parking").slice(0, 300) });
  await db.insert(t.settings).values({ key: branchKey(id), value }).onConflictDoUpdate({ target: t.settings.key, set: { value, updatedAt: new Date() } });
  refresh();
  return { ok: true };
}

/* ---------- รูปในเนื้อหา (บทความ / หมวด) ---------- */
export async function uploadContentImage(f: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = files(f, "image")[0];
  if (!file) return { error: "ไม่พบไฟล์รูป" };
  try {
    return { url: await saveImage(file, "content") };
  } catch (e) {
    return { error: `อัปโหลดไม่สำเร็จ — ${friendly(e)}` };
  }
}

/* ---------- Articles (บทความ) ---------- */
export async function saveArticle(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = int(f, "id");
  const title = str(f, "title");
  if (!title) return { error: "กรุณากรอกชื่อบทความ" };
  const slug = slugify(str(f, "slug") || title);
  if (!slug) return { error: "Slug ไม่ถูกต้อง" };
  const current = id ? await db.query.articles.findFirst({ where: eq(t.articles.id, id) }) : null;
  if (id && !current) return { error: "ไม่พบบทความนี้ (อาจถูกลบไปแล้ว)" };
  const dupe = await db.select({ id: t.articles.id }).from(t.articles).where(id ? and(eq(t.articles.slug, slug), ne(t.articles.id, id)) : eq(t.articles.slug, slug));
  if (dupe.length) return { error: "Slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน" };

  const published = f.get("published") === "on";
  const values: Partial<typeof t.articles.$inferInsert> = {
    title, slug,
    excerpt: opt(f, "excerpt"),
    content: str(f, "content"),
    coverAlt: opt(f, "coverAlt"),
    faq: faqJson(f),
    published,
    publishedAt: published ? (current?.publishedAt ?? new Date()) : (current?.publishedAt ?? null),
    metaTitle: opt(f, "metaTitle"),
    metaDescription: opt(f, "metaDescription"),
  };
  const cover = files(f, "cover")[0];
  let uploaded: string | null = null;
  let savedId = id;
  try {
    if (cover) uploaded = values.cover = await saveImage(cover, "articles");
    else if (f.get("removeCover") === "on") values.cover = null;
    if (id) await db.update(t.articles).set(values).where(eq(t.articles.id, id));
    else savedId = (await db.insert(t.articles).values(values as typeof t.articles.$inferInsert).returning({ id: t.articles.id }))[0].id;
    if (current && current.slug !== slug) await recordMove(`/articles/${current.slug}`, `/articles/${slug}`);
    else await clearRedirect(`/articles/${slug}`);
  } catch (e) {
    if (uploaded) await deleteImage(uploaded);
    return { error: friendly(e) };
  }
  if ((cover || f.get("removeCover") === "on") && current?.cover) await deleteImage(current.cover);
  refresh();
  redirect(`/admin/articles?saved=${savedId}`);
}

export async function deleteArticle(f: FormData) {
  await requireAdmin();
  const id = int(f, "id");
  if (!id) return;
  const a = await db.query.articles.findFirst({ where: eq(t.articles.id, id) });
  await db.delete(t.articles).where(eq(t.articles.id, id));
  if (a) {
    if (a.cover) await deleteImage(a.cover);
    if (a.published) await recordMove(`/articles/${a.slug}`, "/articles");
  }
  refresh();
  redirect("/admin/articles?deleted=1");
}

export async function toggleArticle(f: FormData) {
  await requireAdmin();
  const id = int(f, "id");
  if (!id) return;
  const a = await db.query.articles.findFirst({ where: eq(t.articles.id, id) });
  if (a) await db.update(t.articles).set({ published: !a.published, publishedAt: a.publishedAt ?? new Date() }).where(eq(t.articles.id, id));
  refresh();
}

/* ---------- Redirects ---------- */
const normPath = (v: string) => {
  let p = v.trim();
  try { if (/^https?:\/\//i.test(p)) { const u = new URL(p); p = u.pathname + u.search; } } catch { /* ใช้ค่าเดิม */ }
  p = decodeURIComponent(p).replace(/\/+$/, "");
  return p.startsWith("/") ? p : "/" + p;
};

export async function saveRedirect(_: FormState, f: FormData): Promise<FormState & { ok?: boolean }> {
  await requireAdmin();
  const from = normPath(str(f, "from")), to = normPath(str(f, "to"));
  if (from === "/" || from.length < 2) return { error: "URL เก่าไม่ถูกต้อง" };
  if (from.startsWith("/admin")) return { error: "ไม่สามารถ redirect หน้าหลังบ้าน" };
  if (from === to) return { error: "URL เก่าและใหม่ต้องไม่เหมือนกัน" };
  await recordMove(from, to);
  refresh();
  return { ok: true };
}

export async function deleteRedirect(f: FormData) {
  await requireAdmin();
  const from = str(f, "id");
  if (from) await clearRedirect(from);
  refresh();
}

/* ---------- นโยบายความเป็นส่วนตัว ---------- */
export async function savePrivacy(_: FormState, f: FormData): Promise<FormState & { ok?: boolean }> {
  await requireAdmin();
  const value = f.get("useDefault") === "on" ? "" : str(f, "privacy");
  if (value && value.length < 200) return { error: "เนื้อหาสั้นเกินไป — ถ้าต้องการใช้ร่างตั้งต้น ให้ติ๊ก “กลับไปใช้ร่างตั้งต้น”" };
  await db.insert(t.settings).values({ key: PRIVACY_KEY, value }).onConflictDoUpdate({ target: t.settings.key, set: { value, updatedAt: new Date() } });
  refresh();
  return { ok: true };
}
