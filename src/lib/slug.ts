/** สร้าง slug ที่รองรับทั้งอังกฤษและไทย เช่น "Helen Keller HK-01" → "helen-keller-hk-01" */
export function slugify(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .trim()
    .replace(/[&]/g, " and ")
    .replace(/[^a-z0-9฀-๿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
