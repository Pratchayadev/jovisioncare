"use client";
import Link from "next/link";
import { useEffect } from "react";
import ProductGallery from "./ProductGallery";
import AskButtons from "./AskButtons";
import { defaultProductDesc } from "@/lib/site";
import type { ProductCard } from "@/lib/queries";
import type { Contact } from "@/lib/contact";

export default function ProductSheet({ p, c, onClose }: { p: ProductCard; c: Contact; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; removeEventListener("keydown", onKey); };
  }, [onClose]);
  return (
    <div className="sheet-bg" role="dialog" aria-modal="true" aria-label={`${p.brand} ${p.name}`} onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <span className="sheet-brand">{p.brand}</span>
            <span className="sheet-name">{p.name}</span>
          </div>
          <button type="button" className="icon-btn" aria-label="ปิด" onClick={onClose} autoFocus>✕</button>
        </div>
        <ProductGallery images={p.images} />
        <p className="sheet-desc">{p.description || defaultProductDesc}</p>
        <AskButtons p={p} c={c} />
        <Link href={`/products/${p.slug}`} className="sheet-more">ดูรายละเอียดสินค้า →</Link>
      </div>
    </div>
  );
}
