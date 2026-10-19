import { renderMarkdown } from "@/lib/markdown";
import type { Faq } from "@/lib/faq";

export function Prose({ md, className = "" }: { md: string; className?: string }) {
  return <div className={"prose " + className} dangerouslySetInnerHTML={{ __html: renderMarkdown(md).html }} />;
}

export function FaqList({ items, title = "คำถามที่พบบ่อย" }: { items: Faq[]; title?: string }) {
  return (
    <section className="faq" aria-labelledby="faq-title">
      <h2 id="faq-title">{title}</h2>
      {items.map((f, i) => (
        <details key={i} open={i === 0}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </section>
  );
}
