import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link href="/" className="logo" aria-label="J.O. Vision Care หน้าแรก">
          <span className="logo-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" width={40} height={40} style={{ position: "static", width: 40, height: 40 }} />
          </span>
          <span className="logo-word">J.O. VISIONCARE</span>
        </Link>
        <nav className="main-nav" aria-label="เมนูหลัก">
          <Link href="/#branches">สาขา</Link>
          <Link href="/#contact" className="cta">ทักแอดมิน</Link>
        </nav>
      </div>
      <nav className="wrap chips" aria-label="หมวด">
        <Link href="/#collection">คอลเลกชัน</Link>
        <Link href="/#lens-lab">ทดลองเลนส์</Link>
        <Link href="/#store">บรรยากาศร้าน</Link>
        <Link href="/#reviews">รีวิวจาก IG</Link>
        <Link href="/#branches">อุดร · หนองคาย</Link>
      </nav>
    </header>
  );
}
