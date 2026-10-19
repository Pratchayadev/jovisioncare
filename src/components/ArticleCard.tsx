import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/db/schema";
import { plainText } from "@/lib/markdown";
import { clip } from "@/lib/site";

export const thaiDate = (d: Date | null) => (d ? d.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }) : "");

export default function ArticleCard({ a, h = "h3" }: { a: Article; h?: "h2" | "h3" }) {
  const H = h;
  return (
    <Link href={`/articles/${a.slug}`} className="acard">
      <div className="acard-img">
        {a.cover ? <Image src={a.cover} alt={a.coverAlt || a.title} fill sizes="(max-width: 700px) 100vw, 400px" /> : <span aria-hidden>J.O.</span>}
      </div>
      <div className="acard-body">
        <time dateTime={a.publishedAt?.toISOString()}>{thaiDate(a.publishedAt)}</time>
        <H>{a.title}</H>
        <p>{clip(a.excerpt || plainText(a.content), 110)}</p>
      </div>
    </Link>
  );
}
