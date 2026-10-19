"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

/** Hero: ภาพร้านเบลอ + "เลนส์" วงกลมที่มองเห็นชัด ลากนิ้ว/เมาส์เพื่อเลื่อน */
export default function HeroLens({ effect = true }: { effect?: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const sharpRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !effect) return;
    let raf = 0, pend = false, touched = false, visible = true, started = false;
    let w = hero.clientWidth, h = hero.clientHeight;
    const t0 = performance.now();
    // เก็บขนาดไว้ ไม่ต้องอ่าน layout ทุกเฟรม (ลด forced reflow)
    const ro = new ResizeObserver(([e]) => { w = e.contentRect.width; h = e.contentRect.height; });
    ro.observe(hero);

    const setLens = (x: number, y: number) => {
      const rad = Math.max(70, Math.min(130, w * 0.15));
      if (sharpRef.current) sharpRef.current.style.clipPath = `circle(${rad}px at ${x}px ${y}px)`;
      const s = ringRef.current?.style;
      if (s) { s.width = s.height = rad * 2 + "px"; s.margin = `${-rad}px 0 0 ${-rad}px`; s.transform = `translate(${x}px,${y}px)`; }
    };
    const loop = () => {
      cancelAnimationFrame(raf);
      if (touched || !visible || !started) return;
      const t = (performance.now() - t0) / 1000;
      const ih = Math.max(h, w * 0.75) * 1.06;
      setLens(w * (0.5 + Math.sin(t * 0.45) * 0.32), ih * 0.08 + Math.sin(t * 0.9) * 8);
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      touched = true; cancelAnimationFrame(raf);
      const r = hero.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      if (pend) return; pend = true;
      requestAnimationFrame(() => { pend = false; setLens(cx, cy); });
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); });
    io.observe(hero);
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerdown", onMove);
    // เริ่มแอนิเมชันหลังหน้าโหลดเสร็จ ไม่แย่งเวลากับการแสดงผลครั้งแรก (LCP)
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const start = () => {
      started = true;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { touched = true; setLens(w * 0.5, h * 0.1); } else loop();
    };
    const idle = ric ? ric(start, { timeout: 2000 }) : window.setTimeout(start, 1200);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      if (!ric) clearTimeout(idle);
      hero.removeEventListener("pointermove", onMove); hero.removeEventListener("pointerdown", onMove);
    };
  }, [effect]);

  return (
    <section ref={heroRef} className="hero" aria-labelledby="hero-title">
      {/* พื้นหลังเบลอใช้รูปเล็ก (~10KB) ที่เบลอไว้แล้ว — โหลดเร็ว ไม่ต้องให้เบราว์เซอร์เบลอรูปใหญ่ */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/store-blur.jpg" alt="หน้าร้าน J.O. Vision Care ร้านแว่นอุดร" width={480} height={360} fetchPriority="high" decoding="async" className="hero-img blur" />
      <div ref={sharpRef} aria-hidden="true" style={{ position: "absolute", inset: 0, clipPath: "circle(80px at 50% 12%)", willChange: "clip-path" }}>
        <Image src="/images/store.jpg" alt="" fill loading="eager" sizes="100vw" className="hero-img" />
      </div>
      {effect && <div ref={ringRef} className="hero-ring" aria-hidden="true" />}
      <div className="hero-shade" />
      <div className="wrap hero-body">
        <p className="hero-kicker">OPTICAL STORE — UDON THANI / NONG KHAI</p>
        <h1 id="hero-title">
          ร้านแว่นอุดร<br />&amp; หนองคาย<br />
          <span className="display">SEE IT SHARP.</span>
        </h1>
        <p className="hero-lead">ตรวจวัดสายตาอย่างละเอียด เลือกกรอบแบรนด์แท้ และเลนส์ที่ใช่กับไลฟ์สไตล์ของคุณ ที่ J.O. Vision Care ทั้ง 2 สาขา</p>
        <div className="hero-ctas">
          <Link href="#collection" className="btn btn-light">ดูคอลเลกชัน</Link>
          <Link href="#branches" className="btn btn-ghost">สาขาใกล้คุณ</Link>
        </div>
        <p className="hero-hint">↔ ลากนิ้วบนภาพ เพื่อมองให้ชัดขึ้น</p>
      </div>
    </section>
  );
}
