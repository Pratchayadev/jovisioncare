import "./site.css";
import SiteHeader from "@/components/SiteHeader";
import QuickDock from "@/components/QuickDock";
import ContactSection from "@/components/ContactSection";
import Reveal from "@/components/Reveal";
import { getBrands, getCategories, getPublishedReviews } from "@/lib/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, brands, reviews] = await Promise.all([getCategories(), getBrands(), getPublishedReviews()]);
  return (
    <>
      <SiteHeader hasReviews={reviews.length > 0} />
      <main id="top">
        {children}
        <ContactSection categories={categories} brands={brands} />
      </main>
      <QuickDock />
      <Reveal />
    </>
  );
}
