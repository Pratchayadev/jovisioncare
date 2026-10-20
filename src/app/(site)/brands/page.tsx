import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { getBrandsWithCounts } from "@/lib/queries";
import { absoluteUrl, clip, SITE_URL } from "@/lib/site";
import { breadcrumbNode } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "แบรนด์แว่นแท้ทั้งหมด กรอบแว่นแบรนด์เนม อุดร หนองคาย",
  description: "รวมแบรนด์กรอบแว่นและแว่นกันแดดของแท้ที่ J.O. Vision Care สาขาอุดรธานีและหนองคาย ดูรุ่นที่มีในร้าน แล้วแวะมาลองหรือทักถามแอดมินได้",
  alternates: { canonical: "/brands" },
  openGraph: { title: "แบรนด์แว่นแท้ทั้งหมด | J.O. Vision Care", url: "/brands" },
};

export default async function BrandsPage() {
  const brands = await getBrandsWithCounts();
  const crumbs = [{ name: "หน้าแรก", url: "/" }, { name: "แบรนด์ทั้งหมด", url: "/brands" }];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbNode(crumbs),
            { "@type": "CollectionPage", "@id": `${SITE_URL}/brands#page`, name: "แบรนด์แว่นแท้ทั้งหมด", url: absoluteUrl("/brands"), mainEntity: { "@type": "ItemList", itemListElement: brands.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, url: absoluteUrl(`/brand/${b.slug}`) })) } },
          ],
        }}
      />
      <div className="page-head">
        <ol className="crumbs"><li><Link href="/">หน้าแรก</Link></li><li aria-current="page">แบรนด์ทั้งหมด</li></ol>
        <p className="eyebrow">AUTHORIZED BRANDS</p>
        <h1 className="h2">แบรนด์แว่นแท้ที่ J.O. Vision Care</h1>
        <p className="lead">กรอบแว่นสายตาและแว่นกันแดดของแท้ {brands.length} แบรนด์ ลองได้ที่สาขาอุดรธานีและหนองคาย เลือกแบรนด์เพื่อดูรุ่นที่มีในร้าน</p>
      </div>
      <div className="page-body">
        <ul className="brand-list">
          {brands.map((b) => (
            <li key={b.id}>
              <Link href={`/brand/${b.slug}`} className="brand-card">
                <span className="brand-card-logo">
                  {b.logo ? <Image src={b.logo} alt={b.name} width={120} height={48} style={{ objectFit: "contain", width: "auto", maxHeight: 48 }} /> : <span className="brand-card-name">{b.name}</span>}
                </span>
                <span className="brand-card-body">
                  <h2>แว่น {b.name}</h2>
                  {b.description && <p>{clip(b.description, 90)}</p>}
                  <small>{b.count ? `${b.count} รุ่นบนเว็บ` : "สอบถามรุ่นที่มีในร้าน"} →</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
