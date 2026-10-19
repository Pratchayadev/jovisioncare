import { redirectOrNotFound } from "@/lib/redirects";

// URL ที่ไม่มีหน้า: ถ้าตั้ง redirect ไว้ในหลังบ้านจะส่งต่อให้ ไม่งั้นแสดง 404
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function CatchAll({ params }: { params: Promise<{ rest: string[] }> }) {
  const path = "/" + (await params).rest.map(decodeURIComponent).join("/");
  return redirectOrNotFound(path);
}
