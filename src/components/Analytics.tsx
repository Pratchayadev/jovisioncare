"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { contactMethod, GA_ID, track } from "@/lib/analytics";

/** GA4 + นับการกดช่องทางติดต่อ (โทร/LINE/แผนที่/Facebook/IG/TikTok) เป็น event "contact_click"
 *  โหลดเฉพาะบนโดเมนจริง — ไม่นับ localhost และ preview ของ Vercel */
export default function Analytics() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!GA_ID || !/(^|\.)jovisioncare\.com$/.test(location.hostname)) return;
    setOn(true);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const method = contactMethod(a.getAttribute("href") || "");
      if (!method) return;
      const ctx = (attr: string) => (a.closest(`[${attr}]`) as HTMLElement | null)?.getAttribute(attr) || undefined;
      track("contact_click", {
        method,
        area: ctx("data-track-area") || "other",
        branch: ctx("data-track-branch"),
        product_code: ctx("data-track-product"),
        link_url: a.href,
        page_path: location.pathname,
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!on) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      <Script id="ga-init" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  );
}
