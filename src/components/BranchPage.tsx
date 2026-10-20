import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "./JsonLd";
import ProductCard from "./ProductCard";
import IgPost from "./IgPost";
import { getBranches, getContact } from "@/lib/settings";
import { getPublishedProducts, getPublishedReviews, toCard } from "@/lib/queries";
import { clip, storePhotos, storePhotosNongKhai } from "@/lib/site";
import { breadcrumbNode, opticianNode, organizationNode } from "@/lib/seo";
import type { BranchId } from "@/lib/branches";

const PHOTOS: Record<BranchId, { src: string; alt: string }[]> = { udon: storePhotos, nongkhai: storePhotosNongKhai };

// บริการที่ร้านระบุไว้ในข้อมูลร้าน (ข้อความส่วนท้ายเว็บจากดีไซน์)
const SERVICES = [
  ["ตรวจวัดสายตาอย่างละเอียด", "วัดค่าสายตาสั้น ยาว เอียง ด้วยเครื่องมือทันสมัย"],
  ["ตัดแว่นสายตา", "ประกอบเลนส์ตามค่าสายตา เลือกกรอบได้หลายแบรนด์"],
  ["เลนส์กรองแสงสีฟ้า", "สำหรับคนใช้มือถือและคอมพิวเตอร์นาน ๆ"],
  ["เลนส์ออโต้ปรับแสง", "ในร่มใส ออกแดดเข้มขึ้นอัตโนมัติ"],
  ["เลนส์โปรเกรสซีฟ", "มองได้ทั้งใกล้และไกลในเลนส์เดียว"],
  ["แว่นกันแดดแบรนด์แท้", "BOLON, HELEN KELLER และแบรนด์อื่น ๆ"],
] as const;

async function load(id: BranchId) {
  const branches = await getBranches();
  const b = branches.find((x) => x.id === id);
  if (!b) notFound();
  return { b, other: branches.find((x) => x.id !== id)! };
}

export async function branchMetadata(id: BranchId): Promise<Metadata> {
  const [{ b }, c] = await Promise.all([load(id), getContact()]);
  const title = `ร้านแว่น${b.short} ตรวจวัดสายตา ตัดแว่น — ${b.place} | J.O. Vision Care`;
  const description = clip(`ร้านแว่น${b.short} J.O. Vision Care ${b.place} ${b.daysLabel} ${b.hours}${c.phone ? ` โทร ${c.phone}` : ""} ตรวจวัดสายตา ตัดแว่น เลนส์กรองแสงสีฟ้า เลนส์ออโต้ กรอบแว่นแบรนด์แท้ ${b.addr}`);
  const img = PHOTOS[id][0]?.src;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: b.path },
    openGraph: { type: "website", locale: "th_TH", title, description, url: b.path, images: img ? [{ url: img, alt: `ร้านแว่น${b.short} J.O. Vision Care` }] : undefined },
  };
}

export default async function BranchPage({ id }: { id: BranchId }) {
  const [{ b, other }, c, reviewsAll, products] = await Promise.all([load(id), getContact(), getPublishedReviews(), getPublishedProducts({ featuredOnly: true, limit: 8 })]);
  const reviews = reviewsAll.filter((r) => r.branch === b.province);
  const photos = PHOTOS[id];
  const crumbs = [{ name: "หน้าแรก", url: "/" }, { name: `สาขา${b.province}`, url: b.path }];
  const tel = c.phone ? `tel:${c.phoneIntl}` : null;

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [organizationNode(c), opticianNode(b, c, photos[0]?.src), breadcrumbNode(crumbs)] }} />
      <div className="page-head">
        <ol className="crumbs"><li><Link href="/">หน้าแรก</Link></li><li aria-current="page">สาขา{b.province}</li></ol>
        <p className="eyebrow">BRANCH — {b.en}</p>
        <h1 className="h2">ร้านแว่น{b.short} J.O. Vision Care สาขา{b.province}</h1>
        <p className="lead">
          J.O. Vision Care สาขา{b.province} ตั้งอยู่ที่{b.place} {b.daysLabel} {b.hours} บริการตรวจวัดสายตาอย่างละเอียด ตัดแว่นสายตา
          เลนส์กรองแสงสีฟ้า เลนส์ออโต้ และกรอบแว่นแบรนด์แท้ ทักแอดมินหรือแวะมาที่ร้านได้เลย
        </p>
      </div>

      <div className="page-body" style={{ paddingBottom: 24 }}>
        <section className="bp-info" aria-label={`ที่อยู่และเวลาเปิดสาขา${b.province}`} data-track-area="branch-page" data-track-branch={b.id}>
          <div className="branch" style={{ alignContent: "start" }}>
            <div style={{ display: "grid", gap: 2 }}>
              <span className="branch-en">{b.en}</span>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{b.h}</h2>
            </div>
            <dl>
              <dt>ที่อยู่</dt><dd>{b.addr}</dd>
              <dt>เวลา</dt><dd>{b.daysLabel} {b.hours}</dd>
              {c.phone && (<><dt>โทร</dt><dd><a href={tel!}>{c.phone}</a></dd></>)}
            </dl>
            <div className="row-btns">
              <a href={b.map} target="_blank" rel="noopener" className="pill solid">นำทาง Google Maps</a>
              {tel && <a href={tel} className="pill">โทรหาร้าน</a>}
              <a href={c[b.fbKey]} target="_blank" rel="noopener" className="pill">เพจ Facebook สาขา</a>
              {c.line && <a href={c.line} target="_blank" rel="noopener" className="pill">LINE</a>}
            </div>
          </div>
          <div className="bp-map">
            <iframe
              title={`แผนที่ร้านแว่น J.O. Vision Care สาขา${b.province}`}
              src={`https://maps.google.com/maps?q=${b.lat},${b.lng}&z=16&hl=th&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>

        {(b.directions || b.parking) && (
          <section className="bp-section" aria-labelledby="bp-way">
            <h2 id="bp-way" className="bp-h">การเดินทางไปสาขา{b.province}</h2>
            <div className="bp-way">
              {b.directions && <ul>{b.directions.split("\n").map((l) => <li key={l}>{l}</li>)}</ul>}
              {b.parking && <p><b>ที่จอดรถ:</b> {b.parking}</p>}
              <a href={b.map} target="_blank" rel="noopener" className="pill solid" data-track-area="branch-way" data-track-branch={b.id}>เปิดเส้นทางใน Google Maps</a>
            </div>
          </section>
        )}

        <section className="bp-section" aria-labelledby="bp-photos">
          <h2 id="bp-photos" className="bp-h">บรรยากาศร้าน สาขา{b.province}</h2>
          <div className={id === "udon" ? "store-photos" : "store-photos-wide"}>
            {photos.map((ph, i) => (
              <figure key={ph.src} className="store-photo" data-reveal="">
                <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 900px) 300px, 50vw" priority={i < 2} />
              </figure>
            ))}
          </div>
        </section>

        <section className="bp-section" aria-labelledby="bp-services">
          <h2 id="bp-services" className="bp-h">บริการที่สาขา{b.province}</h2>
          <ul className="bp-services">
            {SERVICES.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
          </ul>
        </section>

        {reviews.length > 0 && (
          <section className="bp-section" aria-labelledby="bp-reviews">
            <h2 id="bp-reviews" className="bp-h">ลูกค้าสาขา{b.province} แท็กเราบน IG</h2>
            <div className="ig-feed">{reviews.map((r) => <IgPost key={r.id} r={r} />)}</div>
          </section>
        )}

        {products.length > 0 && (
          <section className="bp-section" aria-labelledby="bp-products">
            <h2 id="bp-products" className="bp-h">กรอบแว่นแนะนำ</h2>
            <div className="grid-products">{products.map(toCard).map((p) => <ProductCard key={p.id} p={p} />)}</div>
            <Link className="more-link" href="/products">ดูสินค้าทั้งหมด →</Link>
          </section>
        )}

        <section className="bp-section">
          <Link href={other.path} className="bp-other">
            <span className="eyebrow">อีกสาขา</span>
            <b>ร้านแว่น{other.short} — สาขา{other.province}</b>
            <span>{other.addr}</span>
            <span className="go">ดูข้อมูลสาขา →</span>
          </Link>
        </section>
      </div>
    </>
  );
}
