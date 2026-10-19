// Google Analytics 4 — ฝั่งเบราว์เซอร์
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-QKFK0PXR3J";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag }
}

/** ส่ง event ไป GA (ถ้ายังไม่โหลด script จะเข้าคิวไว้ใน dataLayer แล้วส่งตอนโหลดเสร็จ) */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.gtag = window.gtag || function () { window.dataLayer!.push(arguments); };
  window.gtag("event", event, params);
}

/** แยกช่องทางติดต่อจากลิงก์ */
export function contactMethod(href: string): string | null {
  if (href.startsWith("tel:")) return "phone";
  if (/line\.me|lin\.ee/i.test(href)) return "line";
  if (/google\.[a-z.]+\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl/i.test(href)) return "map";
  if (/facebook\.com|fb\.com|m\.me\//i.test(href)) return "facebook";
  if (/ig\.me|instagram\.com/i.test(href)) return "instagram";
  if (/tiktok\.com/i.test(href)) return "tiktok";
  return null;
}
