import { lineMessage, links } from "@/lib/site";

export default function AskButtons({ p }: { p: { brand: string; name: string; code: string } }) {
  const line = lineMessage(`สนใจสินค้า ${p.brand} ${p.name} (รหัส ${p.code})`);
  return (
    <>
      <div className="ask">
        {line && <a className="solid" href={line} target="_blank" rel="noopener">LINE</a>}
        <a className={line ? undefined : "solid"} href={links.fbUdon} target="_blank" rel="noopener">Messenger</a>
        <a href={links.igInbox} target="_blank" rel="noopener">IG</a>
      </div>
      <p className="ask-note">
        {line ? <>รหัสสินค้า {p.code} จะถูกส่งให้แอดมินอัตโนมัติ</> : <>แจ้งรหัสสินค้า <b>{p.code}</b> กับแอดมินได้เลย</>}
      </p>
    </>
  );
}
