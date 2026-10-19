import "server-only";
import { cache } from "react";
import { db, t } from "./db";
import { buildContact, DEFAULT_CONTACT, SETTING_KEYS, type ContactSettings } from "./contact";

/** อ่านค่าตั้งค่าร้านจากฐานข้อมูล (ค่าที่ยังไม่เคยตั้งจะใช้ค่าเริ่มต้น) */
export const getContactSettings = cache(async (): Promise<ContactSettings> => {
  const rows = await db.select().from(t.settings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const out = { ...DEFAULT_CONTACT } as Record<string, unknown>;
  for (const [field, key] of Object.entries(SETTING_KEYS)) {
    if (!map.has(key)) continue;
    const v = map.get(key)!;
    out[field] = typeof DEFAULT_CONTACT[field as keyof ContactSettings] === "boolean" ? v === "1" : v;
  }
  return out as ContactSettings;
});

export const getContact = cache(async () => buildContact(await getContactSettings()));
