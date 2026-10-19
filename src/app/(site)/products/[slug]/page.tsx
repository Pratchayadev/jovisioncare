import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import AskButtons from "@/components/AskButtons";
import TrackView from "@/components/TrackView";
import JsonLd from "@/components/JsonLd";
import { getProductBySlug, getRelatedProducts, toCard } from "@/lib/queries";
import { absoluteUrl, clip, productDesc, site } from "@/lib/site";
import { getContact } from "@/lib/settings";

export const revalidate = 3600;
export const generateStaticParams = async () => [] as { slug: string }[];
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug(decodeURIComponent((await params).slug));
  if (!p) return {};
  const brand = p.brand?.name ?? "";
  const title = p.metaTitle || `${brand} ${p.name} (${p.code})`.trim();
  const description = p.metaDescription || clip(productDesc({ brand, name: p.name, categoryName: p.category?.name, description: p.description }));
  const img = p.images[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { type: "website", title, description, url: `/products/${p.slug}`, images: img ? [{ url: img, alt: `${brand} ${p.name}` }] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = await getProductBySlug(decodeURIComponent((await params).slug));
  if (!p) notFound();
  const card = toCard(p);
  const [relatedRows, c] = await Promise.all([getRelatedProducts(p), getContact()]);
  const related = relatedRows.map(toCard);
  const url = absoluteUrl(`/products/${p.slug}`);
  const crumbs = [
    { name: "หน้าแรก", url: "/" },
    ...(p.category ? [{ name: p.category.name, url: `/category/${p.category.slug}` }] : [{ name: "สินค้าทั้งหมด", url: "/products" }]),
    { name: `${card.brand} ${p.name}`, url: `/products/${p.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Product",
              "@id": `${url}#product`,
              name: `${card.brand} ${p.name}`.trim(),
              sku: p.code,
              url,
              image: p.images.map((i) => absoluteUrl(i.url)),
              description: productDesc(card),
              category: p.category?.name,
              ...(p.brand ? { brand: { "@type": "Brand", name: p.brand.name } } : {}),
              ...(p.price
                ? { offers: { "@type": "Offer", price: p.price, priceCurrency: "THB", availability: "https://schema.org/InStoreOnly", url, seller: { "@type": "Organization", name: site.name } } }
                : {}),
            },
            { "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.url) })) },
          ],
        }}
      />
      <div className="page-head">
        <ol className="crumbs">
          {crumbs.map((c, i) => <li key={c.url}>{i < crumbs.length - 1 ? <Link href={c.url}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}</li>)}
        </ol>
      </div>
      <div className="page-body">
        <TrackView code={p.code} name={p.name} brand={card.brand} />
        <article className="pd" data-track-area="product-page">
          <ProductGallery images={card.images} priority />
          <div className="pd-info">
            {p.brand ? <Link href={`/brand/${p.brand.slug}`} className="pd-brand">{p.brand.name}</Link> : null}
            <h1>{p.name}</h1>
            {p.price ? <span className="pd-price">{p.price.toLocaleString("th-TH")} บาท</span> : null}
            {p.tag && <span className="pcard-tag" style={{ fontSize: 14 }}>{p.tag}</span>}
            <p className="sheet-desc">{productDesc(card)}</p>
            <dl className="pd-meta">
              <dt>รหัสสินค้า</dt><dd className="mono">{p.code}</dd>
              {p.category && (<><dt>หมวดหมู่</dt><dd><Link href={`/category/${p.category.slug}`}>{p.category.name}</Link></dd></>)}
              <dt>สาขา</dt><dd>อุดรธานี · หนองคาย</dd>
            </dl>
            <AskButtons p={card} c={c} />
          </div>
        </article>
        {related.length > 0 && (
          <section className="related" aria-labelledby="related-title">
            <h2 id="related-title">สินค้าที่คุณอาจสนใจ</h2>
            <div className="grid-products">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
          </section>
        )}
      </div>
    </>
  );
}
