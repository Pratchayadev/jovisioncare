"use client";
import { useState } from "react";

/** ช่องกรอก SEO พร้อมพรีวิวผลค้นหา Google */
export default function SeoFields({ path, defTitle, defDesc, metaTitle, metaDescription }: { path: string; defTitle: string; defDesc: string; metaTitle?: string | null; metaDescription?: string | null }) {
  const [t, setT] = useState(metaTitle ?? "");
  const [d, setD] = useState(metaDescription ?? "");
  const title = (t || defTitle) + " | J.O. Vision Care";
  const desc = d || defDesc;
  return (
    <div className="panel card">
      <h2>SEO</h2>
      <p className="hint">เว้นว่างได้ ระบบจะสร้างให้อัตโนมัติจากชื่อและรายละเอียด</p>
      <div className="serp" aria-label="ตัวอย่างผลการค้นหา">
        <span className="u">{path}</span>
        <span className="t">{title.length > 62 ? title.slice(0, 60) + "…" : title}</span>
        <span className="d">{desc.length > 160 ? desc.slice(0, 158) + "…" : desc}</span>
      </div>
      <label className="fld"><span>Meta title</span><input type="text" name="metaTitle" value={t} onChange={(e) => setT(e.target.value)} placeholder={defTitle} />
        <small className={"count" + (title.length > 60 ? " over" : "")}>{title.length}/60</small></label>
      <label className="fld"><span>Meta description</span><textarea name="metaDescription" value={d} onChange={(e) => setD(e.target.value)} placeholder={defDesc} style={{ minHeight: 80 }} />
        <small className={"count" + (desc.length > 160 ? " over" : "")}>{desc.length}/160</small></label>
    </div>
  );
}
