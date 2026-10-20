import IntlBranchPage, { intlMetadata } from "@/components/IntlBranchPage";

export const revalidate = 3600;
export const generateMetadata = () => intlMetadata("lo", "nongkhai");
export default function Page() {
  return <IntlBranchPage lang="lo" branch="nongkhai" />;
}
