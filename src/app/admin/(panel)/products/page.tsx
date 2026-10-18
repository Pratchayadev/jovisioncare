import Link from "next/link";
import { and, asc, desc, eq, like, or, type SQL } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { deleteProduct, togglePublished } from "../../actions";

export const dynamic = "force-dynamic";
type SP = Promise<{ q?: string; cat?: string; brand?: string; saved?: string; deleted?: string }>;

export default async function ProductsAdmin({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const conds: (SQL | undefined)[] = [];
  if (sp.q) conds.push(or(like(t.products.name, `%${sp.q}%`), like(t.products.code, `%${sp.q}%`)));
  if (sp.cat) conds.push(eq(t.products.categoryId, Number(sp.cat)));
  if (sp.brand) conds.push(eq(t.products.brandId, Number(sp.brand)));
  const [rows, cats, brands] = await Promise.all([
    db.query.products.findMany({
      where: conds.length ? and(...conds) : undefined,
      with: { brand: true, category: true, images: { orderBy: [asc(t.productImages.sortOrder)], limit: 1 } },
      orderBy: [asc(t.products.sortOrder), desc(t.products.id)],
    }),
    db.query.categories.findMany({ orderBy: [asc(t.categories.sortOrder)] }),
    db.query.brands.findMany({ orderBy: [asc(t.brands.sortOrder)] }),
  ]);
  return (
    <>
      <div className="adm-head">
        <h1>สินค้า</h1><span className="sub">{rows.length} รายการ</span>
        <div className="actions"><Link href="/admin/products/new" className="btn-a primary">+ เพิ่มสินค้า</Link></div>
      </div>
      {sp.saved && <div className="flash ok">บันทึกสินค้าเรียบร้อย</div>}
      {sp.deleted && <div className="flash ok">ลบสินค้าเรียบร้อย</div>}
      <form className="search">
        <input type="search" name="q" defaultValue={sp.q} placeholder="ค้นหาชื่อหรือรหัสสินค้า" style={{ flex: "1 1 220px", width: "auto" }} />
        <select name="cat" defaultValue={sp.cat ?? ""} style={{ width: "auto" }}><option value="">ทุกหมวดหมู่</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select name="brand" defaultValue={sp.brand ?? ""} style={{ width: "auto" }}><option value="">ทุกแบรนด์</option>{brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <button className="btn-a">ค้นหา</button>
      </form>
      <div className="card">
        <table className="tbl">
          <thead><tr><th></th><th>สินค้า</th><th>แบรนด์</th><th>หมวดหมู่</th><th>ราคา</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <td className="c-thumb">{p.images[0] ? <img className="thumb" src={p.images[0].url} alt="" /> : <div className="thumb" />}</td>
                <td><Link href={`/admin/products/${p.id}`} className="name">{p.name}</Link><div className="code">{p.code}</div></td>
                <td>{p.brand?.name ?? "—"}</td>
                <td className="c-hide">{p.category?.name ?? "—"}</td>
                <td className="c-hide">{p.price ? p.price.toLocaleString("th-TH") : "—"}</td>
                <td>
                  <form action={togglePublished}><input type="hidden" name="id" value={p.id} />
                    <button className={"badge " + (p.published ? "on" : "off")} title="กดเพื่อสลับ">{p.published ? "เผยแพร่" : "ซ่อน"}</button>
                  </form>
                </td>
                <td className="c-actions">
                  <div className="row-actions">
                    <Link href={`/products/${p.slug}`} target="_blank" className="btn-a sm">ดู ↗</Link>
                    <Link href={`/admin/products/${p.id}`} className="btn-a sm">แก้ไข</Link>
                    <ConfirmDelete action={deleteProduct} id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>ไม่พบสินค้า</p>}
      </div>
    </>
  );
}
