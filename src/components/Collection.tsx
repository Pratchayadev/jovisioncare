"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import ProductCard from "./ProductCard";
import ProductSheet from "./ProductSheet";
import type { ProductCard as P } from "@/lib/queries";

type Cat = { slug: string; name: string };

export default function Collection({ products, categories }: { products: P[]; categories: Cat[] }) {
  const [filter, setFilter] = useState("all");
  const [sel, setSel] = useState<P | null>(null);
  const close = useCallback(() => setSel(null), []);
  const shown = products.filter((p) => filter === "all" || p.categorySlug === filter);
  const usedCats = categories.filter((c) => products.some((p) => p.categorySlug === c.slug));
  const current = categories.find((c) => c.slug === filter);
  return (
    <>
      <div className="filters" role="group" aria-label="กรองตามหมวด">
        {[{ slug: "all", name: "ทั้งหมด" }, ...usedCats].map((c) => (
          <button key={c.slug} type="button" className="filter" aria-pressed={filter === c.slug} onClick={() => setFilter(c.slug)}>{c.name}</button>
        ))}
      </div>
      <div className="grid-products">
        {shown.map((p, i) => <ProductCard key={p.id} p={p} onOpen={setSel} priority={i < 2} />)}
      </div>
      {!shown.length && <p className="empty">ยังไม่มีสินค้าในหมวดนี้</p>}
      <Link className="more-link" href={current ? `/category/${current.slug}` : "/products"}>
        {current ? `ดู${current.name}ทั้งหมด →` : "ดูสินค้าทั้งหมด →"}
      </Link>
      {sel && <ProductSheet p={sel} onClose={close} />}
    </>
  );
}
