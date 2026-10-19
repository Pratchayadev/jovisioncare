"use client";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

/** ปุ่มลบสองจังหวะ: กดครั้งแรกเพื่อยืนยัน กดอีกครั้งภายใน 4 วินาทีจึงลบจริง */
function Btn({ label }: { label: string }) {
  const [armed, setArmed] = useState(false);
  const { pending } = useFormStatus();
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 4000); return () => clearTimeout(t); }, [armed]);
  return (
    <button
      type="submit"
      className={"btn-a sm danger" + (armed ? " armed" : "")}
      disabled={pending}
      onClick={(e) => { if (!armed) { e.preventDefault(); setArmed(true); } }}
    >
      {pending ? "กำลังลบ…" : armed ? "ยืนยันลบ?" : label}
    </button>
  );
}

export default function ConfirmDelete({ action, id, label = "ลบ" }: { action: (f: FormData) => Promise<void>; id: number | string; label?: string }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Btn label={label} />
    </form>
  );
}
