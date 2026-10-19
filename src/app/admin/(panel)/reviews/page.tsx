import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { deleteReview, toggleReview } from "../../actions";

export const dynamic = "force-dynamic";

export default async function ReviewsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const rows = await db.query.reviews.findMany({ orderBy: [asc(t.reviews.sortOrder), desc(t.reviews.id)] });
  const live = rows.filter((r) => r.published).length;
  return (
    <>
      <div className="adm-head">
        <h1>รีวิว IG</h1><span className="sub">{rows.length} รายการ · แสดงบนเว็บ {live}</span>
        <div className="actions"><Link href="/admin/reviews/new" className="btn-a primary">+ เพิ่มรีวิว</Link></div>
      </div>
      {sp.saved && <div className="flash ok">บันทึกรีวิวเรียบร้อย</div>}
      {sp.deleted && <div className="flash ok">ลบรีวิวเรียบร้อย</div>}
      {!live && <div className="flash" style={{ background: "#efede9" }}>ส่วน “ลูกค้าตัวจริง แท็กเราบน IG” จะซ่อนอยู่บนหน้าเว็บจนกว่าจะมีรีวิวที่แสดงอย่างน้อย 1 รายการ</div>}
      <div className="card">
        <table className="tbl">
          <thead><tr><th></th><th>ลูกค้า</th><th>แบรนด์</th><th>สาขา</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <td className="c-thumb"><img className="thumb" src={r.image} alt="" /></td>
                <td><Link href={`/admin/reviews/${r.id}`} className="name">@{r.handle}</Link></td>
                <td>{r.brand ?? "—"}</td>
                <td className="c-hide">{r.branch ?? "—"}</td>
                <td>
                  <form action={toggleReview}><input type="hidden" name="id" value={r.id} />
                    <button className={"badge " + (r.published ? "on" : "off")} title="กดเพื่อสลับ">{r.published ? "แสดง" : "ซ่อน"}</button>
                  </form>
                </td>
                <td className="c-actions">
                  <div className="row-actions">
                    <Link href={`/admin/reviews/${r.id}`} className="btn-a sm">แก้ไข</Link>
                    <ConfirmDelete action={deleteReview} id={r.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>ยังไม่มีรีวิว — กด “เพิ่มรีวิว” แล้วใส่รูปจากโพสต์ที่ลูกค้าแท็กร้าน</p>}
      </div>
    </>
  );
}
