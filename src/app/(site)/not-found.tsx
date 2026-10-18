import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-head" style={{ padding: "80px 16px" }}>
      <p className="eyebrow">404</p>
      <h1 className="h2">ไม่พบหน้าที่คุณค้นหา</h1>
      <p className="lead">สินค้านี้อาจถูกย้ายหรือหมดแล้ว ลองดูสินค้าอื่น ๆ หรือทักแอดมินได้เลย</p>
      <p><Link className="more-link" href="/products">ดูสินค้าทั้งหมด →</Link></p>
    </div>
  );
}
