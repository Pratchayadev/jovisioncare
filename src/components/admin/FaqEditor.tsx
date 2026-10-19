"use client";
import { useEffect, useRef, useState } from "react";
import type { Faq } from "@/lib/faq";

export default function FaqEditor({ initial, hint }: { initial: Faq[]; hint?: string }) {
  const [items, setItems] = useState<Faq[]>(initial);
  const ref = useRef<HTMLInputElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    ref.current?.dispatchEvent(new Event("input", { bubbles: true })); // ให้ตัวตรวจ SEO อัปเดต
  }, [items]);
  const set = (i: number, k: keyof Faq, v: string) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div className="panel card">
      <h2>คำถามที่พบบ่อย (FAQ)</h2>
      <p className="hint">{hint ?? "แสดงท้ายหน้าแบบกดเปิดอ่าน และส่งให้ Google เป็นข้อมูล FAQ"}</p>
      <input ref={ref} type="hidden" name="faq" value={JSON.stringify(items.filter((x) => x.q.trim() || x.a.trim()))} />
      {items.map((x, i) => (
        <div key={i} className="faq-row">
          <label className="fld"><span>คำถาม {i + 1}</span><input type="text" value={x.q} onChange={(e) => set(i, "q", e.target.value)} placeholder="เช่น ตัดแว่นใช้เวลากี่วัน?" /></label>
          <label className="fld"><span>คำตอบ</span><textarea value={x.a} onChange={(e) => set(i, "a", e.target.value)} style={{ minHeight: 70 }} /></label>
          <button type="button" className="btn-a sm" onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))}>ลบข้อนี้</button>
        </div>
      ))}
      <button type="button" className="btn-a" onClick={() => setItems((xs) => [...xs, { q: "", a: "" }])}>+ เพิ่มคำถาม</button>
    </div>
  );
}
