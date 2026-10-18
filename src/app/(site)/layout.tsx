import "./site.css";
import SiteHeader from "@/components/SiteHeader";
import QuickDock from "@/components/QuickDock";
import ContactSection from "@/components/ContactSection";
import Reveal from "@/components/Reveal";
import { getBrands, getCategories } from "@/lib/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);
  return (
    <>
      <SiteHeader />
      <main id="top">
        {children}
        <ContactSection categories={categories} brands={brands} />
      </main>
      <QuickDock />
      <Reveal />
    </>
  );
}
