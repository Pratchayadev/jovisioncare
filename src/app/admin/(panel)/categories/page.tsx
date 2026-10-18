import Link from "next/link";
import { asc, count, eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { deleteCategory } from "../../actions";

export const dynamic = "force-dynamic";

export default async function CategoriesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const rows = await db
    .select({ id: t.categories.id, name: t.categories.name, slug: t.categories.slug, sortOrder: t.categories.sortOrder, n: count(t.products.id) })
    .from(t.categories)
    .leftJoin(t.products, eq(t.products.categoryId, t.categories.id))
    .groupBy(t.categories.id)
    .orderBy(asc(t.categories.sortOrder), asc(t.categories.name));
  return (
    <>
      <div className="adm-head">
        <h1>หมวดหมู่</h1><span className="sub">{rows.length} รายการ</span>
        <div className="actions"><Link href="/admin/categories/new" className="btn-a primary">+ เพิ่มหมวดหมู่</Link></div>
      </div>
      {sp.saved && <div className="flash ok">บันทึกหมวดหมู่เรียบร้อย</div>}
      {sp.deleted && <div className="flash ok">ลบหมวดหมู่เรียบร้อย (สินค้าที่เคยอยู่ในหมวดหมู่นี้ยังอยู่ครบ)</div>}
      <div className="card">
        <table className="tbl">
          <thead><tr><th>ชื่อ</th><th>Slug</th><th>สินค้า</th><th>ลำดับ</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ gridTemplateColumns: "1fr" }}>
                <td><Link href={`/admin/categories/${r.id}`} className="name">{r.name}</Link></td>
                <td className="code">/category/{r.slug}</td>
                <td>{r.n} สินค้า</td>
                <td className="c-hide">{r.sortOrder}</td>
                <td className="c-actions">
                  <div className="row-actions">
                    <Link href={`/category/${r.slug}`} target="_blank" className="btn-a sm">ดู ↗</Link>
                    <Link href={`/admin/categories/${r.id}`} className="btn-a sm">แก้ไข</Link>
                    <ConfirmDelete action={deleteCategory} id={r.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>ยังไม่มีหมวดหมู่</p>}
      </div>
    </>
  );
}
