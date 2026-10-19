import ReviewForm from "@/components/admin/ReviewForm";
import { getBrands } from "@/lib/queries";
import { DEFAULT_BRANCHES } from "@/lib/branches";

export const dynamic = "force-dynamic";
export default async function NewReview() {
  const brands = await getBrands();
  return (<><div className="adm-head"><h1>เพิ่มรีวิว IG</h1></div><ReviewForm branches={Object.values(DEFAULT_BRANCHES).map((b) => b.province)} brands={brands.map((b) => b.name)} /></>);
}
