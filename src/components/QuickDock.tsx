import type { Contact } from "@/lib/contact";

export default function QuickDock({ c }: { c: Contact }) {
  return (
    <nav className="dock" aria-label="ติดต่อด่วน">
      {c.line && <a href={c.line} target="_blank" rel="noopener" className="light">LINE</a>}
      <a href="/#branches" className={c.line ? undefined : "light"}>Facebook</a>
      <a href={c.tiktok} target="_blank" rel="noopener">TikTok</a>
      <a href={c.igInbox} target="_blank" rel="noopener" className="red">IG</a>
    </nav>
  );
}
