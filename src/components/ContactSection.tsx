import Link from "next/link";
import { CookieSettingsButton } from "./CookieBanner";
import { paymentCards } from "@/lib/site";
import type { Contact } from "@/lib/contact";
import type { Brand, Category } from "@/db/schema";

export default function ContactSection({ categories, brands, c }: { categories: Category[]; brands: Brand[]; c: Contact }) {
  return (
    <section id="contact" className="contact dark" aria-labelledby="contact-title">
      <div className="wrap">
        <div data-reveal="" style={{ display: "grid", gap: 10 }}>
          <p className="eyebrow">06 — CONTACT</p>
          <h2 id="contact-title" className="contact-title">TALK TO US.</h2>
          <p className="lead" style={{ maxWidth: 520 }}>สั่งซื้อ สอบถามราคา หรือนัดตรวจวัดสายตา ทักแอดมินได้ทุกช่องทาง ตอบไวทุกวัน</p>
        </div>
        <div className="grid-contact" data-track-area="contact">
          {c.line && <a className="ccard" href={c.line} target="_blank" rel="noopener"><b>LINE OA</b><span>{c.lineId || "เพิ่มเพื่อน"}</span></a>}
          <a className="ccard" href={c.fbUdon} target="_blank" rel="noopener"><b>MESSENGER</b><span>เพจสาขาอุดรธานี</span></a>
          <a className="ccard" href={c.fbNongkhai} target="_blank" rel="noopener"><b>MESSENGER</b><span>เพจสาขาหนองคาย</span></a>
          <a className="ccard red" href={c.igInbox} target="_blank" rel="noopener"><b>IG INBOX</b><span>@{c.igHandle}</span></a>
          {c.phone && <a className="ccard" href={`tel:${c.phoneIntl}`}><b>โทร</b><span>{c.phone} · ทั้ง 2 สาขา</span></a>}
          <a className="ccard" href={c.tiktok} target="_blank" rel="noopener"><b>TIKTOK</b><span>@{c.tiktokHandle}</span></a>
        </div>
        <footer className="site-footer">
          <nav aria-label="หมวดสินค้า">
            <Link href="/udon-thani">ร้านแว่นอุดร</Link>
            <Link href="/nong-khai">ร้านแว่นหนองคาย</Link>
            <Link href="/products">สินค้าทั้งหมด</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`}>{c.name}</Link>
            ))}
          </nav>
          <nav aria-label="แบรนด์">
            <Link href="/brands">แบรนด์ทั้งหมด</Link>
            {brands.map((b) => (
              <Link key={b.id} href={`/brand/${b.slug}`}>{b.name}</Link>
            ))}
          </nav>
          <div style={{ display: "grid", gap: 10 }}>
            <p className="mono" style={{ fontSize: 11, letterSpacing: ".12em" }}>รับชำระด้วย</p>
            <div className="pay">{paymentCards.map((c) => <span key={c} title={c}>{c}</span>)}</div>
          </div>
          <p>J.O. Vision Care ร้านแว่นอุดร และร้านแว่นหนองคาย บริการตรวจวัดสายตา ตัดแว่นสายตาสั้น ยาว เอียง เลนส์กรองแสงสีฟ้า เลนส์ออโต้ปรับแสง เลนส์โปรเกรสซีฟ และแว่นกันแดดแบรนด์แท้</p>
          <nav aria-label="นโยบาย">
            <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
            <CookieSettingsButton />
          </nav>
          <p className="mono" style={{ fontSize: 11, letterSpacing: ".08em" }}>© {new Date().getFullYear()} J.O. VISIONCARE</p>
        </footer>
      </div>
    </section>
  );
}
