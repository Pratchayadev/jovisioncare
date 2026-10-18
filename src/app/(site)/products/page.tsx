import type { Metadata } from "next";
import ListingPage from "@/components/ListingPage";
import { getCategories, getPublishedProducts, toCard } from "@/lib/queries";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "กรอบแว่นและแว่นกันแดดแบรนด์แท้ทั้งหมด",
  description: "รวมกรอบแว่นสายตาและแว่นกันแดดแบรนด์แท้ที่ J.O. Vision Care ร้านแว่นอุดร หนองคาย พร้อมบริการตรวจวัดสายตาและประกอบเลนส์",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getPublishedProducts(), getCategories()]);
  return (
    <ListingPage
      title="สินค้าทั้งหมด"
      eyebrow="ALL PRODUCTS"
      intro="กรอบแว่นแบรนด์แท้ คัดมาให้เข้ากับหน้าคุณ แตะสินค้าเพื่อดูรายละเอียดและสอบถามแอดมิน"
      products={products.map(toCard)}
      path="/products"
      chips={[{ href: "/products", label: "ทั้งหมด", on: true }, ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.name }))]}
    />
  );
}
