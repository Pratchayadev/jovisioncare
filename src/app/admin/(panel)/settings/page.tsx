import SettingsForm from "@/components/admin/SettingsForm";
import BranchForm from "@/components/admin/BranchForm";
import { getBranchSettings, getContactSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [s, b] = await Promise.all([getContactSettings(), getBranchSettings()]);
  return (
    <>
      <div className="adm-head"><h1>ตั้งค่าร้าน</h1><span className="sub">บันทึกแล้วหน้าเว็บและข้อมูลสำหรับ Google เปลี่ยนตามทันที</span></div>
      <h2 style={{ fontSize: 17, margin: "8px 0 12px" }}>สาขา</h2>
      <p style={{ margin: "-6px 0 14px", color: "var(--muted)", fontSize: 13 }}>ใช้ข้อมูลชุดเดียวกันนี้ใน Google Business Profile ให้ตรงกันทุกตัวอักษร ช่วยเรื่องอันดับในแผนที่</p>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", marginBottom: 32 }}>
        <BranchForm id="udon" title="สาขาอุดรธานี" s={b.udon} />
        <BranchForm id="nongkhai" title="สาขาหนองคาย" s={b.nongkhai} />
      </div>
      <h2 style={{ fontSize: 17, margin: "8px 0 12px" }}>ช่องทางติดต่อ</h2>
      <SettingsForm s={s} />
    </>
  );
}
