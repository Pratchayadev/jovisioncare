import { links } from "@/lib/site";

export default function QuickDock() {
  return (
    <nav className="dock" aria-label="ติดต่อด่วน">
      {links.line && <a href={links.line} target="_blank" rel="noopener" className="light">LINE</a>}
      <a href="/#branches" className={links.line ? undefined : "light"}>Facebook</a>
      <a href={links.tiktok} target="_blank" rel="noopener">TikTok</a>
      <a href={links.igInbox} target="_blank" rel="noopener" className="red">IG</a>
    </nav>
  );
}
