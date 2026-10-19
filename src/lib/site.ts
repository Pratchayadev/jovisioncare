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
  // LINE OA: ใส่ลิงก์เมื่อพร้อม (เช่น "https://line.me/R/ti/p/@jovisioncare") — ถ้าเว้นว่าง ปุ่ม LINE ทุกจุดจะถูกซ่อน
  line: "",
  lineOaId: "@jovisioncare",
  fbUdon: "https://www.facebook.com/profile.php?id=61594085984685",
  fbNongkhai: "https://www.facebook.com/profile.php?id=100063572375151",
  igInbox: "https://ig.me/m/jovisioncare",
  ig: "https://www.instagram.com/jovisioncare",
  tiktok: "https://www.tiktok.com/@j.o.visioncare",
  tiktokHandle: "@j.o.visioncare",
};

/** ลิงก์เปิดแชท LINE OA พร้อมข้อความ — คืน null ถ้ายังไม่ได้ตั้งลิงก์ LINE */
export const lineMessage = (text: string) =>
  links.line ? `https://line.me/R/oaMessage/${links.lineOaId}/?` + encodeURIComponent(text) : null;

// เวลาเปิด–ปิด (ใช้ทั้งบนหน้าเว็บและข้อมูลสำหรับ Google)
// เบอร์โทร (ใช้ร่วมกันทั้ง 2 สาขา)
export const PHONE = "098-424-5224";
export const PHONE_INTL = "+66984245224";
const OPEN = "10:00";
const CLOSE = "20:00";
const navUrl = (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export const branches = [
  {
    en: "UDON THANI",
    h: "ร้านแว่นอุดร — สาขาอุดรธานี",
    place: "เจริญศรีปาร์ค หนองประจักษ์",
    locality: "อุดรธานี",
    postalCode: "41000",
    addr: "เจริญศรีปาร์ค หนองประจักษ์ อ.เมืองอุดรธานี จ.อุดรธานี 41000",
    lat: 17.418690,
    lng: 102.785187,
    opens: OPEN,
    closes: CLOSE,
    hours: `${OPEN}–${CLOSE} น.`,
    tel: PHONE,
    map: navUrl(17.41869, 102.785187),
    fb: links.fbUdon,
  },
  {
    en: "NONG KHAI",
    h: "ร้านแว่นหนองคาย — สาขาหนองคาย",
    place: "ห้างสรรพสินค้าอัศวรรณ ช้อปปิ้ง 1 (โลตัส)",
    locality: "หนองคาย",
    postalCode: "43000",
    addr: "ห้างสรรพสินค้าอัศวรรณ ช้อปปิ้ง 1 (โลตัส) อ.เมืองหนองคาย จ.หนองคาย 43000",
    lat: 17.871762,
    lng: 102.742839,
    opens: OPEN,
    closes: CLOSE,
    hours: `${OPEN}–${CLOSE} น.`,
    tel: PHONE,
    map: navUrl(17.871762, 102.742839),
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

// รูปบรรยากาศร้าน (public/images/store) — alt ช่วยให้ติด Google Images
export const storePhotos = [
  { src: "/images/store/interior-eye-test.jpg", alt: "มุมตรวจวัดสายตาและโต๊ะลองกรอบแว่น ภายในร้าน J.O. Vision Care" },
  { src: "/images/store/entrance.jpg", alt: "ทางเข้าร้านแว่น J.O. Vision Care โทนขาวสว่าง พร้อมโต๊ะโชว์กรอบแว่น" },
  { src: "/images/store/display-table.jpg", alt: "โต๊ะโชว์กรอบแว่นสายตาและชั้นวางแว่นแบรนด์แท้ ร้านแว่นอุดร" },
  { src: "/images/store/selfie-mirror.jpg", alt: "กระจก Today's Selfie is Tomorrow's Biometric Profile และชั้นโชว์แว่น" },
  { src: "/images/store/instagram-mirror.jpg", alt: "กระจกถ่ายรูปกรอบ Instagram และชั้นวางแว่น J.O. Vision Care" },
  { src: "/images/store/red-chair-corner.jpg", alt: "มุมเก้าอี้สีแดงและชั้นวางแว่นตา ภายในร้าน" },
  { src: "/images/store/welcome.jpg", alt: "พื้นหน้าร้าน It's nice to have you here และพรมต้อนรับ" },
];

export const paymentCards = ["VISA", "MASTERCARD", "JCB", "UNIONPAY", "PROMPTPAY"];

export const defaultProductDesc =
  "กรอบแบรนด์แท้ พร้อมบริการตรวจวัดสายตาและประกอบเลนส์ตามค่าสายตาของคุณ สอบถามสี ขนาด และราคาได้กับแอดมิน";

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return SITE_URL + (path.startsWith("/") ? path : "/" + path);
}
