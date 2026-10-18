import TaxonomyForm from "@/components/admin/TaxonomyForm";
import { siteHost } from "@/lib/admin-host";

export default function New() {
  return (<><div className="adm-head"><h1>เพิ่มแบรนด์</h1></div><TaxonomyForm kind="brands" host={siteHost()} /></>);
}
