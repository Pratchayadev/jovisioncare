import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { deletePromotion, togglePromotion } from "../../actions";

export const dynamic = "force-dynamic";
const BR: Record<string, string> = { all: "ทั้งสองสาขา", udon: "อุดรธานี", nongkhai: "หนองคาย" };

export default async function PromotionsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const rows = await db.query.promotions.findMany({ orderBy: [asc(t.promotions.sortOrder), desc(t.promotions.id)] });
  const now = Date.now();
  return (
    <>
      <div className="adm-head">
        <h1>โปรโมชัน</h1><span className="sub">{rows.length} รายการ</span>
        <div className="actions"><Link href="/admin/promotions/new" className="btn-a primary">+ เพิ่มโปรโมชัน</Link></div>
      </div>
      {sp.saved && <div className="flash ok">บันทึกโปรโมชันเรียบร้อย</div>}
      {sp.deleted && <div className="flash ok">ลบโปรโมชันเรียบร้อย</div>}
      <div className="card panel" style={{ marginBottom: 16 }}><p className="hint" style={{ margin: 0 }}>แสดงที่หน้า <a href="/category/promotion" target="_blank" style={{ textDecoration: "underline" }}>/category/promotion</a> หน้าสาขา และแถบหน้าแรก (เลือกได้ 1 โปร) · ใส่วันหมดเขตแล้วระบบซ่อนให้เอง</p></div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th></th><th>โปรโมชัน</th><th className="c-hide">สาขา</th><th className="c-hide">หมดเขต</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {rows.map((p) => {
              const expired = !!p.endsAt && p.endsAt.getTime() < now;
              return (
                <tr key={p.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <td className="c-thumb">{p.image ? <img className="thumb" src={p.image} alt="" /> : <div className="thumb" />}</td>
                  <td><Link href={`/admin/promotions/${p.id}`} className="name">{p.title}</Link>{p.featured && <div className="mono-sub">★ แถบหน้าแรก</div>}</td>
                  <td className="c-hide">{BR[p.branches]}</td>
                  <td className="c-hide">{p.endsAt ? p.endsAt.toLocaleDateString("th-TH", { timeZone: "Asia/Bangkok" }) : "ไม่มีกำหนด"}{expired && <div style={{ color: "var(--red)", fontSize: 12 }}>หมดอายุแล้ว</div>}</td>
                  <td>
                    <form action={togglePromotion}><input type="hidden" name="id" value={p.id} />
                      <button className={"badge " + (p.published && !expired ? "on" : "off")} title="กดเพื่อสลับ">{!p.published ? "ซ่อน" : expired ? "หมดอายุ" : "แสดง"}</button>
                    </form>
                  </td>
                  <td className="c-actions"><div className="row-actions"><Link href={`/admin/promotions/${p.id}`} className="btn-a sm">แก้ไข</Link><ConfirmDelete action={deletePromotion} id={p.id} /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && <p style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>ยังไม่มีโปรโมชัน</p>}
      </div>
    </>
  );
}
