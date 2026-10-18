import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import TaxonomyForm from "@/components/admin/TaxonomyForm";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { siteHost } from "@/lib/admin-host";
import { deleteBrand } from "../../../actions";

export const dynamic = "force-dynamic";
export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const item = await db.query.brands.findFirst({ where: eq(t.brands.id, id) });
  if (!item) notFound();
  return (
    <>
      <div className="adm-head">
        <h1>แก้ไขแบรนด์</h1><span className="sub">{item.name}</span>
        <div className="actions"><ConfirmDelete action={deleteBrand} id={item.id} label="ลบแบรนด์นี้" /></div>
      </div>
      <TaxonomyForm key={item.updatedAt.getTime()} kind="brands" item={item} host={siteHost()} />
    </>
  );
}
