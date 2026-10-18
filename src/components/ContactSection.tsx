import Link from "next/link";
import { links, paymentCards } from "@/lib/site";
import type { Brand, Category } from "@/db/schema";

export default function ContactSection({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  return (
    <section id="contact" className="contact dark" aria-labelledby="contact-title">
      <div className="wrap">
        <div data-reveal="" style={{ display: "grid", gap: 10 }}>
          <p className="eyebrow">06 — CONTACT</p>
          <h2 id="contact-title" className="contact-title">TALK TO US.</h2>
          <p className="lead" style={{ maxWidth: 520 }}>สั่งซื้อ สอบถามราคา หรือนัดตรวจวัดสายตา ทักแอดมินได้ทุกช่องทาง ตอบไวทุกวัน</p>
        </div>
        <div className="grid-contact">
          <a className="ccard" href={links.line} target="_blank" rel="noopener"><b>LINE OA</b><span>@jovisioncare</span></a>
          <a className="ccard" href={links.fbUdon} target="_blank" rel="noopener"><b>MESSENGER</b><span>เพจสาขาอุดรธานี</span></a>
          <a className="ccard" href={links.fbNongkhai} target="_blank" rel="noopener"><b>MESSENGER</b><span>เพจสาขาหนองคาย</span></a>
          <a className="ccard red" href={links.igInbox} target="_blank" rel="noopener"><b>IG INBOX</b><span>@jovisioncare</span></a>
          <a className="ccard" href={links.tiktok} target="_blank" rel="noopener"><b>TIKTOK</b><span>@jovisioncare</span></a>
        </div>
        <footer className="site-footer">
          <nav aria-label="หมวดสินค้า">
            <Link href="/products">สินค้าทั้งหมด</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.slug}`}>{c.name}</Link>
            ))}
          </nav>
          <nav aria-label="แบรนด์">
            {brands.map((b) => (
              <Link key={b.id} href={`/brand/${b.slug}`}>{b.name}</Link>
            ))}
          </nav>
          <div style={{ display: "grid", gap: 10 }}>
            <p className="mono" style={{ fontSize: 11, letterSpacing: ".12em" }}>รับชำระด้วย</p>
            <div className="pay">{paymentCards.map((c) => <span key={c} title={c}>{c}</span>)}</div>
          </div>
          <p>J.O. Vision Care ร้านแว่นอุดร และร้านแว่นหนองคาย บริการตรวจวัดสายตา ตัดแว่นสายตาสั้น ยาว เอียง เลนส์กรองแสงสีฟ้า เลนส์ออโต้ปรับแสง เลนส์โปรเกรสซีฟ และแว่นกันแดดแบรนด์แท้</p>
          <p className="mono" style={{ fontSize: 11, letterSpacing: ".08em" }}>© {new Date().getFullYear()} J.O. VISIONCARE</p>
        </footer>
      </div>
    </section>
  );
}
