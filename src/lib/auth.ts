// เซสชันผู้ดูแลแบบ cookie ที่เซ็นด้วย HMAC-SHA256 (ใช้ได้ทั้งใน middleware และ server)
export const SESSION_COOKIE = "jo_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 วัน

const enc = new TextEncoder();

async function hmac(data: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error("SESSION_SECRET ยังไม่ได้ตั้งค่า (ต้องยาวอย่างน้อย 16 ตัวอักษร)");
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSessionToken(username: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${encodeURIComponent(username)}.${exp}`;
  return { token: `${payload}.${await hmac(payload)}`, maxAge: MAX_AGE };
}

export async function verifySessionToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [user, exp, sig] = parts;
  if (Number(exp) < Date.now() / 1000) return null;
  try {
    if (!safeEqual(sig, await hmac(`${user}.${exp}`))) return null;
  } catch {
    return null;
  }
  return decodeURIComponent(user);
}
