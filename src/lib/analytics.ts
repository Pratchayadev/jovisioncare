// Google Analytics 4 — ฝั่งเบราว์เซอร์
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-QKFK0PXR3J";

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag; __joGa?: boolean }
}

export const isLiveHost = () => typeof location !== "undefined" && /(^|\.)jovisioncare\.com$/.test(location.hostname);

/** ตั้งค่า gtag ครั้งเดียว: consent เริ่มต้น → js → config (ต้องมาก่อน event ใด ๆ) */
export function ensureGtag() {
  if (typeof window === "undefined" || window.__joGa || !GA_ID || !isLiveHost()) return;
  window.__joGa = true;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.gtag = window.gtag || function () { window.dataLayer!.push(arguments); };
  window.gtag("consent", "default", { analytics_storage: readConsent() === "granted" ? "granted" : "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID);
}

/** ส่ง event ไป GA (ถ้ายังไม่โหลด script จะเข้าคิวไว้ใน dataLayer แล้วส่งตอนโหลดเสร็จ) */
export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  ensureGtag();
  if (!window.__joGa) return; // ไม่ใช่โดเมนจริง
  window.gtag!("event", event, params);
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

/* ---------- ความยินยอมคุกกี้ (PDPA + Google Consent Mode v2) ---------- */
export const CONSENT_KEY = "jo_consent";
export const CONSENT_OPEN_EVENT = "jo-consent-open";
export type Consent = "granted" | "denied";

export function readConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === "granted" || v === "denied") return v;
  } catch { /* เบราว์เซอร์ปิด storage */ }
  const m = typeof document !== "undefined" ? document.cookie.match(/(?:^|;\s*)jo_consent=(granted|denied)/) : null;
  return (m?.[1] as Consent) ?? null;
}

export function saveConsent(v: Consent) {
  try { localStorage.setItem(CONSENT_KEY, v); } catch { /* ใช้ cookie แทน */ }
  document.cookie = `${CONSENT_KEY}=${v}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`;
  ensureGtag();
  if (window.gtag) window.gtag("consent", "update", { analytics_storage: v, ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  window.dispatchEvent(new Event("jo-consent-change"));
}
