// ค่าเชื่อมต่อฐานข้อมูล — รองรับทั้งชื่อของเราเองและชื่อที่ Vercel Marketplace (Turso) ตั้งให้อัตโนมัติ
export const isVercel = !!process.env.VERCEL;

export const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./data/jovisioncare.db";
export const dbAuthToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;
export const isLocalFileDb = dbUrl.startsWith("file:");

if (isVercel && isLocalFileDb) {
  throw new Error(
    "บน Vercel ต้องใช้ฐานข้อมูล Turso — ตั้ง TURSO_DATABASE_URL และ TURSO_AUTH_TOKEN (หรือ DATABASE_URL / DATABASE_AUTH_TOKEN) ใน Project Settings → Environment Variables",
  );
}
