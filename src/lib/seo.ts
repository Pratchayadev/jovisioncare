// โครงสร้างข้อมูล (JSON-LD) ที่ใช้ร่วมกันหลายหน้า
import { absoluteUrl, site, SITE_URL } from "./site";
import type { Branch } from "./branches";
import type { Contact } from "./contact";

export const ORG_ID = `${SITE_URL}/#organization`;
export const opticianId = (b: Branch) => `${SITE_URL}${b.path}#optician`;

export function organizationNode(c: Contact) {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    alternateName: "เจ.โอ.วิชั่นแคร์",
    url: SITE_URL,
    logo: absoluteUrl("/images/logo-og.jpg"),
    sameAs: [c.ig, c.tiktok, c.fbUdon, c.fbNongkhai],
    ...(c.phoneIntl ? { contactPoint: { "@type": "ContactPoint", telephone: c.phoneIntl, contactType: "customer service", areaServed: "TH", availableLanguage: ["th"] } } : {}),
  };
}

export function opticianNode(b: Branch, c: Contact, image?: string) {
  return {
    "@type": "Optician",
    "@id": opticianId(b),
    name: `J.O. Vision Care สาขา${b.province}`,
    alternateName: `ร้านแว่น${b.short} J.O. Vision Care`,
    url: `${SITE_URL}${b.path}`,
    image: absoluteUrl(image || site.ogImage),
    logo: absoluteUrl("/images/logo-og.jpg"),
    parentOrganization: { "@id": ORG_ID },
    address: {
      "@type": "PostalAddress",
      streetAddress: [b.line1, b.subdistrict && `ต.${b.subdistrict}`].filter(Boolean).join(" "),
      addressLocality: b.district,
      addressRegion: b.province,
      postalCode: b.postalCode,
      addressCountry: "TH",
    },
    geo: { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng },
    hasMap: b.mapView,
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: b.days, opens: b.opens, closes: b.closes }],
    ...(c.phoneIntl ? { telephone: c.phoneIntl } : {}),
    sameAs: [c[b.fbKey], c.ig, c.tiktok],
    priceRange: "฿฿",
  };
}

export function breadcrumbNode(items: { name: string; url: string }[]) {
  return { "@type": "BreadcrumbList", itemListElement: items.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.name, item: absoluteUrl(x.url) })) };
}
