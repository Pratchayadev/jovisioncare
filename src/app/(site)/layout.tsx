import "./site.css";
import SiteHeader from "@/components/SiteHeader";
import QuickDock from "@/components/QuickDock";
import ContactSection from "@/components/ContactSection";
import Reveal from "@/components/Reveal";
import { getBrands, getCategories, getPublishedReviews } from "@/lib/queries";
import { getContact } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, brands, reviews, c] = await Promise.all([getCategories(), getBrands(), getPublishedReviews(), getContact()]);
  return (
    <>
      <SiteHeader hasReviews={reviews.length > 0} />
      <main id="top">
        {children}
        <ContactSection categories={categories} brands={brands} c={c} />
      </main>
      <QuickDock c={c} />
      <Reveal />
    </>
  );
}
