import Image from "next/image";
import { renderMarkdown } from "@/lib/markdown";
import type { Promotion } from "@/db/schema";

const BR: Record<string, string> = { udon: "เฉพาะสาขาอุดรธานี", nongkhai: "เฉพาะสาขาหนองคาย" };
const until = (d: Date) => d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" });

/** การ์ดโปรโมชัน: รูป + รายละเอียด + เงื่อนไข */
export default function PromoList({ items, title = "โปรโมชันตอนนี้", headingLevel = 2 }: { items: Promotion[]; title?: string; headingLevel?: 2 | 3 }) {
  if (!items.length) return null;
  const H = `h${headingLevel}` as const;
  return (
    <section className="promos" aria-labelledby="promos-title" data-track-area="promotion">
      <H id="promos-title" className="bp-h">{title}</H>
      {items.map((p, i) => (
        <article key={p.id} id={`promo-${p.id}`} className="promo-card">
          {p.image && (
            <a href={p.image} target="_blank" rel="noopener" className="promo-img" aria-label={`ดูภาพเต็ม: ${p.title}`}>
              <Image src={p.image} alt={p.imageAlt || p.title} width={960} height={960} sizes="(min-width: 900px) 440px, 100vw" style={{ width: "100%", height: "auto" }} priority={i === 0} />
            </a>
          )}
          <div className="promo-body">
            <h3>{p.title}</h3>
            <p className="promo-meta">
              {BR[p.branches] ?? "ทั้งสาขาอุดรธานีและหนองคาย"}
              {p.endsAt ? ` · ถึง ${until(p.endsAt)}` : ""}
            </p>
            {p.details ? <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.details).html }} /> : p.summary && <p>{p.summary}</p>}
            <p className="promo-note">ราคาและเงื่อนไขเป็นไปตามที่ร้านกำหนด สอบถามรายละเอียดเพิ่มเติมกับแอดมินได้ทุกช่องทาง</p>
          </div>
        </article>
      ))}
    </section>
  );
}
