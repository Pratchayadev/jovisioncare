import ArticleForm from "@/components/admin/ArticleForm";
import { siteHost } from "@/lib/admin-host";

export default function New() {
  return (<><div className="adm-head"><h1>เขียนบทความ</h1></div><ArticleForm host={siteHost()} /></>);
}
