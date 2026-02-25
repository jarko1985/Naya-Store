import { Metadata } from "next";
import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.action";
export const metadata: Metadata = {
  title: "Home",
  description: "Naya Store is a platform for buying and selling products",
};

export default async function Home()  {
  const latestProducts = await getLatestProducts();
    console.log(latestProducts);
    
  return (
    <div>
      <ProductList data={latestProducts} title="Newest Arrivals" limit={4} />
    </div>
  );
}
