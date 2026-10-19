import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import JsonLd from "@/components/JsonLd";
import { getPublishedArticles } from "@/lib/queries";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { breadcrumbNode } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "บทความเรื่องแว่นตาและสุขภาพสายตา",
  description: "ความรู้เรื่องแว่นตา เลนส์ และการดูแลสายตา จากร้านแว่น J.O. Vision Care อุดรธานีและหนองคาย",
  alternates: { canonical: "/articles" },
};

export default async function ArticlesPage() {
  const items = await getPublishedArticles();
  const crumbs = [{ name: "หน้าแรก", url: "/" }, { name: "บทความ", url: "/articles" }];
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [breadcrumbNode(crumbs), { "@type": "Blog", "@id": `${SITE_URL}/articles#blog`, name: "บทความ J.O. Vision Care", url: absoluteUrl("/articles"), inLanguage: "th-TH", blogPost: items.map((a) => ({ "@type": "BlogPosting", headline: a.title, url: absoluteUrl(`/articles/${a.slug}`) })) }] }} />
      <div className="page-head">
        <ol className="crumbs"><li><Link href="/">หน้าแรก</Link></li><li aria-current="page">บทความ</li></ol>
        <p className="eyebrow">JOURNAL</p>
        <h1 className="h2">บทความเรื่องแว่นตาและสายตา</h1>
        <p className="lead">เลือกเลนส์ เลือกกรอบ และดูแลสายตาให้ถูกวิธี จากทีมงาน J.O. Vision Care</p>
      </div>
      <div className="page-body">
        <div className="grid-articles">{items.map((a) => <ArticleCard key={a.id} a={a} h="h2" />)}</div>
        {!items.length && <p className="empty">ยังไม่มีบทความ</p>}
      </div>
    </>
  );
}
