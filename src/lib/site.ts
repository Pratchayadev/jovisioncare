// ข้อมูลร้านที่ไม่ค่อยเปลี่ยน — แก้ที่ไฟล์นี้ได้เลย
// บน Vercel ถ้ายังไม่ตั้ง SITE_URL จะใช้โดเมน production ของโปรเจกต์ให้อัตโนมัติ
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
export const SITE_URL = (process.env.SITE_URL || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000")).replace(/\/$/, "");

export const site = {
  name: "J.O. Vision Care",
  title: "ร้านแว่นอุดร หนองคาย | J.O. Vision Care ตรวจวัดสายตา ตัดแว่น",
  description:
    "J.O. Vision Care ร้านแว่นตาอุดรธานีและหนองคาย ตรวจวัดสายตาละเอียด ตัดแว่น เลนส์กรองแสงสีฟ้า เลนส์ออโต้ แว่นกันแดดแบรนด์แท้ Bolon Helen Keller ทักแอดมินได้ทาง LINE, Facebook, IG",
  ogTitle: "J.O. Vision Care — ร้านแว่นอุดร · ร้านแว่นหนองคาย",
  ogDescription: "ตรวจวัดสายตา ตัดแว่น เลนส์คุณภาพ กรอบแบรนด์แท้ 2 สาขา อุดรธานี และหนองคาย",
  ogImage: "/images/store.jpg",
  promo: { label: "กรอบแว่นพร้อมเลนส์กรองแสงสีฟ้า ราคาเดียว", price: "1,700 บาท" },
};

export const links = {
  line: "https://line.me/R/ti/p/@jovisioncare",
  lineOaId: "@jovisioncare",
  fbUdon: "https://www.facebook.com/profile.php?id=61594085984685",
  fbNongkhai: "https://www.facebook.com/profile.php?id=100063572375151",
  igInbox: "https://ig.me/m/jovisioncare",
  ig: "https://www.instagram.com/jovisioncare",
  tiktok: "https://www.tiktok.com/@jovisioncare",
};

export const lineMessage = (text: string) =>
  `https://line.me/R/oaMessage/${links.lineOaId}/?` + encodeURIComponent(text);

export const branches = [
  {
    en: "UDON THANI",
    h: "ร้านแว่นอุดร — สาขาอุดรธานี",
    locality: "อุดรธานี",
    addr: "[ใส่ที่อยู่สาขาอุดรธานี]",
    hours: "[เวลาเปิด–ปิด]",
    tel: "[เบอร์โทร]",
    map: "https://www.google.com/maps/search/J.O.+Vision+Care+อุดรธานี",
    fb: links.fbUdon,
  },
  {
    en: "NONG KHAI",
    h: "ร้านแว่นหนองคาย — สาขาหนองคาย",
    locality: "หนองคาย",
    addr: "[ใส่ที่อยู่สาขาหนองคาย]",
    hours: "[เวลาเปิด–ปิด]",
    tel: "[เบอร์โทร]",
    map: "https://www.google.com/maps/search/J.O.+Vision+Care+หนองคาย",
    fb: links.fbNongkhai,
  },
];

export const reviews = [
  ["@barayb", "Bolon", "อุดรธานี"],
  ["@aaeyea", "Clrotte", "อุดรธานี"],
  ["@plugsw", "S7&ILUVU", "หนองคาย"],
  ["@siminapa_", "Helen Keller", "หนองคาย"],
  ["@customer05", "Bolon", "อุดรธานี"],
  ["@customer06", "AIRA", "หนองคาย"],
  ["@customer07", "Helen Keller", "อุดรธานี"],
  ["@customer08", "Clrotte", "หนองคาย"],
].map(([handle, brand, branch]) => ({ handle, brand, branch }));

export const storeShots = ["โซนตรวจวัดสายตา", "ชั้นโชว์แว่นกันแดด", "หน้าร้าน สาขาหนองคาย", "ทีมงาน / ช่างตัดแว่น"];

export const paymentCards = ["VISA", "MASTERCARD", "JCB", "UNIONPAY", "PROMPTPAY"];

export const defaultProductDesc =
  "กรอบแบรนด์แท้ พร้อมบริการตรวจวัดสายตาและประกอบเลนส์ตามค่าสายตาของคุณ สอบถามสี ขนาด และราคาได้กับแอดมิน";

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}
