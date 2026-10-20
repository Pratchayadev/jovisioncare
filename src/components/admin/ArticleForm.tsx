"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveArticle } from "@/app/admin/actions";
import SubmitButton from "./SubmitButton";
import SeoFields from "./SeoFields";
import SeoCheck from "./SeoCheck";
import FaqEditor from "./FaqEditor";
import MarkdownField from "./MarkdownField";
import { compressInput } from "./compressImages";
import { parseFaq } from "@/lib/faq";
import type { Article } from "@/db/schema";

const TEMPLATE = `เกริ่นนำ 2–3 ประโยค: ปัญหาที่ผู้อ่านเจอ และบทความนี้จะช่วยอะไร

## หัวข้อที่ 1
อธิบาย…

## หัวข้อที่ 2
- ข้อดี…
- ข้อควรรู้…

## สรุป
สรุปสั้น ๆ แล้วชวนมาลองที่ร้าน [สาขาอุดรธานี](/udon-thani) หรือ [สาขาหนองคาย](/nong-khai)`;

export default function ArticleForm({ article: a, host }: { article?: Article; host: string }) {
  const [state, action] = useActionState(saveArticle, undefined);
  const [title, setTitle] = useState(a?.title ?? "");
  const [slug, setSlug] = useState(a?.slug ?? "");
  const [excerpt, setExcerpt] = useState(a?.excerpt ?? "");
  const [cover, setCover] = useState<string | null>(a?.cover ?? null);
  const [busy, setBusy] = useState(false);

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    setBusy(true);
    await compressInput(input);
    setBusy(false);
    const f = input.files?.[0];
    if (f) setCover(URL.createObjectURL(f));
  }

  return (
    <form action={action} className="form">
      {a && <input type="hidden" name="id" value={a.id} />}
      {a?.cover && <input type="hidden" name="currentCover" value={a.cover} />}
      {state?.error && <div className="flash err" role="alert">{state.error}</div>}
      <div className="form-grid">
        <div className="form">
          <div className="panel card">
            <h2>บทความ</h2>
            <label className="fld"><span>ชื่อบทความ *</span><input type="text" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น เลนส์ Progressive คืออะไร เหมาะกับใคร" /><small>ใส่คำที่ลูกค้าพิมพ์ค้นหาจริง ๆ ไว้ในชื่อ</small></label>
            <label className="fld"><span>คำโปรย</span><textarea name="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="สรุป 1–2 ประโยค แสดงใต้ชื่อบทความและในหน้ารวมบทความ" style={{ minHeight: 70 }} /></label>
            <MarkdownField name="content" label="เนื้อหา" defaultValue={a?.content || (a ? "" : TEMPLATE)} minHeight={460} />
          </div>
          <FaqEditor initial={parseFaq(a?.faq)} hint="คำถามสั้น ๆ ที่เกี่ยวกับเรื่องในบทความ แสดงท้ายบทความ" />
          <SeoFields path={`${host}/articles/${slug || "…"}`} defTitle={title || "ชื่อบทความ"} defDesc={excerpt || "ประโยคแรกของบทความ"} metaTitle={a?.metaTitle} metaDescription={a?.metaDescription} />
        </div>
        <div className="form">
          <SeoCheck kind="article" />
          <div className="panel card">
            <h2>การเผยแพร่</h2>
            <label className="check"><input type="checkbox" name="published" defaultChecked={a?.published ?? false} /> เผยแพร่บนเว็บไซต์</label>
            <label className="fld"><span>วันเวลาเผยแพร่</span><input type="datetime-local" name="publishedAt" defaultValue={a?.publishedAt ? new Date(a.publishedAt.getTime() + 7 * 3600e3).toISOString().slice(0, 16) : ""} />
              <small>เว้นว่าง = เผยแพร่ทันทีที่ติ๊ก “เผยแพร่” · ตั้งเป็นวันในอนาคตเพื่อตั้งเวลาลงบทความ (ขึ้นเว็บภายในราว 1 ชั่วโมงหลังถึงเวลา)</small></label>
          </div>
          <div className="panel card">
            <h2>รูปปก</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {cover && <img src={cover} alt="" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 10 }} />}
            <input type="file" name="cover" accept="image/*" onChange={onCover} />
            {busy && <small>กำลังย่อรูป…</small>}
            <label className="fld"><span>คำอธิบายรูปปก (alt)</span><input type="text" name="coverAlt" defaultValue={a?.coverAlt ?? ""} placeholder="เช่น ลูกค้าลองแว่นที่ร้าน J.O. Vision Care อุดรธานี" /></label>
            {a?.cover && <label className="check"><input type="checkbox" name="removeCover" onChange={(e) => setCover(e.target.checked ? null : a.cover)} /> ลบรูปปก</label>}
            <small style={{ color: "var(--muted)" }}>แนวนอน 16:9 · ใช้เป็นภาพตอนแชร์ใน LINE / Facebook ด้วย</small>
          </div>
          <div className="panel card">
            <h2>URL</h2>
            <label className="fld"><span>Slug</span><input type="text" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="สร้างจากชื่อบทความ" />
              <small>แนะนำภาษาอังกฤษสั้น ๆ เช่น progressive-lens — เปลี่ยนภายหลังได้ ลิงก์เก่าจะพาไปหน้าใหม่ให้อัตโนมัติ</small></label>
          </div>
        </div>
      </div>
      <div className="sticky-save">
        <Link href="/admin/articles" className="btn-a">ยกเลิก</Link>
        {a?.published && <Link href={`/articles/${a.slug}`} target="_blank" className="btn-a">ดูหน้าเว็บ ↗</Link>}
        <SubmitButton disabled={busy}>{a ? "บันทึก" : "สร้างบทความ"}</SubmitButton>
      </div>
    </form>
  );
}
