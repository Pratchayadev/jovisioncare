"use client";
import { useEffect, useRef, useState } from "react";
import { checkArticle, checkProduct, checkTaxonomy, score, type Check } from "@/lib/seo-check";

type Kind = "product" | "article" | "taxonomy";
const s = (f: FormData, k: string) => String(f.get(k) ?? "");
const faqCount = (f: FormData) => { try { return (JSON.parse(s(f, "faq") || "[]") as { q: string; a: string }[]).filter((x) => x.q.trim() && x.a.trim()).length; } catch { return 0; } };
const hasFile = (f: FormData, k: string) => f.getAll(k).some((x) => x instanceof File && x.size > 0);

function run(kind: Kind, form: HTMLFormElement): Check[] {
  const f = new FormData(form);
  if (kind === "product") {
    const del = f.getAll("deleteImage").map(String);
    const alts = [...f.keys()].filter((k) => k.startsWith("alt_") && !del.includes(k.slice(4)));
    const fresh = f.getAll("images").filter((x) => x instanceof File && x.size > 0).length;
    return checkProduct({
      name: s(f, "name"), description: s(f, "description"), price: s(f, "price"), categoryId: s(f, "categoryId"), brandId: s(f, "brandId"),
      images: alts.length + fresh, missingAlt: alts.filter((k) => !s(f, k).trim()).length,
      metaTitle: s(f, "metaTitle"), metaDescription: s(f, "metaDescription"),
    });
  }
  if (kind === "article")
    return checkArticle({
      title: s(f, "title"), excerpt: s(f, "excerpt"), content: s(f, "content"),
      cover: (!!s(f, "currentCover") && f.get("removeCover") !== "on") || hasFile(f, "cover"), coverAlt: s(f, "coverAlt"),
      metaTitle: s(f, "metaTitle"), metaDescription: s(f, "metaDescription"), faqCount: faqCount(f),
    });
  return checkTaxonomy({ name: s(f, "name"), description: s(f, "description"), content: s(f, "content"), faqCount: faqCount(f), metaTitle: s(f, "metaTitle"), metaDescription: s(f, "metaDescription") });
}

const icon = { ok: "✓", warn: "!", bad: "✕", tip: "i" };

/** ตรวจ SEO แบบสด ๆ จากค่าในฟอร์มที่ครอบอยู่ */
export default function SeoCheck({ kind }: { kind: Kind }) {
  const ref = useRef<HTMLDivElement>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    let timer = 0;
    const update = () => { clearTimeout(timer); timer = window.setTimeout(() => setChecks(run(kind, form)), 150); };
    update();
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    return () => { form.removeEventListener("input", update); form.removeEventListener("change", update); clearTimeout(timer); };
  }, [kind]);
  const sc = score(checks);
  const order = { bad: 0, warn: 1, tip: 2, ok: 3 };
  return (
    <div className="panel card seo-check" ref={ref}>
      <h2>ตรวจ SEO <span className={"seo-score " + (sc >= 80 ? "good" : sc >= 50 ? "mid" : "low")}>{checks.length ? sc : "–"}</span></h2>
      <ul>
        {[...checks].sort((a, b) => order[a.level] - order[b.level]).map((c) => (
          <li key={c.text} className={c.level}><b aria-hidden>{icon[c.level]}</b>{c.text}</li>
        ))}
      </ul>
    </div>
  );
}
