import "server-only";
import { cache } from "react";
import { db, t } from "./db";
import { buildContact, DEFAULT_CONTACT, SETTING_KEYS, type ContactSettings } from "./contact";
import { BRANCH_IDS, buildBranch, DEFAULT_BRANCHES, type BranchId, type BranchSettings } from "./branches";

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

export const branchKey = (id: BranchId) => `branch_${id}`;

/** ข้อมูลสาขาที่ตั้งไว้ในหลังบ้าน (ช่องที่ยังไม่เคยตั้งใช้ค่าเริ่มต้น) */
export const getBranchSettings = cache(async (): Promise<Record<BranchId, BranchSettings>> => {
  const rows = await db.select().from(t.settings);
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const out = {} as Record<BranchId, BranchSettings>;
  for (const id of BRANCH_IDS) {
    let saved: Partial<BranchSettings> = {};
    try { saved = JSON.parse(map.get(branchKey(id)) || "{}"); } catch {}
    out[id] = { ...DEFAULT_BRANCHES[id], ...saved };
  }
  return out;
});

export const getBranches = cache(async () => {
  const s = await getBranchSettings();
  return BRANCH_IDS.map((id) => buildBranch(id, s[id]));
});
