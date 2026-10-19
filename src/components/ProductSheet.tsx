"use client";
import Link from "next/link";
import { useEffect } from "react";
import ProductGallery from "./ProductGallery";
import AskButtons from "./AskButtons";
import { track } from "@/lib/analytics";
import { productDesc } from "@/lib/site";
import type { ProductCard } from "@/lib/queries";
import type { Contact } from "@/lib/contact";

export default function ProductSheet({ p, c, onClose }: { p: ProductCard; c: Contact; onClose: () => void }) {
  useEffect(() => {
    track("view_item", { items: [{ item_id: p.code, item_name: p.name, item_brand: p.brand }] });
  }, [p.code, p.name, p.brand]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; removeEventListener("keydown", onKey); };
  }, [onClose]);
  return (
    <div className="sheet-bg" role="dialog" aria-modal="true" aria-label={`${p.brand} ${p.name}`} onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} data-track-area="product-sheet">
        <div className="sheet-head">
          <div>
            <span className="sheet-brand">{p.brand}</span>
            <span className="sheet-name">{p.name}</span>
          </div>
          <button type="button" className="icon-btn" aria-label="ปิด" onClick={onClose} autoFocus>✕</button>
        </div>
        <ProductGallery images={p.images} />
        <p className="sheet-desc">{productDesc(p)}</p>
        <AskButtons p={p} c={c} />
        <Link href={`/products/${p.slug}`} className="sheet-more">ดูรายละเอียดสินค้า →</Link>
      </div>
    </div>
  );
}
