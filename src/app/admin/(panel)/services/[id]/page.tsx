import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ServiceForm from "@/components/admin/ServiceForm";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { siteHost } from "@/lib/admin-host";
import { deleteService } from "../../../actions";

export const dynamic = "force-dynamic";
export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const s = await db.query.services.findFirst({ where: eq(t.services.id, id) });
  if (!s) notFound();
  return (
    <>
      <div className="adm-head">
        <h1>แก้ไขบริการ</h1><span className="sub">{s.title}</span>
        <div className="actions"><ConfirmDelete action={deleteService} id={s.id} label="ลบบริการนี้" /></div>
      </div>
      <ServiceForm key={s.updatedAt.getTime()} service={s} host={siteHost()} />
    </>
  );
}
