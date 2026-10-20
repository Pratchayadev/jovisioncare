// ข้อมูลสาขา — ค่าจริงแก้ได้ที่หลังบ้าน /admin/settings (ส่วน "สาขา")
// ใช้ได้ทั้ง server และ client

export const BRANCH_IDS = ["udon", "nongkhai"] as const;
export type BranchId = (typeof BRANCH_IDS)[number];

export const DAYS = [
  ["Monday", "จ."], ["Tuesday", "อ."], ["Wednesday", "พ."], ["Thursday", "พฤ."],
  ["Friday", "ศ."], ["Saturday", "ส."], ["Sunday", "อา."],
] as const;
export type Day = (typeof DAYS)[number][0];

/** ส่วนที่แก้ได้ในหลังบ้าน */
export type BranchSettings = {
  place: string; // ชื่อสถานที่สั้น ๆ ใช้เป็นหัวข้อ เช่น "เจริญศรีปาร์ค ริมหนองประจักษ์"
  line1: string; // ห้อง/อาคาร/โครงการ/ถนน/ซอย/จุดสังเกต
  subdistrict: string; // ตำบล (ไม่บังคับ)
  district: string; // อำเภอ
  province: string; // จังหวัด
  postalCode: string;
  lat: number;
  lng: number;
  opens: string; // "10:00"
  closes: string; // "20:00"
  days: Day[];
  directions: string; // การเดินทาง/จุดสังเกต — 1 บรรทัดต่อ 1 ข้อ
  parking: string; // ที่จอดรถ
};

/** ส่วนที่คงที่ (ผูกกับดีไซน์และ SEO) */
const STATIC = {
  udon: { id: "udon" as const, path: "/udon-thani", en: "UDON THANI", h: "ร้านแว่นอุดร — สาขาอุดรธานี", short: "อุดร", fbKey: "fbUdon" as const },
  nongkhai: { id: "nongkhai" as const, path: "/nong-khai", en: "NONG KHAI", h: "ร้านแว่นหนองคาย — สาขาหนองคาย", short: "หนองคาย", fbKey: "fbNongkhai" as const },
};

const ALL_DAYS = DAYS.map(([d]) => d) as Day[];

export const DEFAULT_BRANCHES: Record<BranchId, BranchSettings> = {
  udon: {
    place: "เจริญศรีปาร์ค ริมหนองประจักษ์",
    line1: "ห้อง B04 โครงการเจริญศรีปาร์ค ริมหนองประจักษ์ ถนนบ้านโนน ซอย 1",
    subdistrict: "",
    district: "เมืองอุดรธานี",
    province: "อุดรธานี",
    postalCode: "41000",
    lat: 17.41869,
    lng: 102.785187,
    opens: "10:00",
    closes: "20:00",
    days: ALL_DAYS,
    directions: "",
    parking: "",
  },
  nongkhai: {
    place: "ห้างอัศวรรณ 1 (ฝั่งโลตัส)",
    line1: "ห้างอัศวรรณ 1 (ฝั่งโลตัส) ข้าง KFC โพธิ์ชัย",
    subdistrict: "มีชัย",
    district: "เมืองหนองคาย",
    province: "หนองคาย",
    postalCode: "43000",
    lat: 17.871762,
    lng: 102.742839,
    opens: "10:00",
    closes: "20:30",
    days: ALL_DAYS,
    directions: "",
    parking: "",
  },
};

export type Branch = BranchSettings & (typeof STATIC)[BranchId] & {
  addr: string;
  hours: string;
  daysLabel: string;
  map: string; // ลิงก์นำทาง
  mapView: string; // ลิงก์ดูหมุด
};

export function daysLabel(days: Day[]): string {
  if (days.length === 7) return "เปิดทุกวัน";
  const idx = DAYS.map(([d]) => days.includes(d));
  // ช่วงต่อเนื่อง เช่น จ.–ส.
  const runs: string[] = [];
  for (let i = 0; i < 7; i++) {
    if (!idx[i]) continue;
    let j = i;
    while (j + 1 < 7 && idx[j + 1]) j++;
    runs.push(j - i >= 2 ? `${DAYS[i][1]}–${DAYS[j][1]}` : DAYS.slice(i, j + 1).map((d) => d[1]).join(" "));
    i = j;
  }
  return runs.join(", ");
}

export function buildBranch(id: BranchId, s: BranchSettings): Branch {
  const addr = [s.line1, s.subdistrict && `ต.${s.subdistrict}`, s.district && `อ.${s.district}`, s.province && `จ.${s.province}`, s.postalCode]
    .filter(Boolean)
    .join(" ");
  return {
    ...STATIC[id],
    ...s,
    addr,
    daysLabel: daysLabel(s.days),
    hours: `${s.opens}–${s.closes} น.`,
    map: `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`,
    mapView: `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`,
  };
}

/** ดึงพิกัดจากข้อความ: "17.41, 102.78" หรือลิงก์ Google Maps (@lat,lng / q= / destination= / query=) */
export function parseLatLng(input: string): { lat: number; lng: number } | null {
  const s = decodeURIComponent(input.trim());
  const m =
    s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
    s.match(/[?&](?:q|query|destination|ll|where1)=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/) ||
    s.match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1]), lng = Number(m[2]);
  if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) return null;
  return { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 };
}
