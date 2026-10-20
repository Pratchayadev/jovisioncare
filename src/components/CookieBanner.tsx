"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_OPEN_EVENT, readConsent, saveConsent, type Consent } from "@/lib/analytics";

/** แบนเนอร์ขอความยินยอมคุกกี้ — แสดงครั้งแรก และเปิดใหม่ได้จาก “ตั้งค่าคุกกี้” ท้ายเว็บ */
type Texts = { text: string; policy: string; deny: string; accept: string };
const TH: Texts = { text: "เราใช้คุกกี้เพื่อวิเคราะห์การใช้งานเว็บ (Google Analytics) ช่วยให้เราปรับปรุงเว็บได้ดีขึ้น ไม่ใช้คุกกี้โฆษณา", policy: "นโยบายความเป็นส่วนตัว", deny: "เฉพาะที่จำเป็น", accept: "ยอมรับ" };

export default function CookieBanner({ t = TH }: { t?: Texts }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!readConsent()) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);
  if (!open) return null;
  const choose = (v: Consent) => { saveConsent(v); setOpen(false); };
  return (
    <div className="cookie" role="region" aria-label="Cookies">
      <p>
        {t.text}{" "}<Link href="/privacy">{t.policy}</Link>
      </p>
      <div className="cookie-btns">
        <button type="button" onClick={() => choose("denied")}>{t.deny}</button>
        <button type="button" className="ok" onClick={() => choose("granted")}>{t.accept}</button>
      </div>
    </div>
  );
}

export function CookieSettingsButton({ label = "ตั้งค่าคุกกี้" }: { label?: string }) {
  return <button type="button" className="linklike" onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}>{label}</button>;
}
