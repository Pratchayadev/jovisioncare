import IntlBranchPage, { intlMetadata } from "@/components/IntlBranchPage";

export const revalidate = 3600;
export const generateMetadata = () => intlMetadata("en", "udon");
export default function Page() {
  return <IntlBranchPage lang="en" branch="udon" />;
}
