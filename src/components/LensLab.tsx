"use client";
import Image from "next/image";
import { useState } from "react";

const lensData = {
  clear: { th: "เลนส์ใส", en: "CLEAR / HMC", label: "เลนส์ใส", filter: "contrast(1.06) saturate(1.05)", tint: "rgba(0,0,0,0)", desc: "เลนส์มัลติโค้ท ลดแสงสะท้อน ภาพคมชัดเป็นธรรมชาติ เหมาะกับการใช้งานทุกวัน" },
  blue: { th: "กรองแสงสีฟ้า", en: "BLUE CUT", label: "Blue Cut", filter: "sepia(.18) saturate(1.05)", tint: "rgba(255,210,120,.16)", desc: "ลดแสงสีฟ้าจากจอมือถือและคอมพิวเตอร์ ช่วยให้ตาล้าน้อยลงเมื่อใช้งานจอนาน ๆ" },
  auto: { th: "ออโต้ปรับแสง", en: "PHOTOCHROMIC", label: "Auto (กลางแจ้ง)", filter: "brightness(.6) contrast(1.12)", tint: "rgba(60,48,42,.3)", desc: "อยู่ในร่มเป็นเลนส์ใส ออกแดดเปลี่ยนเป็นสีเข้มอัตโนมัติ ไม่ต้องพกแว่นกันแดดแยก" },
  polar: { th: "โพลาไรซ์", en: "POLARIZED", label: "Polarized", filter: "contrast(1.3) saturate(1.35) brightness(.9)", tint: "rgba(20,40,32,.08)", desc: "ตัดแสงสะท้อนจากถนน น้ำ และกระจก สีสันชัดขึ้น เหมาะกับการขับรถและกิจกรรมกลางแจ้ง" },
} as const;
type LensKey = keyof typeof lensData;

export default function LensLab() {
  const [lens, setLens] = useState<LensKey>("blue");
  const [split, setSplit] = useState(45);
  const L = lensData[lens];
  return (
    <section id="lens-lab" className="lens-lab dark" aria-labelledby="lens-title">
      <div className="wrap">
        <div className="lens-copy" data-reveal="">
          <p className="eyebrow">02 — LENS LAB</p>
          <h2 id="lens-title" className="h2">ลองมองผ่านเลนส์ ก่อนตัดสินใจ</h2>
          <p className="lead">เลือกชนิดเลนส์ แล้วเลื่อนแถบบนภาพเพื่อเทียบ ตาเปล่า กับ ผ่านเลนส์</p>
          <div className="lens-btns" role="group" aria-label="ชนิดเลนส์">
            {(Object.keys(lensData) as LensKey[]).map((k) => (
              <button key={k} type="button" className={"lens-btn" + (k === lens ? " on" : "")} aria-pressed={k === lens} onClick={() => setLens(k)}>
                <b>{lensData[k].th}</b>
                <span>{lensData[k].en}</span>
              </button>
            ))}
          </div>
          <p className="lens-desc" aria-live="polite">{L.desc}</p>
        </div>
        <div className="lens-view">
          <Image src="/images/store.jpg" alt="ตัวอย่างการมองผ่านเลนส์แต่ละชนิด" fill sizes="(min-width: 900px) 600px, 100vw" />
          <div className="lens-after" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
            <Image src="/images/store.jpg" alt="" fill sizes="(min-width: 900px) 600px, 100vw" style={{ filter: L.filter }} />
            <div className="lens-tint" style={{ background: L.tint }} />
          </div>
          <div className="lens-split" style={{ left: `${split}%` }} />
          <span className="lens-label l">ตาเปล่า</span>
          <span className="lens-label r">{L.label}</span>
          <input className="lens-range" type="range" min={0} max={100} value={split} onChange={(e) => setSplit(+e.target.value)} aria-label="เลื่อนเพื่อเปรียบเทียบเลนส์" />
        </div>
      </div>
    </section>
  );
}
