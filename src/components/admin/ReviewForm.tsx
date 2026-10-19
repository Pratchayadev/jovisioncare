"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveReview } from "@/app/admin/actions";
import SubmitButton from "./SubmitButton";
import { compressInput } from "./compressImages";
import type { Review } from "@/db/schema";

export default function ReviewForm({ review: r, branches, brands }: { review?: Review; branches: string[]; brands: string[] }) {
  const [state, action] = useActionState(saveReview, undefined);
  const [img, setImg] = useState<string | null>(r?.image ?? null);
  const [avatar, setAvatar] = useState<string | null>(r?.avatar ?? null);
  const [handle, setHandle] = useState(r?.handle ?? "");
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>, set: (u: string | null) => void) {
    const input = e.currentTarget;
    setBusy(true);
    await compressInput(input);
    setBusy(false);
    const f = input.files?.[0];
    set(f ? URL.createObjectURL(f) : null);
  }
  const shown = handle.replace(/^@+/, "") || "username";

  return (
    <form action={action} className="form">
      {r && <input type="hidden" name="id" value={r.id} />}
      {state?.error && <div className="flash err" role="alert">{state.error}</div>}
      <div className="form-grid">
        <div className="form">
          <div className="panel card">
            <h2>โพสต์ของลูกค้า</h2>
            <p className="hint">ใช้รูปจากโพสต์ที่ลูกค้าแท็กร้านจริง และควรขออนุญาตลูกค้าก่อนนำมาแสดง</p>
            <label className="fld"><span>ชื่อ IG ลูกค้า *</span>
              <input type="text" name="handle" required value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="เช่น barayb หรือวางลิงก์โปรไฟล์ก็ได้" autoCapitalize="none" />
            </label>
            <label className="fld"><span>ลิงก์โพสต์ IG</span>
              <input type="text" name="postUrl" defaultValue={r?.postUrl ?? ""} placeholder="https://www.instagram.com/p/..." inputMode="url" />
              <small>กดการ์ดบนเว็บแล้วจะเปิดโพสต์นี้ ถ้าไม่ใส่จะเปิดโปรไฟล์ลูกค้า</small>
            </label>
            <div className="fld-row">
              <label className="fld"><span>แบรนด์กรอบ</span>
                <input type="text" name="brand" list="brand-list" defaultValue={r?.brand ?? ""} placeholder="เช่น BOLON" />
                <datalist id="brand-list">{brands.map((b) => <option key={b} value={b} />)}</datalist>
              </label>
              <label className="fld"><span>สาขา</span>
                <select name="branch" defaultValue={r?.branch ?? ""}>
                  <option value="">— ไม่ระบุ —</option>
                  {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </label>
            </div>
            <label className="fld"><span>แคปชัน</span>
              <textarea name="caption" defaultValue={r?.caption ?? ""} placeholder="ข้อความสั้น ๆ จากโพสต์ลูกค้า (เว้นว่างได้)" style={{ minHeight: 70 }} />
            </label>
          </div>
          <div className="panel card">
            <h2>รูปภาพ</h2>
            <div className="fld-row">
              <label className="fld"><span>รูปโพสต์ {r ? "" : "*"}</span>
                <input type="file" name="image" accept="image/*" onChange={(e) => pick(e, setImg)} />
                <small>แนะนำรูปสี่เหลี่ยมจัตุรัส ระบบจะครอปกลางภาพให้</small>
              </label>
              <label className="fld"><span>รูปโปรไฟล์ลูกค้า</span>
                <input type="file" name="avatar" accept="image/*" onChange={(e) => pick(e, setAvatar)} />
                {r?.avatar && <label className="check"><input type="checkbox" name="removeAvatar" /> ลบรูปโปรไฟล์</label>}
              </label>
            </div>
          </div>
        </div>
        <div className="form">
          <div className="panel card">
            <h2>ตัวอย่างบนเว็บ</h2>
            {/* eslint-disable @next/next/no-img-element */}
            <div className="ig-preview">
              <div className="h">
                <span className="ring">{avatar ? <img src={avatar} alt="" /> : <span>{shown.charAt(0).toUpperCase()}</span>}</span>
                <b>{shown}</b>
              </div>
              <div className="m">{img ? <img src={img} alt="" /> : <span>รูปโพสต์</span>}</div>
            </div>
            {busy && <small>กำลังย่อรูป…</small>}
          </div>
          <div className="panel card">
            <h2>การแสดงผล</h2>
            <label className="check"><input type="checkbox" name="published" defaultChecked={r?.published ?? true} /> แสดงบนเว็บไซต์</label>
            <label className="fld"><span>ลำดับ</span><input type="number" name="sortOrder" defaultValue={r?.sortOrder ?? 0} /><small>เลขน้อยแสดงก่อน</small></label>
          </div>
        </div>
      </div>
      <div className="sticky-save">
        <Link href="/admin/reviews" className="btn-a">ยกเลิก</Link>
        <SubmitButton disabled={busy}>{r ? "บันทึกการแก้ไข" : "เพิ่มรีวิว"}</SubmitButton>
      </div>
    </form>
  );
}
