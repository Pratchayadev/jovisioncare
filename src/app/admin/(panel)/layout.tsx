import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <header className="adm-top">
        <div className="in">
          <span className="adm-brand">J.O. VISIONCARE<small>ADMIN</small></span>
          <AdminNav />
          <div className="right">
            <Link href="/" target="_blank">ดูหน้าเว็บ ↗</Link>
            <form action={logout}><button type="submit">ออกจากระบบ</button></form>
          </div>
        </div>
      </header>
      <main className="adm-main">{children}</main>
    </>
  );
}
