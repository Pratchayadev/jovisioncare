"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action}>
      <h1>J.O. VISIONCARE</h1>
      <p>เข้าสู่ระบบหลังบ้าน</p>
      {state?.error && <div className="flash err">{state.error}</div>}
      <label className="fld"><span>ชื่อผู้ใช้</span><input type="text" name="username" autoComplete="username" required defaultValue="admin" /></label>
      <label className="fld"><span>รหัสผ่าน</span><input type="password" name="password" autoComplete="current-password" required autoFocus /></label>
      <button className="btn-a primary" disabled={pending} style={{ justifyContent: "center" }}>{pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</button>
    </form>
  );
}
