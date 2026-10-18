import Link from "next/link";
import ProductCard from "./ProductCard";
import JsonLd from "./JsonLd";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import type { ProductCard as P } from "@/lib/queries";

type Chip = { href: string; label: string; on?: boolean };

export default function ListingPage({ title, eyebrow, intro, products, chips, path }: { title: string; eyebrow: string; intro?: string | null; products: P[]; chips?: Chip[]; path: string }) {
  const crumbs = [{ name: "หน้าแรก", url: "/" }, { name: title, url: path }];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.url) })) },
            { "@type": "CollectionPage", name: title, url: SITE_URL + path, mainEntity: { "@type": "ItemList", itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(`/products/${p.slug}`), name: `${p.brand} ${p.name}` })) } },
          ],
        }}
      />
      <div className="page-head">
        <ol className="crumbs"><li><Link href="/">หน้าแรก</Link></li><li aria-current="page">{title}</li></ol>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h2">{title}</h1>
        {intro && <p className="lead">{intro}</p>}
      </div>
      <div className="page-body" style={{ paddingBottom: 24 }}>
        {chips && (
          <nav className="filters" aria-label="หมวดสินค้า">
            {chips.map((c) => <Link key={c.href} href={c.href} className={"filter" + (c.on ? " on" : "")} aria-current={c.on ? "page" : undefined}>{c.label}</Link>)}
          </nav>
        )}
        <div className="grid-products">{products.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}</div>
        {!products.length && <p className="empty">ยังไม่มีสินค้าในหน้านี้ — ทักแอดมินเพื่อสอบถามรุ่นที่ต้องการได้เลย</p>}
      </div>
    </>
  );
}
