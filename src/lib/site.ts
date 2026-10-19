// ข้อมูลร้านที่ไม่ค่อยเปลี่ยน — ลิงก์โซเชียลและเบอร์โทรแก้ได้ที่หลังบ้าน /admin/settings
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



// รูปบรรยากาศร้าน (public/images/store) — alt ช่วยให้ติด Google Images
export const storePhotosNongKhai = [
  { src: "/images/store/nk-eye-exam.jpg", alt: "ตรวจวัดสายตาด้วยกรอบทดลองเลนส์ ร้านแว่นหนองคาย J.O. Vision Care" },
  { src: "/images/store/nk-auto-refractor.jpg", alt: "เครื่องวัดสายตาอัตโนมัติ แสดงค่าสายตาบนจอ ร้านแว่นหนองคาย" },
  { src: "/images/store/nk-trial-frame.jpg", alt: "ลูกค้าลองเลนส์ระหว่างตรวจวัดสายตาอย่างละเอียด สาขาหนองคาย" },
  { src: "/images/store/nk-store-bags.jpg", alt: "ถุงร้านเจ.โอ.วิชั่นแคร์ และชั้นโชว์แว่นแบรนด์แท้ สาขาหนองคาย" },
];

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
