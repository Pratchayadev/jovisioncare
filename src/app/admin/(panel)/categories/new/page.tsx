import TaxonomyForm from "@/components/admin/TaxonomyForm";
import { siteHost } from "@/lib/admin-host";

export default function New() {
  return (<><div className="adm-head"><h1>เพิ่มหมวดหมู่</h1></div><TaxonomyForm kind="categories" host={siteHost()} /></>);
}
