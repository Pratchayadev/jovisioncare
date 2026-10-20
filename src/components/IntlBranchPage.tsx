import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "./JsonLd";
import CookieBanner, { CookieSettingsButton } from "./CookieBanner";
import { getBranches, getContact } from "@/lib/settings";
import { getBrands } from "@/lib/queries";
import { absoluteUrl, OG_DEFAULT, OG_NONGKHAI, paymentCards, shareMeta, storePhotos, storePhotosNongKhai } from "@/lib/site";
import { opticianId, opticianNode, organizationNode, ORG_ID } from "@/lib/seo";
import { BT, branchLanguages, daysText, intlPath, LANGS, phoneIntlPretty, T, type IntlBranch, type Lang } from "@/lib/intl";

const OG = { udon: OG_DEFAULT, nongkhai: OG_NONGKHAI };
const PHOTOS = { udon: storePhotos, nongkhai: storePhotosNongKhai };

async function load(id: IntlBranch) {
  const [branches, c, brands] = await Promise.all([getBranches(), getContact(), getBrands()]);
  return { b: branches.find((x) => x.id === id)!, c, brands };
}

export async function intlMetadata(l: Lang, id: IntlBranch): Promise<Metadata> {
  const { b, c } = await load(id);
  const t = T[l];
  const bt = BT[l][id];
  const hours = `${b.opens}–${b.closes}`;
  const title = `${bt.title} | J.O. Vision Care`;
  const description = bt.description(daysText(l, b.days), hours, phoneIntlPretty(c.phoneIntl));
  const sm = shareMeta({ title, description, url: intlPath(l, id), image: id === "nongkhai" ? OG_NONGKHAI : null });
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: intlPath(l, id), languages: branchLanguages(id) },
    ...sm,
    openGraph: { ...sm.openGraph, locale: t.ogLocale, alternateLocale: ["th_TH", l === "lo" ? "en_US" : "lo_LA"] },
  };
}

export default async function IntlBranchPage({ lang: l, branch: id }: { lang: Lang; branch: IntlBranch }) {
  const { b, c, brands } = await load(id);
  const t = T[l];
  const bt = BT[l][id];
  const hours = `${b.opens}–${b.closes}`;
  const days = daysText(l, b.days);
  const phone = phoneIntlPretty(c.phoneIntl);
  const tel = c.phoneIntl ? `tel:${c.phoneIntl}` : null;
  const faq = t.faq(hours, days);
  const url = absoluteUrl(intlPath(l, id));
  const photos = PHOTOS[id].slice(0, 4);

  return (
    <div lang={t.htmlLang} className={`intl intl-${l}`}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebPage", "@id": `${url}#page`, url, name: bt.title, inLanguage: t.htmlLang, about: { "@id": opticianId(b) }, publisher: { "@id": ORG_ID } },
            organizationNode(c),
            opticianNode(b, c, OG[id].url),
            { "@type": "FAQPage", inLanguage: t.htmlLang, mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
          ],
        }}
      />
      <header className="site-header">
        <div className="wrap bar">
          <Link href={intlPath(l, id)} className="logo" title="J.O. Vision Care">
            <span className="logo-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-96.png" alt="" width={40} height={40} style={{ position: "static", width: 40, height: 40 }} />
            </span>
            <span className="logo-word">J.O. VISIONCARE</span>
          </Link>
          <nav className="intl-langs" aria-label="Language">
            <Link href={b.path} hrefLang="th" lang="th">ไทย</Link>
            {LANGS.map((x) => <Link key={x} href={intlPath(x, id)} hrefLang={x} lang={T[x].htmlLang} aria-current={x === l ? "page" : undefined} className={x === l ? "on" : ""}>{x === "lo" ? "ລາວ" : "EN"}</Link>)}
          </nav>
        </div>
      </header>

      <main id="top">
        <div className="page-head">
          <p className="eyebrow">{bt.eyebrow}</p>
          <h1 className="h2">{bt.h1}</h1>
          <p className="lead">{bt.lead}</p>
        </div>

        <div className="page-body" style={{ paddingBottom: 24 }}>
          <section className="bp-info" aria-label={t.visitTitle} data-track-area={`intl-${l}`} data-track-branch={id}>
            <div className="branch" style={{ alignContent: "start" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t.visitTitle}</h2>
              <dl>
                <dt>{t.addrLabel}</dt><dd><b>{bt.place}</b><br />{bt.area}</dd>
                <dt>{t.hoursLabel}</dt><dd>{days} {hours}</dd>
                {c.phone && (<><dt>{t.phoneLabel}</dt><dd><a href={tel!}>{phone}</a></dd></>)}
                <dt>ไทย</dt><dd><small>{t.thaiAddr}</small><br /><span lang="th">{b.addr}</span></dd>
              </dl>
              <p className="bp-note">{t.closedNote}</p>
              <div className="row-btns">
                <a href={b.map} target="_blank" rel="noopener" className="pill solid">{t.directions}</a>
                {tel && <a href={tel} className="pill">{t.call}</a>}
                {b.gbpUrl && <a href={b.gbpUrl} target="_blank" rel="noopener" className="pill">{t.reviews}</a>}
                <a href={c[b.fbKey]} target="_blank" rel="noopener" className="pill">{t.facebook}</a>
                {c.line && <a href={c.line} target="_blank" rel="noopener" className="pill">{t.line}</a>}
              </div>
            </div>
            <div className="bp-map">
              <iframe title={`Map — J.O. Vision Care ${b.en}`} src={`https://maps.google.com/maps?q=${b.lat},${b.lng}&z=16&hl=${l === "lo" ? "lo" : "en"}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
          </section>

          <section className="bp-section" aria-labelledby="why-us">
            <h2 id="why-us" className="bp-h">{t.whyTitle}</h2>
            <ul className="why">{t.strengths.map(([a, d]) => <li key={a}><b>{a}</b><span>{d}</span></li>)}</ul>
          </section>

          <section className="bp-section" aria-label="Photos">
            <div className={id === "udon" ? "store-photos" : "store-photos-wide"}>
              {photos.map((ph, i) => (
                <figure key={ph.src} className="store-photo">
                  <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 900px) 300px, 50vw" priority={i < 2} />
                </figure>
              ))}
            </div>
          </section>

          <section className="bp-section" aria-labelledby="intl-services">
            <h2 id="intl-services" className="bp-h">{t.servicesTitle}</h2>
            <ul className="bp-services">{t.services.map(([a, d]) => <li key={a}><b>{a}</b><span>{d}</span></li>)}</ul>
          </section>

          <section className="bp-section" aria-labelledby="intl-brands">
            <h2 id="intl-brands" className="bp-h">{t.brandsTitle}</h2>
            <p className="intl-brands">{brands.map((x) => x.name).join(" · ")}</p>
          </section>

          <section className="faq" aria-labelledby="faq-title">
            <h2 id="faq-title">{t.faqTitle}</h2>
            {faq.map((f, i) => (
              <details key={f.q} open={i === 0}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </section>

          <aside className="article-cta" data-track-area={`intl-${l}`} data-track-branch={id} style={{ marginBottom: 32 }}>
            <b>{t.ctaTitle}</b>
            <p>{t.ctaText}</p>
            <div className="row-btns">
              <a href={b.map} target="_blank" rel="noopener" className="pill solid">{t.directions}</a>
              {tel && <a href={tel} className="pill">{phone}</a>}
            </div>
          </aside>
        </div>

        <footer className="intl-footer">
          <p><b>{t.payTitle}:</b> {paymentCards.join(" · ")}</p>
          <nav>
            <Link href={b.path} hrefLang="th">{t.thaiSite}</Link>
            <Link href="/privacy">{t.privacy}</Link>
            <CookieSettingsButton label={t.cookieSettings} />
          </nav>
          <p className="mono" style={{ fontSize: 11, letterSpacing: ".08em" }}>© {new Date().getFullYear()} J.O. VISIONCARE</p>
        </footer>
      </main>

      <nav className="dock" aria-label={t.ctaTitle} data-track-area={`intl-${l}-dock`} data-track-branch={id}>
        <a href={b.map} target="_blank" rel="noopener" className="light">{t.dockMap}</a>
        {tel && <a href={tel} className="red">{t.dockCall}</a>}
      </nav>
      <CookieBanner t={t.cookie} />
    </div>
  );
}
