"use client";
import { useActionState } from "react";
import { savePrivacy } from "@/app/admin/actions";
import MarkdownField from "./MarkdownField";
import SubmitButton from "./SubmitButton";

export default function PrivacyForm({ md, custom }: { md: string; custom: boolean }) {
  const [state, action] = useActionState(savePrivacy, undefined);
  return (
    <form action={action} className="panel card">
      <h2>นโยบายความเป็นส่วนตัว <a href="/privacy" target="_blank" style={{ fontSize: 13, fontWeight: 400, textDecoration: "underline" }}>ดูหน้าเว็บ ↗</a></h2>
      <p className="hint">{custom ? "แก้ไขแล้ว" : "ตอนนี้ใช้ร่างตั้งต้นที่ระบบเตรียมไว้"} — แสดงที่ /privacy · เป็นร่างตามการทำงานจริงของเว็บ ควรให้ผู้รู้ด้านกฎหมายตรวจก่อนถือเป็นฉบับทางการ</p>
      {state?.error && <div className="flash err">{state.error}</div>}
      {state && "ok" in state && state.ok && <div className="flash ok">บันทึกแล้ว</div>}
      <MarkdownField name="privacy" label="เนื้อหา" defaultValue={md} minHeight={360} />
      <label className="check"><input type="checkbox" name="useDefault" /> กลับไปใช้ร่างตั้งต้นของระบบ</label>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><SubmitButton>บันทึกนโยบาย</SubmitButton></div>
    </form>
  );
}
