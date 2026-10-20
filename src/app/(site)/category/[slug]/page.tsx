import type { Metadata } from "next";
import { shareMeta } from "@/lib/site";
import { redirectOrNotFound } from "@/lib/redirects";
import { parseFaq } from "@/lib/faq";
import ListingPage from "@/components/ListingPage";
import { getActivePromotions, getCategories, getCategoryBySlug, getPublishedProducts, toCard } from "@/lib/queries";
import PromoList from "@/components/PromoList";

export const revalidate = 3600;
export const generateStaticParams = async () => [] as { slug: string }[];
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCategoryBySlug(decodeURIComponent((await params).slug));
  if (!c) return {};
  const thin = !c.content?.trim() && (await getPublishedProducts({ categoryId: c.id, limit: 1 })).length === 0 && (c.slug !== "promotion" || (await getActivePromotions()).length === 0);
  const title = c.metaTitle || `${c.name} แบรนด์แท้ ร้านแว่นอุดร หนองคาย`;
  const description = c.metaDescription || c.description || `${c.name} แบรนด์แท้ที่ J.O. Vision Care ร้านแว่นอุดรและหนองคาย ตรวจวัดสายตาฟรี ทักแอดมินได้ทุกช่องทาง`;
  return { title, description, ...(thin ? { robots: { index: false, follow: true } } : {}), alternates: { canonical: `/category/${c.slug}` }, ...shareMeta({ title, description, url: `/category/${c.slug}` }) };
}

export default async function CategoryPage({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);
  const [c, categories] = await Promise.all([getCategoryBySlug(slug), getCategories()]);
  if (!c) return redirectOrNotFound(`/category/${slug}`);
  const [products, promos] = await Promise.all([getPublishedProducts({ categoryId: c.id }), c.slug === "promotion" ? getActivePromotions() : Promise.resolve([])]);
  return (
    <ListingPage
      title={c.name}
      eyebrow="CATEGORY"
      intro={c.description}
      products={products.map(toCard)}
      path={`/category/${c.slug}`}
      content={c.content}
      faq={parseFaq(c.faq)}
      before={<PromoList items={promos} />}
      chips={[{ href: "/products", label: "ทั้งหมด" }, ...categories.map((x) => ({ href: `/category/${x.slug}`, label: x.name, on: x.id === c.id }))]}
    />
  );
}
