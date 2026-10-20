"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { savePromotion } from "@/app/admin/actions";
import SubmitButton from "./SubmitButton";
import MarkdownField from "./MarkdownField";
import { compressInput } from "./compressImages";
import type { Promotion } from "@/db/schema";

const ymd = (d: Date | null | undefined) => (d ? new Date(d.getTime() + 7 * 3600e3).toISOString().slice(0, 10) : "");

export default function PromotionForm({ promo: p }: { promo?: Promotion }) {
  const [state, action] = useActionState(savePromotion, undefined);
  const [preview, setPreview] = useState<string | null>(p?.image ?? null);
  const [busy, setBusy] = useState(false);
  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    setBusy(true); await compressInput(input); setBusy(false);
    const f = input.files?.[0]; if (f) setPreview(URL.createObjectURL(f));
  }
  return (
    <form action={action} className="form">
      {p && <input type="hidden" name="id" value={p.id} />}
      {state?.error && <div className="flash err" role="alert">{state.error}</div>}
      <div className="form-grid">
        <div className="form">
          <div className="panel card">
            <h2>โปรโมชัน</h2>
            <label className="fld"><span>ชื่อโปรโมชัน *</span><input type="text" name="title" required defaultValue={p?.title} placeholder="เช่น กรอบไทเทเนียม พร้อมเลนส์กรองแสงสีฟ้า 1,700 บาท" /><small>ใส่ราคาหรือจุดเด่นในชื่อ — ใช้เป็นหัวข้อบนเว็บ</small></label>
            <div className="fld-row">
              <label className="fld"><span>ข้อความเด่น (แถบหน้าแรก)</span><input type="text" name="highlight" defaultValue={p?.highlight ?? ""} placeholder="1,700 บาท" /></label>
              <label className="fld"><span>หมดเขต</span><input type="date" name="endsAt" defaultValue={ymd(p?.endsAt)} /><small>เว้นว่าง = ไม่มีกำหนด · พ้นวันนี้แล้วซ่อนเอง</small></label>
            </div>
            <label className="fld"><span>สรุปสั้น</span><textarea name="summary" defaultValue={p?.summary ?? ""} style={{ minHeight: 60 }} /></label>
            <MarkdownField name="details" label="รายละเอียดและเงื่อนไข" defaultValue={p?.details} minHeight={240} placeholder={"- กรอบ…\n- เลนส์…\n- **ราคา … บาท**\n- เงื่อนไข…"} />
            <small style={{ color: "var(--muted)" }}>พิมพ์รายละเอียดในภาพเป็นตัวอักษรด้วย — Google อ่านข้อความในรูปไม่ได้</small>
          </div>
        </div>
        <div className="form">
          <div className="panel card">
            <h2>รูปโปรโมชัน</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview && <img src={preview} alt="" style={{ width: "100%", borderRadius: 10 }} />}
            <input type="file" name="image" accept="image/*" onChange={onPick} />
            {busy && <small>กำลังย่อรูป…</small>}
            <label className="fld"><span>คำอธิบายรูป (alt)</span><textarea name="imageAlt" defaultValue={p?.imageAlt ?? ""} style={{ minHeight: 70 }} placeholder="สรุปข้อความในรูป เช่น ชื่อโปร ราคา สาขา" /></label>
          </div>
          <div className="panel card">
            <h2>การแสดงผล</h2>
            <label className="check"><input type="checkbox" name="published" defaultChecked={p?.published ?? true} /> แสดงบนเว็บไซต์</label>
            <label className="check"><input type="checkbox" name="featured" defaultChecked={p?.featured ?? false} /> แสดงบนแถบโปรโมชันหน้าแรก</label>
            <label className="fld"><span>สาขา</span>
              <select name="branches" defaultValue={p?.branches ?? "all"}>
                <option value="all">ทั้งสองสาขา</option>
                <option value="udon">เฉพาะสาขาอุดรธานี</option>
                <option value="nongkhai">เฉพาะสาขาหนองคาย</option>
              </select></label>
            <label className="fld"><span>ลำดับ</span><input type="number" name="sortOrder" defaultValue={p?.sortOrder ?? 0} /></label>
          </div>
        </div>
      </div>
      <div className="sticky-save">
        <Link href="/admin/promotions" className="btn-a">ยกเลิก</Link>
        <SubmitButton disabled={busy}>{p ? "บันทึก" : "เพิ่มโปรโมชัน"}</SubmitButton>
      </div>
    </form>
  );
}
