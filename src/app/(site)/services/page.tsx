import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import WhyUs from "@/components/WhyUs";
import { getPublishedServices, serviceHref } from "@/lib/queries";
import { getBranches } from "@/lib/settings";
import { absoluteUrl, SITE_URL, shareMeta } from "@/lib/site";
import { breadcrumbNode } from "@/lib/seo";
import { serviceNode } from "@/lib/service-seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "บริการร้านแว่น ตัดแว่น วัดสายตา อุดรธานี หนองคาย",
  description: "รวมบริการของ J.O. Vision Care ตรวจวัดสายตา ตัดแว่น เลนส์แว่นตา เลนส์โปรเกรสซีฟ แว่นเด็ก เปลี่ยนเลนส์ ซ่อมและปรับแว่น ที่สาขาอุดรธานีและหนองคาย",
  alternates: { canonical: "/services" },
  ...shareMeta({ title: "บริการร้านแว่น ตัดแว่น วัดสายตา อุดรธานี หนองคาย", description: "รวมบริการของ J.O. Vision Care ตรวจวัดสายตา ตัดแว่น เลนส์แว่นตา เลนส์โปรเกรสซีฟ แว่นเด็ก เปลี่ยนเลนส์ ซ่อมและปรับแว่น ที่สาขาอุดรธานีและหนองคาย", url: "/services" }),
};

export default async function ServicesPage() {
  const [items, branches] = await Promise.all([getPublishedServices(), getBranches()]);
  const pages = items.filter((s) => s.hasPage);
  const links = items.filter((s) => !s.hasPage);
  const crumbs = [{ name: "หน้าแรก", url: "/" }, { name: "บริการ", url: "/services" }];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumbNode(crumbs),
            { "@type": "CollectionPage", "@id": `${SITE_URL}/services#page`, name: "บริการร้านแว่น J.O. Vision Care", url: absoluteUrl("/services"), mainEntity: { "@type": "ItemList", itemListElement: pages.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: serviceNode(s, branches, absoluteUrl(`/services/${s.slug}`)) })) } },
          ],
        }}
      />
      <div className="page-head">
        <ol className="crumbs"><li><Link href="/">หน้าแรก</Link></li><li aria-current="page">บริการ</li></ol>
        <p className="eyebrow">SERVICES</p>
        <h1 className="h2">บริการร้านแว่น J.O. Vision Care</h1>
        <p className="lead">ตรวจวัดสายตา ตัดแว่น เลือกเลนส์ และดูแลแว่นหลังการขาย ที่สาขาอุดรธานีและสาขาหนองคาย</p>
      </div>
      <div className="page-body">
        <ul className="svc-grid">
          {pages.map((s, i) => (
            <li key={s.id}>
              <Link href={serviceHref(s)} className="svc-card">
                <span className="svc-no">{String(i + 1).padStart(2, "0")}</span>
                <h2>{s.title}</h2>
                {s.summary && <p>{s.summary}</p>}
                <span className="svc-more">อ่านรายละเอียด →</span>
              </Link>
            </li>
          ))}
        </ul>
        {links.length > 0 && (
          <section className="bp-section" aria-labelledby="svc-shop">
            <h2 id="svc-shop" className="bp-h">สินค้าในร้าน</h2>
            <ul className="svc-links">
              {links.map((s) => (
                <li key={s.id}><Link href={serviceHref(s)}><b>{s.title}</b>{s.summary && <span>{s.summary}</span>}</Link></li>
              ))}
            </ul>
          </section>
        )}
        <WhyUs />
        <section className="bp-section" aria-labelledby="svc-branches">
          <h2 id="svc-branches" className="bp-h">เลือกสาขาที่สะดวก</h2>
          <div className="row-btns svc-branch-btns">
            {branches.map((b) => <Link key={b.id} href={b.path} className="pill solid">สาขา{b.province} · {b.daysLabel} {b.hours}</Link>)}
          </div>
        </section>
      </div>
    </>
  );
}
