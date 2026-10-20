import "./site.css";
import SiteHeader from "@/components/SiteHeader";
import QuickDock from "@/components/QuickDock";
import ContactSection from "@/components/ContactSection";
import Reveal from "@/components/Reveal";
import Analytics from "@/components/Analytics";
import CookieBanner from "@/components/CookieBanner";
import { getBrands, getCategories, getPublishedArticles, getPublishedReviews } from "@/lib/queries";
import { getContact } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [categories, brands, reviews, c, articles] = await Promise.all([getCategories(), getBrands(), getPublishedReviews(), getContact(), getPublishedArticles(1)]);
  return (
    <>
      <SiteHeader hasReviews={reviews.length > 0} hasArticles={articles.length > 0} />
      <main id="top">
        {children}
        <ContactSection categories={categories} brands={brands} c={c} />
      </main>
      <QuickDock c={c} />
      <Reveal />
      <Analytics />
      <CookieBanner />
    </>
  );
}
