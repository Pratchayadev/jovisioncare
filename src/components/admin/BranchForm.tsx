"use client";
import { useActionState, useMemo, useState } from "react";
import { saveBranch } from "@/app/admin/actions";
import SubmitButton from "./SubmitButton";
import { buildBranch, DAYS, parseLatLng, type BranchId, type BranchSettings, type Day } from "@/lib/branches";

export default function BranchForm({ id, title, s }: { id: BranchId; title: string; s: BranchSettings }) {
  const [state, action] = useActionState(saveBranch, undefined);
  const [v, setV] = useState(s);
  const [ll, setLl] = useState(`${s.lat}, ${s.lng}`);
  const pos = parseLatLng(ll);
  const preview = useMemo(() => buildBranch(id, { ...v, lat: pos?.lat ?? v.lat, lng: pos?.lng ?? v.lng }), [id, v, pos?.lat, pos?.lng]);
  const set = (k: keyof BranchSettings) => (e: React.ChangeEvent<HTMLInputElement>) => setV((o) => ({ ...o, [k]: e.target.value }));
  const toggleDay = (d: Day) => setV((o) => ({ ...o, days: o.days.includes(d) ? o.days.filter((x) => x !== d) : [...o.days, d] }));

  return (
    <form action={action} className="panel card" style={{ gap: 12 }}>
      <input type="hidden" name="branchId" value={id} />
      <h2>{title}</h2>
      {state?.error && <div className="flash err" role="alert">{state.error}</div>}
      {state && "ok" in state && state.ok && <div className="flash ok">บันทึกแล้ว — หน้าเว็บและข้อมูลสำหรับ Google อัปเดตแล้ว</div>}
      <label className="fld"><span>ชื่อสถานที่ (สั้น ๆ)</span><input type="text" name="place" value={v.place} onChange={set("place")} required />
        <small>ใช้เป็นหัวข้อรูปบรรยากาศร้าน เช่น “เจริญศรีปาร์ค ริมหนองประจักษ์”</small></label>
      <label className="fld"><span>ที่อยู่ (ห้อง/อาคาร/ถนน/ซอย/จุดสังเกต)</span><input type="text" name="line1" value={v.line1} onChange={set("line1")} required /></label>
      <div className="fld-row">
        <label className="fld"><span>ตำบล (ไม่บังคับ)</span><input type="text" name="subdistrict" value={v.subdistrict} onChange={set("subdistrict")} /></label>
        <label className="fld"><span>อำเภอ</span><input type="text" name="district" value={v.district} onChange={set("district")} required /></label>
        <label className="fld"><span>จังหวัด</span><input type="text" name="province" value={v.province} onChange={set("province")} required /></label>
        <label className="fld"><span>รหัสไปรษณีย์</span><input type="text" name="postalCode" value={v.postalCode} onChange={set("postalCode")} inputMode="numeric" maxLength={5} required /></label>
      </div>
      <div className="fld-row">
        <label className="fld"><span>เปิด</span><input type="time" name="opens" value={v.opens} onChange={set("opens")} required /></label>
        <label className="fld"><span>ปิด</span><input type="time" name="closes" value={v.closes} onChange={set("closes")} required /></label>
      </div>
      <div className="fld"><span>วันที่เปิด</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {DAYS.map(([d, th]) => (
            <label key={d} className="check" style={{ border: "1px solid #d4d1cc", borderRadius: 999, padding: "6px 12px", background: v.days.includes(d) ? "var(--ink)" : "#fff", color: v.days.includes(d) ? "#fff" : "inherit" }}>
              <input type="checkbox" name="days" value={d} checked={v.days.includes(d)} onChange={() => toggleDay(d)} style={{ display: "none" }} />{th}
            </label>
          ))}
        </div>
      </div>
      <label className="fld"><span>พิกัด</span><input type="text" name="latlng" value={ll} onChange={(e) => setLl(e.target.value)} placeholder="17.418690, 102.785187 หรือวางลิงก์ Google Maps" required />
        <small style={{ color: pos ? undefined : "var(--red)" }}>
          {pos ? <>ปุ่มนำทางจะพาไปที่ <a href={`https://www.google.com/maps/search/?api=1&query=${pos.lat},${pos.lng}`} target="_blank" rel="noopener" style={{ textDecoration: "underline" }}>{pos.lat}, {pos.lng}</a> — กดเพื่อเช็กหมุด</> : "อ่านพิกัดไม่ได้ — ใน Google Maps กดค้างที่หมุดร้าน แล้วคัดลอกตัวเลขพิกัดมาวาง"}
        </small></label>
      <div style={{ background: "#f7f6f4", borderRadius: 10, padding: 12, fontSize: 13, lineHeight: 1.7 }}>
        <b>แสดงบนเว็บ:</b><br />{preview.addr}<br />{preview.daysLabel} {preview.hours}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><SubmitButton>บันทึกสาขา</SubmitButton></div>
    </form>
  );
}
