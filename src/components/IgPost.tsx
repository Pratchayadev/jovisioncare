import Image from "next/image";
import type { Review } from "@/db/schema";

const Icon = ({ d, label }: { d: string; label: string }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-label={label} role="img" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const HEART = "M12 20.5s-7.5-4.6-9.3-9.3C1.4 7.8 3.6 4.5 7 4.5c2 0 3.6 1.2 5 3 1.4-1.8 3-3 5-3 3.4 0 5.6 3.3 4.3 6.7-1.8 4.7-9.3 9.3-9.3 9.3z";
const COMMENT = "M20.6 16.4A9 9 0 1 0 17 20l3.9 1-1-3.9z";
const SEND = "M22 3 9.5 13.5M22 3l-7 18-3.5-7.5L4 10z";
const SAVE = "M19 21l-7-5-7 5V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5z";

/** การ์ดรีวิวหน้าตาแบบโพสต์ IG — ข้อมูลจริงจาก /admin/reviews */
export default function IgPost({ r }: { r: Review }) {
  const href = r.postUrl || `https://www.instagram.com/${encodeURIComponent(r.handle)}`;
  const place = r.branch ? `J.O. Vision Care · ${r.branch}` : "J.O. Vision Care";
  return (
    <a href={href} target="_blank" rel="noopener" className="ig" data-reveal="" aria-label={`โพสต์ของ @${r.handle} บน Instagram`}>
      <div className="ig-head">
        <span className="ig-ring">
          {r.avatar ? (
            <Image src={r.avatar} alt="" width={64} height={64} className="ig-avatar" />
          ) : (
            <span className="ig-avatar ig-initial" aria-hidden="true">{r.handle.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <span className="ig-who">
          <b>{r.handle}</b>
          <small>{place}</small>
        </span>
        <span className="ig-more" aria-hidden="true">•••</span>
      </div>
      <div className="ig-media">
        <Image src={r.image} alt={`รีวิวจากลูกค้า @${r.handle}${r.brand ? ` ใส่กรอบแว่น ${r.brand}` : ""} ร้านแว่น J.O. Vision Care${r.branch ? ` ${r.branch}` : ""}`} fill sizes="(min-width: 900px) 300px, 82vw" />
      </div>
      <div className="ig-actions" aria-hidden="true">
        <Icon d={HEART} label="" />
        <Icon d={COMMENT} label="" />
        <Icon d={SEND} label="" />
        <span className="ig-save"><Icon d={SAVE} label="" /></span>
      </div>
      <p className="ig-caption">
        <b>{r.handle}</b>{" "}
        {r.caption || (r.brand ? `กรอบแว่น ${r.brand} จาก @jovisioncare` : "แว่นใหม่จาก @jovisioncare")}
        {r.brand && r.caption && <span className="ig-tag"> · กรอบ {r.brand}</span>}
      </p>
    </a>
  );
}
