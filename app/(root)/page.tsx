import { Metadata } from "next";
import ProductList from "@/components/shared/product/product-list";
import {
  getLatestProducts,
  getTopRatedProducts,
} from "@/lib/actions/product.action";
import { EditorialFashionHero } from "@/components/home/editorial-fashion-hero";
import ViewAllProductsButton from "@/components/view-all-products-button";
import DealCountdown from "@/components/deal-countdown";
import HeroBanner from "@/components/home/hero-banner";
import CategoryGrid from "@/components/home/category-grid";
import OnSaleSection from "@/components/home/on-sale-section";
import NewsletterSection from "@/components/home/newsletter-section";
import TrustBadgeRow from "@/components/shared/trust-badge-row";
import StorePromotionsSection from "@/components/home/store-promotions-section";

export const metadata: Metadata = {
  title: "Home",
  description: "Naya Store is a platform for buying and selling products",
};

export default async function Home() {
  const [latestProducts, topRatedProducts] = await Promise.all([
    getLatestProducts(),
    getTopRatedProducts(),
  ]);

  return (
    <>
      <EditorialFashionHero />
      <StorePromotionsSection />
      <CategoryGrid />

      <TrustBadgeRow className="mb-12" />
      <ProductList data={latestProducts} title="Newest Arrivals" limit={4} />
      <OnSaleSection />
      <ProductList
        data={topRatedProducts}
        title="Loved by Customers"
        limit={4}
      />
      <HeroBanner />
      <ViewAllProductsButton />
      <NewsletterSection />
      <DealCountdown />
    </>
  );
}
