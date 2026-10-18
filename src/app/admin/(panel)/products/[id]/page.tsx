import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";
import ConfirmDelete from "@/components/admin/ConfirmDelete";
import { getBrands, getCategories } from "@/lib/queries";
import { siteHost } from "@/lib/admin-host";
import { deleteProduct } from "../../../actions";

export const dynamic = "force-dynamic";
export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [product, categories, brands] = await Promise.all([
    db.query.products.findFirst({ where: eq(t.products.id, id), with: { images: { orderBy: [asc(t.productImages.sortOrder), asc(t.productImages.id)] } } }),
    getCategories(), getBrands(),
  ]);
  if (!product) notFound();
  return (
    <>
      <div className="adm-head">
        <h1>แก้ไขสินค้า</h1><span className="sub">{product.code}</span>
        <div className="actions"><ConfirmDelete action={deleteProduct} id={product.id} label="ลบสินค้านี้" /></div>
      </div>
      <ProductForm key={product.updatedAt.getTime()} product={product} categories={categories} brands={brands} host={siteHost()} />
    </>
  );
}
