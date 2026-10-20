import "../(site)/site.css";
import Analytics from "@/components/Analytics";

// หน้าภาษาลาว / อังกฤษ — ใช้ส่วนหัว/ท้ายของตัวเอง (ไม่ใช้เมนูภาษาไทย)
export default function IntlLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}
