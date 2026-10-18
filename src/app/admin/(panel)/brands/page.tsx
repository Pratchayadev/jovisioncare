import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { deleteBrand } from "../../actions";

export const dynamic = "force-dynamic";

export default async function BrandsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const rows = await db
    .select({ id: t.brands.id, name: t.brands.name, slug: t.brands.slug, sortOrder: t.brands.sortOrder, n: count(t.products.id) })
    .from(t.brands)
    .leftJoin(t.products, eq(t.products.brandId, t.brands.id))
    .groupBy(t.brands.id)
    .orderBy(asc(t.brands.sortOrder), asc(t.brands.name));
  return (
    <>
      <div className="adm-head">
        <h1>แบรนด์</h1><span className="sub">{rows.length} รายการ</span>
        <div className="actions"><Link href="/admin/brands/new" className="btn-a primary">+ เพิ่มแบรนด์</Link></div>
      </div>
      {sp.saved && <div className="flash ok">บันทึกแบรนด์เรียบร้อย</div>}
      {sp.deleted && <div className="flash ok">ลบแบรนด์เรียบร้อย (สินค้าที่เคยอยู่ในแบรนด์นี้ยังอยู่ครบ)</div>}
      <div className="card">
        <table className="tbl">
          <thead><tr><th>ชื่อ</th><th>Slug</th><th>สินค้า</th><th>ลำดับ</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ gridTemplateColumns: "1fr" }}>
                <td><Link href={`/admin/brands/${r.id}`} className="name">{r.name}</Link></td>
                <td className="code">/brand/{r.slug}</td>
                <td>{r.n} สินค้า</td>
                <td className="c-hide">{r.sortOrder}</td>
                <td className="c-actions">
                  <div className="row-actions">
                    <Link href={`/brand/${r.slug}`} target="_blank" className="btn-a sm">ดู ↗</Link>
                    <Link href={`/admin/brands/${r.id}`} className="btn-a sm">แก้ไข</Link>
                    <ConfirmDelete action={deleteBrand} id={r.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>ยังไม่มีแบรนด์</p>}
      </div>
    </>
  );
}
