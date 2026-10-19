import { lineMessage, type Contact } from "@/lib/contact";

export default function AskButtons({ p, c }: { p: { brand: string; name: string; code: string }; c: Contact }) {
  const line = lineMessage(c, `สนใจสินค้า ${p.brand} ${p.name} (รหัส ${p.code})`);
  return (
    <>
      <div className="ask">
        {line && <a className="solid" href={line} target="_blank" rel="noopener">LINE</a>}
        <a className={line ? undefined : "solid"} href={c.fbUdon} target="_blank" rel="noopener">Messenger</a>
        <a href={c.igInbox} target="_blank" rel="noopener">IG</a>
      </div>
      <p className="ask-note">
        {line && c.lineId ? <>รหัสสินค้า {p.code} จะถูกส่งให้แอดมินอัตโนมัติ</> : <>แจ้งรหัสสินค้า <b>{p.code}</b> กับแอดมินได้เลย</>}
      </p>
    </>
  );
}
