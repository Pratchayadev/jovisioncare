"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveService } from "@/app/admin/actions";
import SubmitButton from "./SubmitButton";
import SeoFields from "./SeoFields";
import SeoCheck from "./SeoCheck";
import FaqEditor from "./FaqEditor";
import MarkdownField from "./MarkdownField";
import { parseFaq } from "@/lib/faq";
import type { Service } from "@/db/schema";

export default function ServiceForm({ service: s, host }: { service?: Service; host: string }) {
  const [state, action] = useActionState(saveService, undefined);
  const [title, setTitle] = useState(s?.title ?? "");
  const [slug, setSlug] = useState(s?.slug ?? "");
  const [summary, setSummary] = useState(s?.summary ?? "");
  const [hasPage, setHasPage] = useState(s?.hasPage ?? true);
  return (
    <form action={action} className="form">
      {s && <input type="hidden" name="id" value={s.id} />}
      {state?.error && <div className="flash err" role="alert">{state.error}</div>}
      <div className="form-grid">
        <div className="form">
          <div className="panel card">
            <h2>บริการ</h2>
            <label className="fld"><span>ชื่อบริการ *</span><input type="text" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น เลนส์โปรเกรสซีฟ" /><small>ใช้เป็นหัวข้อหลัก (H1) ของหน้า</small></label>
            <label className="fld"><span>คำอธิบายสั้น</span><textarea name="summary" value={summary} onChange={(e) => setSummary(e.target.value)} style={{ minHeight: 70 }} placeholder="1–2 ประโยค แสดงในรายการบริการ หน้าสาขา และใต้หัวข้อ" /></label>
            <label className="check"><input type="checkbox" name="hasPage" checked={hasPage} onChange={(e) => setHasPage(e.target.checked)} /> มีหน้าของตัวเอง (/services/{slug || "…"})</label>
            {!hasPage && (
              <label className="fld"><span>ลิงก์ปลายทาง *</span><input type="text" name="linkUrl" defaultValue={s?.linkUrl ?? ""} placeholder="/category/sunglasses" />
                <small>ใช้กับบริการที่มีหน้าอยู่แล้ว เช่น หมวดสินค้า หรือ /brands — ไม่สร้างหน้าซ้ำ</small></label>
            )}
            <div style={{ display: hasPage ? undefined : "none" }}>
              <MarkdownField name="content" label="เนื้อหาหน้า" defaultValue={s?.content} minHeight={420}
                placeholder={"เกริ่นนำ: ปัญหาที่ลูกค้าเจอ\n\n## บริการนี้คืออะไร\n…\n\n## เหมาะกับใคร\n- …\n\n## ขั้นตอน / ข้อควรรู้\n…\n\nใช้บริการได้ที่ [สาขาอุดรธานี](/udon-thani) และ [สาขาหนองคาย](/nong-khai)"} />
            </div>
          </div>
          {hasPage && <FaqEditor initial={parseFaq(s?.faq)} hint="คำถามที่ลูกค้าถามบ่อยเกี่ยวกับบริการนี้ — ห้ามใส่ราคาหรือเงื่อนไขที่ร้านยังไม่ได้ยืนยัน" />}
          {hasPage && <SeoFields path={`${host}/services/${slug || "…"}`} defTitle={title || "ชื่อบริการ"} defDesc={summary || "คำอธิบายสั้น"} metaTitle={s?.metaTitle} metaDescription={s?.metaDescription} />}
        </div>
        <div className="form">
          <SeoCheck kind="service" />
          <div className="panel card">
            <h2>การแสดงผล</h2>
            <label className="check"><input type="checkbox" name="published" defaultChecked={s?.published ?? true} /> แสดงบนเว็บไซต์</label>
            <label className="fld"><span>สาขาที่ให้บริการ</span>
              <select name="branches" defaultValue={s?.branches ?? "all"}>
                <option value="all">ทั้งสองสาขา</option>
                <option value="udon">เฉพาะสาขาอุดรธานี</option>
                <option value="nongkhai">เฉพาะสาขาหนองคาย</option>
              </select>
              <small>หน้าสาขาจะแสดงเฉพาะบริการที่สาขานั้นมี</small></label>
            <label className="fld"><span>ลำดับการแสดง</span><input type="number" name="sortOrder" defaultValue={s?.sortOrder ?? 0} /></label>
          </div>
          <div className="panel card">
            <h2>URL</h2>
            <label className="fld"><span>Slug</span><input type="text" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ภาษาอังกฤษสั้น ๆ เช่น progressive-lens" />
              <small>เปลี่ยนภายหลังได้ ลิงก์เก่าจะพาไปหน้าใหม่อัตโนมัติ</small></label>
          </div>
        </div>
      </div>
      <div className="sticky-save">
        <Link href="/admin/services" className="btn-a">ยกเลิก</Link>
        {s?.published && s.hasPage && <Link href={`/services/${s.slug}`} target="_blank" className="btn-a">ดูหน้าเว็บ ↗</Link>}
        <SubmitButton>{s ? "บันทึก" : "เพิ่มบริการ"}</SubmitButton>
      </div>
    </form>
  );
}
