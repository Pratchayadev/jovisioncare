/**
 * Markdown แบบย่อสำหรับบทความ/เนื้อหาหมวด — ปลอดภัย (escape HTML ทั้งหมดก่อน)
 * รองรับ: ## หัวข้อ, ### หัวข้อย่อย, ย่อหน้า, - รายการ, 1. รายการ, > คำพูด,
 * **ตัวหนา**, *ตัวเอียง*, [ลิงก์](url), ![รูป](url) บรรทัดเดียว
 */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const safeUrl = (u: string) => (/^(https?:\/\/|\/|#)/i.test(u) ? u : "#");

export function headingId(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9฀-๿]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";
}

function inline(s: string) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => {
      const href = safeUrl(url.replace(/&amp;/g, "&"));
      const ext = /^https?:\/\//i.test(href) && !/jovisioncare\.com/i.test(href);
      return `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
}

export type Heading = { id: string; text: string };

export function renderMarkdown(src: string | null | undefined): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Set<string>();
  const out: string[] = [];
  // หัวข้อและรูปที่อยู่บรรทัดเดียว ให้แยกเป็นบล็อกของตัวเองเสมอ (แม้ไม่เว้นบรรทัด)
  const blocks = (src ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/^(#{1,3}\s+.+|!\[[^\]]*\]\([^)\s]+\))[ \t]*$/gm, "\n$1\n")
    .split(/\n{2,}/);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split("\n");
    let m: RegExpMatchArray | null;
    if ((m = block.match(/^(#{1,3})\s+(.+)$/)) && lines.length === 1) {
      const level = m[1].length === 3 ? 3 : 2;
      const text = m[2].trim();
      let id = headingId(text);
      while (used.has(id)) id += "-2";
      used.add(id);
      if (level === 2) headings.push({ id, text });
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
    } else if ((m = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))) {
      const alt = esc(m[1]);
      out.push(`<figure><img src="${esc(safeUrl(m[2]))}" alt="${alt}" loading="lazy" decoding="async" />${alt ? `<figcaption>${alt}</figcaption>` : ""}</figure>`);
    } else if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("")}</ul>`);
    } else if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>`).join("")}</ol>`);
    } else if (lines.every((l) => /^>\s?/.test(l))) {
      out.push(`<blockquote>${lines.map((l) => inline(l.replace(/^>\s?/, ""))).join("<br>")}</blockquote>`);
    } else {
      out.push(`<p>${lines.map(inline).join("<br>")}</p>`);
    }
  }
  return { html: out.join("\n"), headings };
}

/** ข้อความล้วน (สำหรับ meta description / นับคำ) */
export function plainText(src: string | null | undefined) {
  return (src ?? "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`]/g, "")
    .replace(/^\s*[-\d.)]+\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
