"use client";
import { useFormStatus } from "react-dom";
export default function SubmitButton({ children = "บันทึก", disabled }: { children?: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="btn-a primary" disabled={pending || disabled}>{pending ? "กำลังบันทึก…" : children}</button>;
}
