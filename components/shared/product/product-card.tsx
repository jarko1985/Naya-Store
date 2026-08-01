import ProductCardClient from "./product-card-client";
import { auth } from "@/auth";
import { isProductWishlisted } from "@/lib/actions/wishlist.actions";
import { Product } from "@/types";

export default async function ProductCard({ product }: { product: Product }) {
    const session = await auth();
    const isSignedIn = !!session?.user?.id;
    const initialWishlisted = await isProductWishlisted({ productId: product.id });

    return (
        <ProductCardClient product={product} isSignedIn={isSignedIn} initialWishlisted={initialWishlisted} />
    );
}