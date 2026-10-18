import { lineMessage, links } from "@/lib/site";

export default function AskButtons({ p }: { p: { brand: string; name: string; code: string } }) {
  return (
    <>
      <div className="ask">
        <a className="solid" href={lineMessage(`สนใจสินค้า ${p.brand} ${p.name} (รหัส ${p.code})`)} target="_blank" rel="noopener">LINE</a>
        <a href={links.fbUdon} target="_blank" rel="noopener">Messenger</a>
        <a href={links.igInbox} target="_blank" rel="noopener">IG</a>
      </div>
      <p className="ask-note">รหัสสินค้า {p.code} จะถูกส่งให้แอดมินอัตโนมัติ</p>
    </>
  );
}
