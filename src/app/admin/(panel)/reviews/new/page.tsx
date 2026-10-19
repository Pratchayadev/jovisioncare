import ReviewForm from "@/components/admin/ReviewForm";
import { getBrands } from "@/lib/queries";
import { branches } from "@/lib/site";

export const dynamic = "force-dynamic";
export default async function NewReview() {
  const brands = await getBrands();
  return (<><div className="adm-head"><h1>เพิ่มรีวิว IG</h1></div><ReviewForm branches={branches.map((b) => b.locality)} brands={brands.map((b) => b.name)} /></>);
}
