import Image from "next/image";
import Link from "next/link";
import type { ProductCard as P } from "@/lib/queries";

export default function ProductCard({ p, onOpen, priority }: { p: P; onOpen?: (p: P) => void; priority?: boolean }) {
  const cover = p.images[0];
  return (
    <Link
      href={`/products/${p.slug}`}
      className="pcard"
      data-reveal=""
      onClick={onOpen ? (e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); onOpen(p); } : undefined}
    >
      <div className="pcard-img">
        {cover && <Image src={cover.url} alt={`${p.brand} ${p.name} ร้านแว่นอุดร หนองคาย`} fill sizes="(min-width: 1240px) 200px, (min-width: 700px) 25vw, 50vw" priority={priority} />}
        <span className="pcard-count">{p.images.length} ภาพ</span>
      </div>
      <div className="pcard-body">
        <span className="pcard-brand">{p.brand}</span>
        <span className="pcard-name">{p.name}</span>
        {p.tag && <span className="pcard-tag">{p.tag}</span>}
      </div>
    </Link>
  );
}
