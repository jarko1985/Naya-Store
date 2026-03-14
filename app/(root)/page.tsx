import { Metadata } from "next";
import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts, getFeaturedProducts, getTopRatedProducts } from "@/lib/actions/product.action";
import ProductCarousel from '@/components/shared/product/product-carousel';
import ViewAllProductsButton from '@/components/view-all-products-button';
import IconBoxes from '@/components/icon-boxes';
import DealCountdown from '@/components/deal-countdown';
import HeroBanner from '@/components/home/hero-banner';
import CategoryGrid from '@/components/home/category-grid';

export const metadata: Metadata = {
  title: "Home",
  description: "Naya Store is a platform for buying and selling products",
};

export default async function Home() {
  const [latestProducts, featuredProducts, topRatedProducts] = await Promise.all([
    getLatestProducts(),
    getFeaturedProducts(),
    getTopRatedProducts(),
  ]);

  return (
    <>
      {featuredProducts.length > 0 && <ProductCarousel data={featuredProducts} />}
      <HeroBanner />
      <CategoryGrid />
      <ProductList data={latestProducts} title='Newest Arrivals' limit={4} />
      <ProductList data={topRatedProducts} title='Top Rated' limit={4} />
      <ViewAllProductsButton />
      <DealCountdown />
      {/* <IconBoxes /> */}
    </>
  );
}
