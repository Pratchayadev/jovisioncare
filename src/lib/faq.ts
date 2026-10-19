export type Faq = { q: string; a: string };

export function parseFaq(json: string | null | undefined): Faq[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x) => x && typeof x.q === "string" && typeof x.a === "string" && x.q.trim() && x.a.trim()) : [];
  } catch {
    return [];
  }
}

export const faqNode = (items: Faq[]) =>
  items.length
    ? { "@type": "FAQPage", mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }
    : null;
