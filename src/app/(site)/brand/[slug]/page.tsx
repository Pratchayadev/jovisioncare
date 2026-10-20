import type { Metadata } from "next";
import { shareMeta } from "@/lib/site";
import { redirectOrNotFound } from "@/lib/redirects";
import { parseFaq } from "@/lib/faq";
import ListingPage from "@/components/ListingPage";
import { getBrandBySlug, getPublishedProducts, toCard } from "@/lib/queries";

export const revalidate = 3600;
export const generateStaticParams = async () => [] as { slug: string }[];
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const b = await getBrandBySlug(decodeURIComponent((await params).slug));
  if (!b) return {};
  const title = b.metaTitle || `แว่น ${b.name} ของแท้ ร้านแว่นอุดร หนองคาย`;
  const description = b.metaDescription || b.description || `กรอบแว่นและแว่นกันแดด ${b.name} ของแท้ที่ J.O. Vision Care สาขาอุดรธานีและหนองคาย พร้อมตรวจวัดสายตาและประกอบเลนส์`;
  return { title, description, alternates: { canonical: `/brand/${b.slug}` }, ...shareMeta({ title, description, url: `/brand/${b.slug}` }) };
}

export default async function BrandPage({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);
  const b = await getBrandBySlug(slug);
  if (!b) return redirectOrNotFound(`/brand/${slug}`);
  const products = await getPublishedProducts({ brandId: b.id });
  return <ListingPage title={`แว่น ${b.name}`} eyebrow="BRAND" intro={b.description || `กรอบแว่น ${b.name} ของแท้ ที่ร้านแว่นอุดรและหนองคาย`} products={products.map(toCard)} path={`/brand/${b.slug}`} content={b.content} faq={parseFaq(b.faq)} />;
}
