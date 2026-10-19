import { desc } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import RedirectForm from "@/components/admin/RedirectForm";
import { deleteRedirect } from "../../actions";

export const dynamic = "force-dynamic";

export default async function RedirectsAdmin() {
  const rows = await db.query.redirects.findMany({ orderBy: [desc(t.redirects.createdAt)] });
  return (
    <>
      <div className="adm-head"><h1>Redirect (301)</h1><span className="sub">{rows.length} รายการ</span></div>
      <div className="card panel" style={{ marginBottom: 16 }}>
        <p className="hint" style={{ margin: 0 }}>
          เมื่อเปลี่ยน slug หรือลบสินค้า หมวดหมู่ แบรนด์ บทความ ระบบจะเพิ่มรายการที่นี่ให้อัตโนมัติ คนที่เข้าลิงก์เก่า (จาก Google หรือที่เคยแชร์ไว้) จะถูกพาไปหน้าใหม่ อันดับใน Google ก็ย้ายตามไปด้วย
          — เพิ่มเองได้ เช่น ลิงก์จากเว็บเก่าของร้าน
        </p>
        <RedirectForm />
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>URL เก่า</th><th>ไปที่</th><th className="c-hide">ถูกใช้</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.fromPath}>
                <td className="mono-cell">{r.fromPath}</td>
                <td className="mono-cell"><a href={r.toPath} target="_blank" rel="noopener">{r.toPath}</a></td>
                <td className="c-hide">{r.hits.toLocaleString()} ครั้ง</td>
                <td className="c-actions"><ConfirmDelete action={deleteRedirect} id={r.fromPath} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>ยังไม่มี redirect</p>}
      </div>
    </>
  );
}
