"use client";
import { useActionState, useEffect, useRef } from "react";
import { saveRedirect } from "@/app/admin/actions";
import SubmitButton from "./SubmitButton";

export default function RedirectForm() {
  const [state, action] = useActionState(saveRedirect, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="fld-row" style={{ alignItems: "end" }}>
      <label className="fld"><span>URL เก่า</span><input type="text" name="from" required placeholder="/old-page หรือวางลิงก์เต็ม" /></label>
      <label className="fld"><span>ไปที่</span><input type="text" name="to" required placeholder="/udon-thani" /></label>
      <SubmitButton>เพิ่ม</SubmitButton>
      {state?.error && <div className="flash err" style={{ gridColumn: "1/-1", margin: 0 }}>{state.error}</div>}
      {state?.ok && <div className="flash ok" style={{ gridColumn: "1/-1", margin: 0 }}>เพิ่มแล้ว</div>}
    </form>
  );
}
