import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { checkArticle, score } from "@/lib/seo-check";
import { parseFaq } from "@/lib/faq";
import { deleteArticle, toggleArticle } from "../../actions";

export const dynamic = "force-dynamic";

export default async function ArticlesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const sp = await searchParams;
  const rows = await db.query.articles.findMany({ orderBy: [desc(t.articles.updatedAt)] });
  return (
    <>
      <div className="adm-head">
        <h1>บทความ</h1><span className="sub">{rows.length} บทความ · เผยแพร่ {rows.filter((r) => r.published).length}</span>
        <div className="actions"><Link href="/admin/articles/new" className="btn-a primary">+ เขียนบทความ</Link></div>
      </div>
      {sp.saved && <div className="flash ok">บันทึกบทความเรียบร้อย</div>}
      {sp.deleted && <div className="flash ok">ลบบทความเรียบร้อย</div>}
      <div className="card">
        <table className="tbl">
          <thead><tr><th>ชื่อบทความ</th><th>SEO</th><th>สถานะ</th><th className="c-hide">แก้ไขล่าสุด</th><th></th></tr></thead>
          <tbody>
            {rows.map((a) => {
              const sc = score(checkArticle({ title: a.title, excerpt: a.excerpt ?? "", content: a.content, cover: !!a.cover, coverAlt: a.coverAlt ?? "", metaTitle: a.metaTitle ?? "", metaDescription: a.metaDescription ?? "", faqCount: parseFaq(a.faq).length }));
              return (
                <tr key={a.id}>
                  <td><Link href={`/admin/articles/${a.id}`} className="name">{a.title}</Link><div className="mono-sub">/articles/{a.slug}</div></td>
                  <td><span className={"seo-score " + (sc >= 80 ? "good" : sc >= 50 ? "mid" : "low")}>{sc}</span></td>
                  <td>
                    <form action={toggleArticle}><input type="hidden" name="id" value={a.id} />
                      <button className={"badge " + (a.published ? "on" : "off")} title="กดเพื่อสลับ">{a.published ? "เผยแพร่" : "ร่าง"}</button>
                    </form>
                  </td>
                  <td className="c-hide">{a.updatedAt.toLocaleDateString("th-TH")}</td>
                  <td className="c-actions"><div className="row-actions"><Link href={`/admin/articles/${a.id}`} className="btn-a sm">แก้ไข</Link><ConfirmDelete action={deleteArticle} id={a.id} /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && <p style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>ยังไม่มีบทความ — เริ่มจากคำถามที่ลูกค้าถามบ่อยที่สุด แล้วเขียนตอบให้ละเอียด</p>}
      </div>
    </>
  );
}
