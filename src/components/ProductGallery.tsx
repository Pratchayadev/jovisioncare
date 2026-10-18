"use client";
import Image from "next/image";
import { useRef, useState } from "react";

type Img = { url: string; alt: string };

export default function ProductGallery({ images, priority = false }: { images: Img[]; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const n = images.length;
  const go = (k: number) => {
    const el = ref.current; if (!el) return;
    k = Math.max(0, Math.min(n - 1, k));
    el.scrollTo({ left: k * el.clientWidth, behavior: "smooth" });
    setI(k);
  };
  if (!n) return <div className="slides" style={{ background: "var(--stripes)" }} />;
  return (
    <div>
      <div className="gallery">
        <div
          ref={ref}
          className="slides"
          onScroll={(e) => { const el = e.currentTarget; const k = Math.round(el.scrollLeft / el.clientWidth); if (k !== i) setI(k); }}
          onKeyDown={(e) => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }}
          tabIndex={0}
          aria-roledescription="carousel"
        >
          {images.map((g, k) => (
            <div className="slide" key={g.url + k} aria-label={`ภาพที่ ${k + 1} จาก ${n}`}>
              <Image src={g.url} alt={g.alt} fill sizes="(min-width: 720px) 560px, 100vw" priority={priority && k === 0} draggable={false} />
            </div>
          ))}
        </div>
        <span className="g-count">{i + 1} / {n}</span>
        {n > 1 && (
          <>
            <button type="button" className="g-nav prev" aria-label="ภาพก่อนหน้า" onClick={() => go(i - 1)} disabled={i === 0}>‹</button>
            <button type="button" className="g-nav next" aria-label="ภาพถัดไป" onClick={() => go(i + 1)} disabled={i === n - 1}>›</button>
            <div className="g-dots">
              {images.map((_, k) => <button type="button" key={k} className={k === i ? "on" : ""} aria-label={`ภาพที่ ${k + 1}`} onClick={() => go(k)} />)}
            </div>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="thumbs">
          {images.map((g, k) => (
            <button type="button" key={g.url + k} className={k === i ? "on" : ""} aria-label={g.alt} onClick={() => go(k)}>
              <Image src={g.url} alt="" fill sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
