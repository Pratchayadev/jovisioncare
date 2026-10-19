import BranchPage, { branchMetadata } from "@/components/BranchPage";

export const revalidate = 3600;
export const generateMetadata = () => branchMetadata("udon");
export default function Page() {
  return <BranchPage id="udon" />;
}
