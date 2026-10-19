// ช่องทางติดต่อของร้าน — ค่าจริงแก้ได้ที่หลังบ้าน /admin/settings
// ไฟล์นี้ใช้ได้ทั้งฝั่ง server และ client (ไม่มีการเรียกฐานข้อมูล)

export type ContactSettings = {
  lineEnabled: boolean; // แสดงปุ่ม LINE บนเว็บหรือไม่
  lineId: string; // เช่น @jovisioncare
  lineUrl: string; // ลิงก์เพิ่มเพื่อน (ไม่บังคับ) เช่น https://lin.ee/xxxx — ว่าง = สร้างจาก LINE ID
  fbUdon: string;
  fbNongkhai: string;
  igHandle: string; // ไม่ต้องมี @
  tiktokHandle: string; // ไม่ต้องมี @
  phone: string; // เช่น 098-424-5224
};

export const SETTING_KEYS: Record<keyof ContactSettings, string> = {
  lineEnabled: "line_enabled",
  lineId: "line_id",
  lineUrl: "line_url",
  fbUdon: "fb_udon",
  fbNongkhai: "fb_nongkhai",
  igHandle: "ig_handle",
  tiktokHandle: "tiktok_handle",
  phone: "phone",
};

export const DEFAULT_CONTACT: ContactSettings = {
  lineEnabled: false,
  lineId: "@jovisioncare",
  lineUrl: "",
  fbUdon: "https://www.facebook.com/profile.php?id=61594085984685",
  fbNongkhai: "https://www.facebook.com/profile.php?id=100063572375151",
  igHandle: "jovisioncare",
  tiktokHandle: "j.o.visioncare",
  phone: "098-424-5224",
};

export type Contact = ContactSettings & {
  line: string | null; // ลิงก์ LINE (null = ซ่อนปุ่ม)
  ig: string;
  igInbox: string;
  tiktok: string;
  phoneIntl: string;
};

const lineIdForUrl = (id: string) => "@" + id.trim().replace(/^@+/, "").toLowerCase();

export function buildContact(s: ContactSettings): Contact {
  const hasLine = s.lineEnabled && !!(s.lineUrl || s.lineId);
  const digits = s.phone.replace(/[^0-9]/g, "");
  return {
    ...s,
    line: hasLine ? s.lineUrl || `https://line.me/R/ti/p/${encodeURIComponent(lineIdForUrl(s.lineId))}` : null,
    ig: `https://www.instagram.com/${s.igHandle}`,
    igInbox: `https://ig.me/m/${s.igHandle}`,
    tiktok: `https://www.tiktok.com/@${s.tiktokHandle}`,
    phoneIntl: digits ? (digits.startsWith("0") ? "+66" + digits.slice(1) : "+" + digits) : "",
  };
}

/** ลิงก์เปิดแชท LINE พร้อมข้อความ (ต้องมี LINE ID) — null ถ้าปิดปุ่ม LINE */
export function lineMessage(c: Contact, text: string): string | null {
  if (!c.line) return null;
  if (!c.lineId) return c.line;
  return `https://line.me/R/oaMessage/${encodeURIComponent(lineIdForUrl(c.lineId))}/?` + encodeURIComponent(text);
}
