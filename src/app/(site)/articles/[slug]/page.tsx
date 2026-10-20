import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ArticleCard, { thaiDate } from "@/components/ArticleCard";
import JsonLd from "@/components/JsonLd";
import { FaqList } from "@/components/Prose";
import { getArticleBySlug, getPublishedArticles } from "@/lib/queries";
import { redirectOrNotFound } from "@/lib/redirects";
import { plainText, renderMarkdown } from "@/lib/markdown";
import { faqNode, parseFaq } from "@/lib/faq";
import { absoluteUrl, clip, site, shareMeta } from "@/lib/site";
import { breadcrumbNode, ORG_ID, organizationNode } from "@/lib/seo";
import { getContact } from "@/lib/settings";

export const revalidate = 3600;
export const generateStaticParams = async () => [] as { slug: string }[];
type Props = { params: Promise<{ slug: string }> };

const describe = (a: { excerpt: string | null; metaDescription: string | null; content: string }) => a.metaDescription || clip(a.excerpt || plainText(a.content));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getArticleBySlug(decodeURIComponent((await params).slug));
  if (!a) return {};
  const title = a.metaTitle || a.title;
  const description = describe(a);
  const url = `/articles/${a.slug}`;
  return {
    title, description,
    alternates: { canonical: url },
    ...shareMeta({ title, description, url, type: "article", publishedTime: a.publishedAt?.toISOString(), modifiedTime: a.updatedAt.toISOString(), image: a.cover ? { url: a.cover, alt: a.coverAlt || a.title } : null }),
  };
}

export default async function ArticlePage({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);
  const a = await getArticleBySlug(slug);
  if (!a) return redirectOrNotFound(`/articles/${slug}`);
  const [others, c] = await Promise.all([getPublishedArticles(4), getContact()]);
  const more = others.filter((x) => x.id !== a.id).slice(0, 3);
  const { html, headings } = renderMarkdown(a.content);
  const faq = parseFaq(a.faq);
  const url = absoluteUrl(`/articles/${a.slug}`);
  const minutes = Math.max(1, Math.round(plainText(a.content).length / 500));
  const crumbs = [{ name: "หน้าแรก", url: "/" }, { name: "บทความ", url: "/articles" }, { name: a.title, url: `/articles/${a.slug}` }];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              "@id": `${url}#article`,
              headline: a.title,
              description: describe(a),
              url,
              mainEntityOfPage: url,
              inLanguage: "th-TH",
              image: a.cover ? [absoluteUrl(a.cover)] : [absoluteUrl(site.ogImage)],
              datePublished: (a.publishedAt ?? a.createdAt).toISOString(),
              dateModified: a.updatedAt.toISOString(),
              author: { "@id": ORG_ID },
              publisher: { "@id": ORG_ID },
            },
            organizationNode(c),
            breadcrumbNode(crumbs),
            ...(faq.length ? [faqNode(faq)] : []),
          ],
        }}
      />
      <article className="article">
        <header className="page-head article-head">
          <ol className="crumbs"><li><Link href="/">หน้าแรก</Link></li><li><Link href="/articles">บทความ</Link></li><li aria-current="page">{a.title}</li></ol>
          <h1 className="h2">{a.title}</h1>
          <p className="article-meta"><time dateTime={a.publishedAt?.toISOString()}>{thaiDate(a.publishedAt)}</time> · อ่าน {minutes} นาที · โดยทีมงาน J.O. Vision Care</p>
          {a.excerpt && <p className="lead">{a.excerpt}</p>}
        </header>
        <div className="page-body article-body">
          {a.cover && (
            <div className="article-cover">
              <Image src={a.cover} alt={a.coverAlt || a.title} fill priority sizes="(max-width: 760px) 100vw, 760px" />
            </div>
          )}
          {headings.length >= 3 && (
            <nav className="toc" aria-label="สารบัญ">
              <b>ในบทความนี้</b>
              <ol>{headings.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol>
            </nav>
          )}
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          {faq.length > 0 && <FaqList items={faq} />}
          <aside className="article-cta" data-track-area="article">
            <b>อยากให้ช่วยเลือกแว่นหรือเลนส์?</b>
            <p>ตรวจวัดสายตาและลองกรอบได้ที่ร้าน หรือทักถามแอดมินได้เลย</p>
            <div className="row-btns">
              <Link href="/udon-thani" className="pill solid" data-track-branch="udon">สาขาอุดรธานี</Link>
              <Link href="/nong-khai" className="pill solid" data-track-branch="nongkhai">สาขาหนองคาย</Link>
              {c.phone && <a href={`tel:${c.phoneIntl}`} className="pill">โทร {c.phone}</a>}
            </div>
          </aside>
        </div>
      </article>
      {more.length > 0 && (
        <section className="page-body related" aria-labelledby="more-title" style={{ paddingTop: 0 }}>
          <h2 id="more-title">บทความอื่น</h2>
          <div className="grid-articles">{more.map((x) => <ArticleCard key={x.id} a={x} />)}</div>
        </section>
      )}
    </>
  );
}
