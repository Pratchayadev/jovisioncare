import ProductForm from "@/components/admin/ProductForm";
import { getBrands, getCategories } from "@/lib/queries";
import { siteHost } from "@/lib/admin-host";

export const dynamic = "force-dynamic";
export default async function NewProduct() {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);
  return (<><div className="adm-head"><h1>เพิ่มสินค้า</h1></div><ProductForm categories={categories} brands={brands} host={siteHost()} /></>);
}
