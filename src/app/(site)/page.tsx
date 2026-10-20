import Image from "next/image";
import Link from "next/link";
import HeroLens from "@/components/HeroLens";
import LensLab from "@/components/LensLab";
import Collection from "@/components/Collection";
import JsonLd from "@/components/JsonLd";
import { getBrands, getCategories, getPublishedArticles, getPublishedProducts, getPublishedReviews, toCard } from "@/lib/queries";
import ArticleCard from "@/components/ArticleCard";
import IgPost from "@/components/IgPost";
import { shareMeta, site, SITE_URL, storePhotos, storePhotosNongKhai } from "@/lib/site";
import { getBranches, getContact } from "@/lib/settings";
import { opticianNode, organizationNode } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: site.title },
  alternates: { canonical: "/" },
  ...shareMeta({ title: site.ogTitle, description: site.ogDescription, url: "/" }),
};

export default async function Home() {
  const [products, categories, brands, reviews, c] = await Promise.all([getPublishedProducts({ featuredOnly: true, limit: 24 }), getCategories(), getBrands(), getPublishedReviews(), getContact()]);
  const [branches, articles] = await Promise.all([getBranches(), getPublishedArticles(3)]);
  const [udon, nongkhai] = branches;
  const cards = products.map(toCard);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: site.name, alternateName: ["JO Vision Care", "เจ.โอ.วิชั่นแคร์", "jovisioncare"], inLanguage: "th-TH" },
      organizationNode(c),
      ...branches.map((b) => opticianNode(b, c)),
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
        <Collection products={cards} categories={categories.map((x) => ({ slug: x.slug, name: x.name }))} c={c} />
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
        </div>
        <p className="store-branch">สาขา{udon.province} — {udon.place}</p>
        <div className="store-photos">
          {storePhotos.map((ph) => (
            <figure key={ph.src} className="store-photo" data-reveal="">
              <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 900px) 300px, 50vw" />
            </figure>
          ))}
          <Link href="#branches" className="store-tile" data-reveal="">
            <span className="display">COME SEE US.</span>
            <span>{branches.map((b) => <span key={b.id} style={{ display: "block" }}>{b.short} · {b.daysLabel} {b.hours}</span>)}</span>
            <span className="go">ดูแผนที่ →</span>
          </Link>
        </div>
        <p className="store-branch">สาขา{nongkhai.province} — {nongkhai.place}</p>
        <div className="store-photos-wide">
          {storePhotosNongKhai.map((ph) => (
            <figure key={ph.src} className="store-photo" data-reveal="">
              <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 900px) 300px, 100vw" />
            </figure>
          ))}
        </div>
      </section>

      {reviews.length > 0 && (
      <section id="reviews" className="section" aria-labelledby="reviews-title">
        <div className="sec-head reviews-head" data-reveal="">
          <p className="eyebrow">04 — #JOVISIONCARE</p>
          <h2 id="reviews-title" className="h2">ลูกค้าตัวจริง แท็กเราบน IG</h2>
          <p className="lead">ภาพจากลูกค้าที่แท็ก @jovisioncare ขอบคุณทุกคนที่ไว้ใจให้เราดูแลสายตา</p>
          <a href={c.ig} target="_blank" rel="noopener" className="more-link" style={{ marginTop: 6 }}>ติดตามบน Instagram →</a>
        </div>
        <div className="ig-feed">
          {reviews.map((r) => <IgPost key={r.id} r={r} />)}
        </div>
      </section>
      )}

      <section id="brands" className="section brands" aria-label="แบรนด์ที่จำหน่าย">
        <p className="eyebrow">AUTHORIZED BRANDS — แบรนด์แท้ที่ร้านเราจำหน่าย</p>
        <div className="grid-brands">
          {brands.map((b) => (
            <Link key={b.id} href={`/brand/${b.slug}`} className="brand-chip" title={b.name}>
              {b.logo ? <Image src={b.logo} alt={b.name} width={92} height={40} style={{ objectFit: "contain", width: "auto", maxHeight: 40 }} /> : b.name}
            </Link>
          ))}
        </div>
        <Link href="/brands" className="see-all">ดูทุกแบรนด์ →</Link>
      </section>

      <section id="branches" className="section" aria-labelledby="branches-title">
        <div className="sec-head" data-reveal="">
          <p className="eyebrow">05 — BRANCHES</p>
          <h2 id="branches-title" className="h2">2 สาขา ใกล้คุณ</h2>
        </div>
        <div className="grid-branches">
          {branches.map((b) => (
            <article key={b.en} className="branch" data-reveal="" data-track-area="branch-card" data-track-branch={b.id}>
              <div style={{ display: "grid", gap: 2 }}>
                <span className="branch-en">{b.en}</span>
                <h3>{b.h}</h3>
              </div>
              <dl>
                <dt>ที่อยู่</dt><dd>{b.addr}</dd>
                <dt>เวลา</dt><dd>{b.daysLabel} {b.hours}</dd>
                {c.phone && (<><dt>โทร</dt><dd><a href={`tel:${c.phoneIntl}`}>{c.phone}</a></dd></>)}
              </dl>
              <div className="row-btns">
                <a href={b.map} target="_blank" rel="noopener" className="pill solid">นำทาง Google Maps</a>
                <a href={c[b.fbKey]} target="_blank" rel="noopener" className="pill">เพจ Facebook</a>
                <Link href={b.path} className="pill">ข้อมูลสาขา →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {articles.length > 0 && (
        <section id="articles" className="section" aria-labelledby="articles-title">
          <div className="sec-head" data-reveal="">
            <p className="eyebrow">JOURNAL</p>
            <h2 id="articles-title" className="h2">เรื่องแว่นที่ควรรู้</h2>
          </div>
          <div className="grid-articles">{articles.map((a) => <ArticleCard key={a.id} a={a} />)}</div>
          <Link href="/articles" className="more-link">ดูบทความทั้งหมด →</Link>
        </section>
      )}
    </>
  );
}
