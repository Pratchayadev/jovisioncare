import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { checkService, score } from "@/lib/seo-check";
import { parseFaq } from "@/lib/faq";
import { deleteService, toggleService } from "../../actions";

export const dynamic = "force-dynamic";
const BR: Record<string, string> = { all: "ทั้งสองสาขา", udon: "อุดรธานี", nongkhai: "หนองคาย" };

export default async function ServicesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const rows = await db.query.services.findMany({ orderBy: [asc(t.services.sortOrder), asc(t.services.id)] });
  return (
    <>
      <div className="adm-head">
        <h1>บริการ</h1><span className="sub">{rows.length} รายการ · แสดง {rows.filter((r) => r.published).length}</span>
        <div className="actions"><Link href="/admin/services/new" className="btn-a primary">+ เพิ่มบริการ</Link></div>
      </div>
      {sp.saved && <div className="flash ok">บันทึกบริการเรียบร้อย</div>}
      {sp.deleted && <div className="flash ok">ลบบริการเรียบร้อย</div>}
      <div className="card panel" style={{ marginBottom: 16 }}>
        <p className="hint" style={{ margin: 0 }}>เนื้อหาตั้งต้นเขียนแบบไม่ระบุราคา และไม่อ้างสิ่งที่ร้านยังไม่ยืนยัน — กรุณาอ่านทุกหน้าแล้วแก้ให้ตรงกับการทำงานจริงของร้าน · ปิด “แสดง” บริการที่ร้านไม่มี</p>
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>บริการ</th><th>SEO</th><th className="c-hide">สาขา</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {rows.map((s) => {
              const sc = score(checkService({ title: s.title, summary: s.summary ?? "", content: s.content, hasPage: s.hasPage, faqCount: parseFaq(s.faq).length, metaTitle: s.metaTitle ?? "", metaDescription: s.metaDescription ?? "" }));
              return (
                <tr key={s.id}>
                  <td><Link href={`/admin/services/${s.id}`} className="name">{s.title}</Link><div className="mono-sub">{s.hasPage ? `/services/${s.slug}` : `→ ${s.linkUrl}`}</div></td>
                  <td>{s.hasPage ? <span className={"seo-score " + (sc >= 80 ? "good" : sc >= 50 ? "mid" : "low")}>{sc}</span> : "—"}</td>
                  <td className="c-hide">{BR[s.branches] ?? s.branches}</td>
                  <td>
                    <form action={toggleService}><input type="hidden" name="id" value={s.id} />
                      <button className={"badge " + (s.published ? "on" : "off")} title="กดเพื่อสลับ">{s.published ? "แสดง" : "ซ่อน"}</button>
                    </form>
                  </td>
                  <td className="c-actions"><div className="row-actions"><Link href={`/admin/services/${s.id}`} className="btn-a sm">แก้ไข</Link><ConfirmDelete action={deleteService} id={s.id} /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
