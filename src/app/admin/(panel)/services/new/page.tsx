import ServiceForm from "@/components/admin/ServiceForm";
import { siteHost } from "@/lib/admin-host";

export default function New() {
  return (<><div className="adm-head"><h1>เพิ่มบริการ</h1></div><ServiceForm host={siteHost()} /></>);
}
