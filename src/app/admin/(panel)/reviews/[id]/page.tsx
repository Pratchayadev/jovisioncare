import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ReviewForm from "@/components/admin/ReviewForm";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { getBrands } from "@/lib/queries";
import { branches } from "@/lib/site";
import { deleteReview } from "../../../actions";

export const dynamic = "force-dynamic";
export default async function EditReview({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [review, brands] = await Promise.all([db.query.reviews.findFirst({ where: eq(t.reviews.id, id) }), getBrands()]);
  if (!review) notFound();
  return (
    <>
      <div className="adm-head">
        <h1>แก้ไขรีวิว</h1><span className="sub">@{review.handle}</span>
        <div className="actions"><ConfirmDelete action={deleteReview} id={review.id} label="ลบรีวิวนี้" /></div>
      </div>
      <ReviewForm key={review.updatedAt.getTime()} review={review} branches={branches.map((b) => b.locality)} brands={brands.map((b) => b.name)} />
    </>
  );
}
