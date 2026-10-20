import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { FaqList } from "@/components/Prose";
import { getPublishedServices, getServiceBySlug, serviceHref } from "@/lib/queries";
import { redirectOrNotFound } from "@/lib/redirects";
import { plainText, renderMarkdown } from "@/lib/markdown";
import { faqNode, parseFaq } from "@/lib/faq";
import { absoluteUrl, clip } from "@/lib/site";
import { breadcrumbNode, organizationNode } from "@/lib/seo";
import { serviceNode, servesBranch } from "@/lib/service-seo";
import { getBranches, getContact } from "@/lib/settings";

export const revalidate = 3600;
export const generateStaticParams = async () => [] as { slug: string }[];
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getServiceBySlug(decodeURIComponent((await params).slug));
  if (!s) return {};
  const title = s.metaTitle || s.title;
  const description = s.metaDescription || clip(s.summary || plainText(s.content));
  return { title, description, alternates: { canonical: `/services/${s.slug}` }, openGraph: { title, description, url: `/services/${s.slug}` } };
}

export default async function ServicePage({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);
  const s = await getServiceBySlug(slug);
  if (!s) return redirectOrNotFound(`/services/${slug}`);
  const [all, branches, c] = await Promise.all([getPublishedServices(), getBranches(), getContact()]);
  const at = branches.filter((b) => servesBranch(s, b.id));
  const others = all.filter((x) => x.id !== s.id && x.hasPage);
  const { html, headings } = renderMarkdown(s.content);
  const faq = parseFaq(s.faq);
  const url = absoluteUrl(`/services/${s.slug}`);
  const crumbs = [{ name: "หน้าแรก", url: "/" }, { name: "บริการ", url: "/services" }, { name: s.title, url: `/services/${s.slug}` }];

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [serviceNode(s, branches, url), organizationNode(c), breadcrumbNode(crumbs), ...(faq.length ? [faqNode(faq)] : [])] }} />
      <article className="article">
        <header className="page-head article-head">
          <ol className="crumbs"><li><Link href="/">หน้าแรก</Link></li><li><Link href="/services">บริการ</Link></li><li aria-current="page">{s.title}</li></ol>
          <p className="eyebrow">SERVICE</p>
          <h1 className="h2">{s.title}</h1>
          {s.summary && <p className="lead">{s.summary}</p>}
          <p className="article-meta">ให้บริการที่ {at.map((b) => <Link key={b.id} href={b.path} style={{ textDecoration: "underline" }}>สาขา{b.province}</Link>).reduce<React.ReactNode[]>((a, x, i) => (i ? [...a, " · ", x] : [x]), [])}</p>
        </header>
        <div className="page-body article-body">
          {headings.length >= 4 && (
            <nav className="toc" aria-label="สารบัญ">
              <b>ในหน้านี้</b>
              <ol>{headings.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol>
            </nav>
          )}
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          {faq.length > 0 && <FaqList items={faq} />}
          <aside className="article-cta" data-track-area="service">
            <b>สนใจ{s.title}?</b>
            <p>แวะมาที่ร้าน หรือทักถามแอดมินก่อนได้เลย</p>
            <div className="row-btns">
              {at.map((b) => <Link key={b.id} href={b.path} className="pill solid" data-track-branch={b.id}>สาขา{b.province}</Link>)}
              {c.phone && <a href={`tel:${c.phoneIntl}`} className="pill">โทร {c.phone}</a>}
            </div>
          </aside>
        </div>
      </article>
      {others.length > 0 && (
        <section className="page-body related" aria-labelledby="svc-others" style={{ paddingTop: 0 }}>
          <h2 id="svc-others">บริการอื่นของร้าน</h2>
          <ul className="svc-links">
            {others.map((x) => <li key={x.id}><Link href={serviceHref(x)}><b>{x.title}</b>{x.summary && <span>{x.summary}</span>}</Link></li>)}
          </ul>
        </section>
      )}
    </>
  );
}
