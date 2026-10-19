import Image from "next/image";
import Link from "next/link";
import HeroLens from "@/components/HeroLens";
import LensLab from "@/components/LensLab";
import Collection from "@/components/Collection";
import JsonLd from "@/components/JsonLd";
import { getBrands, getCategories, getPublishedProducts, toCard } from "@/lib/queries";
import { absoluteUrl, branches, links, reviews, site, SITE_URL, storeShots } from "@/lib/site";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: site.title },
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "th_TH", siteName: site.name, title: site.ogTitle, description: site.ogDescription, url: "/", images: [{ url: site.ogImage, width: 2048, height: 1536, alt: "หน้าร้าน J.O. Vision Care" }] },
  twitter: { card: "summary_large_image", title: site.ogTitle, description: site.ogDescription, images: [site.ogImage] },
};

export default async function Home() {
  const [products, categories, brands] = await Promise.all([getPublishedProducts({ featuredOnly: true, limit: 24 }), getCategories(), getBrands()]);
  const cards = products.map(toCard);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: site.name, inLanguage: "th-TH" },
      ...branches.map((b, i) => ({
        "@type": "Optician",
        "@id": `${SITE_URL}/#branch-${i + 1}`,
        name: `J.O. Vision Care สาขา${b.locality}`,
        alternateName: `ร้านแว่น${b.locality === "อุดรธานี" ? "อุดร" : b.locality} J.O. Vision Care`,
        url: SITE_URL,
        image: absoluteUrl(site.ogImage),
        logo: absoluteUrl("/images/logo-og.jpg"),
        address: { "@type": "PostalAddress", streetAddress: b.place, addressLocality: `เมือง${b.locality}`, addressRegion: b.locality, postalCode: b.postalCode, addressCountry: "TH" },
        geo: { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng },
        hasMap: `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`,
        openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: b.opens, closes: b.closes }],
        ...(b.tel ? { telephone: b.tel } : {}),
        sameAs: [b.fb, links.ig, links.tiktok],
        priceRange: "฿฿",
      })),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HeroLens />

      <Link href="/#contact" className="promo">
        <div className="wrap">
          <span className="k">PROMOTION</span>
          <span className="t">{site.promo.label}</span>
          <span className="p">{site.promo.price}</span>
          <span className="go">สอบถามแอดมิน →</span>
        </div>
      </Link>

      <section id="collection" className="section collection" aria-labelledby="collection-title">
        <div className="sec-head" data-reveal="">
          <p className="eyebrow">01 — COLLECTION</p>
          <h2 id="collection-title" className="h2">กรอบแว่นแบรนด์แท้ คัดมาให้เข้ากับหน้าคุณ</h2>
          <p className="lead">แตะที่สินค้าเพื่อปัดดูภาพทุกมุม แล้วส่งรุ่นที่ชอบให้แอดมินได้ทันที</p>
        </div>
        <Collection products={cards} categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      </section>

      <LensLab />

      <section id="store" className="section" aria-labelledby="store-title">
        <div className="sec-head" data-reveal="">
          <p className="eyebrow">03 — INSIDE THE STORE</p>
          <h2 id="store-title" className="big-title">TODAY&apos;S SELFIE IS<br /><em>TOMORROW&apos;S</em> OPTOMETRIC PROFILE</h2>
          <p className="lead" style={{ marginTop: 6 }}>ร้านโทนขาวสว่าง ไฟเพดานนวล มุมตรวจวัดสายตาด้วยเครื่องมือทันสมัย และกรอบให้ลองเยอะจนเลือกไม่ถูก</p>
        </div>
        <div className="store-grid">
          <figure className="store-main" data-reveal="">
            <Image src="/images/store.jpg" alt="บรรยากาศภายในร้านแว่นตา J.O. Vision Care สาขาอุดรธานี" fill sizes="(min-width: 1240px) 1208px, 100vw" />
            <figcaption>หน้าร้าน · สาขาอุดรธานี</figcaption>
          </figure>
          {storeShots.map((s) => <div key={s} className="store-ph" data-reveal="">{s}</div>)}
        </div>
      </section>

      <section id="reviews" className="section" aria-labelledby="reviews-title">
        <div className="sec-head reviews-head" data-reveal="">
          <p className="eyebrow">04 — #JOVISIONCARE</p>
          <h2 id="reviews-title" className="h2">ลูกค้าตัวจริง แท็กเราบน IG</h2>
          <p className="lead">ภาพจากลูกค้าที่แท็ก @jovisioncare อัปเดตอัตโนมัติ ขอบคุณทุกคนที่ไว้ใจให้เราดูแลสายตา</p>
          <a href={links.ig} target="_blank" rel="noopener" className="more-link" style={{ marginTop: 6 }}>ติดตามบน Instagram →</a>
        </div>
        <div className="grid-reviews">
          {reviews.map((r) => (
            <a key={r.handle} href={links.ig} target="_blank" rel="noopener" className="review" data-reveal="">
              <div className="review-ph">ig tagged photo<span className="review-handle">{r.handle}</span></div>
              <p>กรอบแบรนด์ <strong>{r.brand}</strong> · {r.branch}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="brands" className="section brands" aria-label="แบรนด์ที่จำหน่าย">
        <p className="eyebrow">AUTHORIZED BRANDS — แบรนด์แท้ที่ร้านเราจำหน่าย</p>
        <div className="grid-brands">
          {brands.map((b) => (
            <Link key={b.id} href={`/brand/${b.slug}`} className="brand-chip" title={b.name}>
              {b.logo ? <Image src={b.logo} alt={b.name} width={92} height={40} style={{ objectFit: "contain", width: "auto", maxHeight: 40 }} /> : b.name}
            </Link>
          ))}
        </div>
      </section>

      <section id="branches" className="section" aria-labelledby="branches-title">
        <div className="sec-head" data-reveal="">
          <p className="eyebrow">05 — BRANCHES</p>
          <h2 id="branches-title" className="h2">2 สาขา ใกล้คุณ</h2>
        </div>
        <div className="grid-branches">
          {branches.map((b) => (
            <article key={b.en} className="branch" data-reveal="">
              <div style={{ display: "grid", gap: 2 }}>
                <span className="branch-en">{b.en}</span>
                <h3>{b.h}</h3>
              </div>
              <dl>
                <dt>ที่อยู่</dt><dd>{b.addr}</dd>
                <dt>เวลา</dt><dd>{b.hours}</dd>
                {b.tel && (<><dt>โทร</dt><dd><a href={`tel:${b.tel.replace(/[^0-9+]/g, "")}`}>{b.tel}</a></dd></>)}
              </dl>
              <div className="row-btns">
                <a href={b.map} target="_blank" rel="noopener" className="pill solid">นำทาง Google Maps</a>
                <a href={b.fb} target="_blank" rel="noopener" className="pill">เพจ Facebook</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
