import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import PromotionForm from "@/components/admin/PromotionForm";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { deletePromotion } from "../../../actions";

export const dynamic = "force-dynamic";
export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const p = await db.query.promotions.findFirst({ where: eq(t.promotions.id, id) });
  if (!p) notFound();
  return (
    <>
      <div className="adm-head">
        <h1>แก้ไขโปรโมชัน</h1>
        <div className="actions"><ConfirmDelete action={deletePromotion} id={p.id} label="ลบโปรโมชันนี้" /></div>
      </div>
      <PromotionForm key={p.updatedAt.getTime()} promo={p} />
    </>
  );
}
