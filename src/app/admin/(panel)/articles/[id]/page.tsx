import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ArticleForm from "@/components/admin/ArticleForm";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { siteHost } from "@/lib/admin-host";
import { deleteArticle } from "../../../actions";

export const dynamic = "force-dynamic";
export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const a = await db.query.articles.findFirst({ where: eq(t.articles.id, id) });
  if (!a) notFound();
  return (
    <>
      <div className="adm-head">
        <h1>แก้ไขบทความ</h1><span className="sub">{a.title}</span>
        <div className="actions"><ConfirmDelete action={deleteArticle} id={a.id} label="ลบบทความนี้" /></div>
      </div>
      <ArticleForm key={a.updatedAt.getTime()} article={a} host={siteHost()} />
    </>
  );
}
