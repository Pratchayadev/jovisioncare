"use client";
import { useActionState, useMemo, useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import SubmitButton from "./SubmitButton";
import { buildContact, type ContactSettings } from "@/lib/contact";

const strip = (v: string, host: RegExp) => v.trim().replace(host, "").replace(/[/?#].*$/, "").replace(/^@+/, "");

function Out({ href }: { href: string | null }) {
  if (!href) return <small style={{ color: "var(--muted)" }}>— ซ่อนบนเว็บ —</small>;
  return <small>ลิงก์ที่ได้: <a href={href} target="_blank" rel="noopener" style={{ textDecoration: "underline", wordBreak: "break-all" }}>{href}</a></small>;
}

export default function SettingsForm({ s }: { s: ContactSettings }) {
  const [state, action] = useActionState(saveSettings, undefined);
  const [v, setV] = useState(s);
  const set = (k: keyof ContactSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((o) => ({ ...o, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const c = useMemo(
    () => buildContact({ ...v, igHandle: strip(v.igHandle, /^https?:\/\/(www\.)?instagram\.com\//i), tiktokHandle: strip(v.tiktokHandle, /^https?:\/\/(www\.)?tiktok\.com\/@?/i) }),
    [v],
  );

  return (
    <form action={action} className="form">
      {state?.error && <div className="flash err" role="alert">{state.error}</div>}
      {state && "ok" in state && state.ok && <div className="flash ok">บันทึกแล้ว — หน้าเว็บอัปเดตเรียบร้อย</div>}
      <div className="form-grid">
        <div className="form">
          <div className="panel card">
            <h2>LINE Official Account</h2>
            <label className="check"><input type="checkbox" name="lineEnabled" checked={v.lineEnabled} onChange={set("lineEnabled")} /> แสดงปุ่ม LINE บนเว็บไซต์</label>
            <div className="fld-row">
              <label className="fld"><span>LINE ID</span><input type="text" name="lineId" value={v.lineId} onChange={set("lineId")} placeholder="@jovisioncare" autoCapitalize="none" />
                <small>ใช้ส่งชื่อและรหัสสินค้าไปในแชทอัตโนมัติ</small></label>
              <label className="fld"><span>ลิงก์เพิ่มเพื่อน (ไม่บังคับ)</span><input type="text" name="lineUrl" value={v.lineUrl} onChange={set("lineUrl")} placeholder="https://lin.ee/xxxxxxx" inputMode="url" />
                <small>ดูได้ใน LINE OA Manager → เพิ่มเพื่อน · เว้นว่าง = สร้างจาก LINE ID</small></label>
            </div>
            <Out href={c.line} />
          </div>

          <div className="panel card">
            <h2>Facebook</h2>
            <label className="fld"><span>เพจสาขาอุดรธานี</span><input type="text" name="fbUdon" value={v.fbUdon} onChange={set("fbUdon")} inputMode="url" required /></label>
            <label className="fld"><span>เพจสาขาหนองคาย</span><input type="text" name="fbNongkhai" value={v.fbNongkhai} onChange={set("fbNongkhai")} inputMode="url" required /></label>
            <small style={{ color: "var(--muted)" }}>ปุ่ม Messenger ในหน้าสินค้าใช้เพจสาขาอุดรธานี</small>
          </div>

          <div className="panel card">
            <h2>Instagram และ TikTok</h2>
            <div className="fld-row">
              <label className="fld"><span>ชื่อ Instagram</span><input type="text" name="igHandle" value={v.igHandle} onChange={set("igHandle")} placeholder="jovisioncare หรือวางลิงก์โปรไฟล์" autoCapitalize="none" required />
                <Out href={c.ig} /></label>
              <label className="fld"><span>ชื่อ TikTok</span><input type="text" name="tiktokHandle" value={v.tiktokHandle} onChange={set("tiktokHandle")} placeholder="j.o.visioncare หรือวางลิงก์" autoCapitalize="none" required />
                <Out href={c.tiktok} /></label>
            </div>
          </div>
        </div>

        <div className="form">
          <div className="panel card">
            <h2>เบอร์โทร</h2>
            <label className="fld"><span>เบอร์โทรร้าน (ทั้ง 2 สาขา)</span><input type="text" name="phone" value={v.phone} onChange={set("phone")} placeholder="098-424-5224" inputMode="tel" />
              <small>เว้นว่าง = ซ่อนเบอร์โทรบนเว็บ</small></label>
            {c.phoneIntl && <small>สำหรับ Google: {c.phoneIntl}</small>}
          </div>
          <div className="panel card">
            <h2>ใช้ที่ไหนบ้าง</h2>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, color: "var(--muted)", fontSize: 13 }}>
              <li>แถบปุ่มติดต่อด้านล่างจอ</li>
              <li>ส่วน “TALK TO US” และการ์ดสาขา</li>
              <li>ปุ่มสอบถามในป๊อปอัปและหน้าสินค้า</li>
              <li>ข้อมูลร้านสำหรับ Google (sameAs, telephone)</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="sticky-save"><SubmitButton>บันทึกการตั้งค่า</SubmitButton></div>
    </form>
  );
}
