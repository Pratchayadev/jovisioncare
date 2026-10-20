"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_OPEN_EVENT, readConsent, saveConsent, type Consent } from "@/lib/analytics";

/** แบนเนอร์ขอความยินยอมคุกกี้ — แสดงครั้งแรก และเปิดใหม่ได้จาก “ตั้งค่าคุกกี้” ท้ายเว็บ */
export default function CookieBanner() {
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
    <div className="cookie" role="region" aria-label="การตั้งค่าคุกกี้">
      <p>
        เราใช้คุกกี้เพื่อวิเคราะห์การใช้งานเว็บ (Google Analytics) ช่วยให้เราปรับปรุงเว็บได้ดีขึ้น ไม่ใช้คุกกี้โฆษณา
        {" "}<Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
      </p>
      <div className="cookie-btns">
        <button type="button" onClick={() => choose("denied")}>เฉพาะที่จำเป็น</button>
        <button type="button" className="ok" onClick={() => choose("granted")}>ยอมรับ</button>
      </div>
    </div>
  );
}

export function CookieSettingsButton() {
  return <button type="button" className="linklike" onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}>ตั้งค่าคุกกี้</button>;
}
