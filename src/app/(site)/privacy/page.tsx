import type { Metadata } from "next";
import { shareMeta } from "@/lib/site";
import Link from "next/link";
import { Prose } from "@/components/Prose";
import { CookieSettingsButton } from "@/components/CookieBanner";
import { getPrivacy } from "@/lib/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว",
  description: "นโยบายความเป็นส่วนตัวและการใช้คุกกี้ของเว็บไซต์ J.O. Vision Care",
  alternates: { canonical: "/privacy" },
  ...shareMeta({ title: "นโยบายความเป็นส่วนตัว", description: "นโยบายความเป็นส่วนตัวและการใช้คุกกี้ของเว็บไซต์ J.O. Vision Care", url: "/privacy" }),
};

export default async function PrivacyPage() {
  const p = await getPrivacy();
  return (
    <>
      <div className="page-head article-head">
        <ol className="crumbs"><li><Link href="/">หน้าแรก</Link></li><li aria-current="page">นโยบายความเป็นส่วนตัว</li></ol>
        <h1 className="h2">นโยบายความเป็นส่วนตัว</h1>
        {p.updatedAt && <p className="article-meta">ปรับปรุงล่าสุด {p.updatedAt.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" })}</p>}
      </div>
      <div className="page-body article-body">
        <Prose md={p.md} />
        <p className="privacy-cookie">เปลี่ยนการตั้งค่าคุกกี้: <CookieSettingsButton /></p>
      </div>
    </>
  );
}
