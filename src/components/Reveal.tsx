"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** เอฟเฟกต์ค่อย ๆ ปรากฏเมื่อเลื่อนถึง — ซ่อนเฉพาะสิ่งที่อยู่ใต้จอ เนื้อหาจึงไม่หายสำหรับ bot หรือคนที่ปิด JS
 *  ใช้ข้อมูลตำแหน่งจาก IntersectionObserver แทนการอ่าน layout เอง (ไม่เกิด forced reflow ตอนโหลดหน้า) */
export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          const el = e.target;
          if (e.isIntersecting) {
            if (el.classList.contains("pre")) el.classList.add("in");
            io.unobserve(el);
          } else if (!el.classList.contains("pre") && e.boundingClientRect.top > 0) {
            el.classList.add("pre"); // อยู่ใต้จอ: ซ่อนไว้รอเลื่อนถึง
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    const scan = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-rv])").forEach((el) => {
        el.setAttribute("data-rv", "");
        io.observe(el);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [path]);
  return null;
}
