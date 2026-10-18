"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** เอฟเฟกต์ค่อย ๆ ปรากฏเมื่อเลื่อนถึง — ซ่อนเฉพาะสิ่งที่อยู่ใต้จอ เนื้อหาจึงไม่หายสำหรับ bot หรือคนที่ปิด JS */
export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    const scan = () =>
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-rv])").forEach((el) => {
        el.setAttribute("data-rv", "");
        if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("pre"); io.observe(el); }
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [path]);
  return null;
}
