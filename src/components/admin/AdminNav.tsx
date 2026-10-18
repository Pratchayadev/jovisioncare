"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/admin", "ภาพรวม"],
  ["/admin/products", "สินค้า"],
  ["/admin/categories", "หมวดหมู่"],
  ["/admin/brands", "แบรนด์"],
] as const;

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="เมนูหลังบ้าน">
      {items.map(([href, label]) => {
        const on = href === "/admin" ? path === href : path.startsWith(href);
        return <Link key={href} href={href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>{label}</Link>;
      })}
    </nav>
  );
}
