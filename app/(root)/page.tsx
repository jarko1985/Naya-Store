import { Metadata } from "next";
import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts,getFeaturedProducts } from "@/lib/actions/product.action";
import ProductCarousel from '@/components/shared/product/product-carousel';
import ViewAllProductsButton from '@/components/view-all-products-button';
import IconBoxes from '@/components/icon-boxes';
import DealCountdown from '@/components/deal-countdown';
export const metadata: Metadata = {
  title: "Home",
  description: "Naya Store is a platform for buying and selling products",
};

export default async function Home()  {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();
  
    
  return (
    <>
    {featuredProducts.length > 0 && (
      <ProductCarousel data={featuredProducts} />
    )}
    <ProductList data={latestProducts} title='Newest Arrivals' limit={4} />
    <ViewAllProductsButton />
    <DealCountdown />
    <IconBoxes />
  </>
  );
}
