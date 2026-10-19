import SettingsForm from "@/components/admin/SettingsForm";
import { getContactSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const s = await getContactSettings();
  return (
    <>
      <div className="adm-head"><h1>ตั้งค่าร้าน</h1><span className="sub">ช่องทางติดต่อและโซเชียล — บันทึกแล้วทุกปุ่มบนเว็บเปลี่ยนตามทันที</span></div>
      <SettingsForm s={s} />
    </>
  );
}
