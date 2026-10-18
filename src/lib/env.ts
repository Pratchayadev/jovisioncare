// ค่าเชื่อมต่อฐานข้อมูล — รองรับ DATABASE_URL, TURSO_DATABASE_URL
// และชื่อที่ Vercel Marketplace ใส่คำนำหน้าให้ เช่น jovisioncare_TURSO_DATABASE_URL
export const isVercel = !!process.env.VERCEL;

function findEnv(...suffixes: string[]): string | undefined {
  for (const s of suffixes) if (process.env[s]) return process.env[s];
  for (const s of suffixes) {
    const key = Object.keys(process.env).find((k) => k.toUpperCase().endsWith("_" + s) && process.env[k]);
    if (key) return process.env[key];
  }
  return undefined;
}

export const dbUrl = findEnv("DATABASE_URL", "TURSO_DATABASE_URL") || "file:./data/jovisioncare.db";
export const dbAuthToken = findEnv("DATABASE_AUTH_TOKEN", "TURSO_AUTH_TOKEN");
export const isLocalFileDb = dbUrl.startsWith("file:");

if (isVercel && isLocalFileDb) {
  throw new Error(
    "บน Vercel ต้องใช้ฐานข้อมูล Turso — ตั้ง TURSO_DATABASE_URL และ TURSO_AUTH_TOKEN (หรือ DATABASE_URL / DATABASE_AUTH_TOKEN) ใน Project Settings → Environment Variables",
  );
}
