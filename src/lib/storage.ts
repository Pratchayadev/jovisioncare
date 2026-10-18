import "server-only";
import sharp from "sharp";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2Ready = () =>
  !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET && process.env.R2_PUBLIC_URL);

let s3: S3Client | null = null;
function client() {
  s3 ??= new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: !!process.env.R2_ENDPOINT,
    // R2 ไม่ต้องการ checksum เสริมของ SDK รุ่นใหม่ — ส่งเฉพาะเมื่อจำเป็น
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
  });
  return s3;
}

/** รูปที่อัปโหลดเก็บนอก public/ (Next.js ไม่เสิร์ฟไฟล์ที่เพิ่มหลัง build) แล้วเสิร์ฟผ่าน /uploads/[...path] */
export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads"));

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

/** ย่อรูปเป็นด้านยาวสุด 1600px แปลงเป็น WebP แล้วเก็บที่ R2 (ถ้าตั้งค่า) หรือ data/uploads */
export async function saveImage(file: File, folder = "products"): Promise<string> {
  if (!ALLOWED.has(file.type)) throw new Error(`ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ`);
  if (file.size > 15 * 1024 * 1024) throw new Error(`ไฟล์ ${file.name} ใหญ่เกิน 15MB`);
  const input = Buffer.from(await file.arrayBuffer());
  const out = await sharp(input).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const name = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.webp`;
  const key = `${folder}/${name}`;

  if (r2Ready()) {
    await client().send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key, Body: out, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
    return `${process.env.R2_PUBLIC_URL!.replace(/\/$/, "")}/${key}`;
  }
  if (process.env.VERCEL)
    throw new Error("บน Vercel ต้องตั้งค่า Cloudflare R2 ก่อนอัปโหลดรูป (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL)");
  const dir = path.join(UPLOAD_DIR, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), out);
  return `/uploads/${key}`;
}

/** ลบไฟล์ที่ระบบเราอัปโหลดเอง (ไม่แตะรูปตั้งต้นใน /images) */
export async function deleteImage(url: string) {
  try {
    if (url.startsWith("/uploads/")) {
      await unlink(path.join(UPLOAD_DIR, url.slice("/uploads/".length)));
    } else if (r2Ready() && url.startsWith(process.env.R2_PUBLIC_URL!)) {
      const key = url.slice(process.env.R2_PUBLIC_URL!.replace(/\/$/, "").length + 1);
      await client().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }));
    }
  } catch {
    /* ไฟล์อาจถูกลบไปแล้ว */
  }
}
