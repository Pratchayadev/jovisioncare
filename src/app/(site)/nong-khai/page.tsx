import BranchPage, { branchMetadata } from "@/components/BranchPage";

export const revalidate = 3600;
export const generateMetadata = () => branchMetadata("nongkhai");
export default function Page() {
  return <BranchPage id="nongkhai" />;
}
