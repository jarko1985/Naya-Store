import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Card,CardContent,CardHeader } from "@/components/ui/card";
import ProductPrice from "./product-price";
import ProductBadges from "./product-badges";
import ProductCardActions from "./product-card-actions";
import { auth } from "@/auth";
import { isProductWishlisted } from "@/lib/actions/wishlist.actions";
import { Product } from "@/types";

export default async function ProductCard({ product }: { product: Product }) {
    const session = await auth();
    const isSignedIn = !!session?.user?.id;
    const initialWishlisted = await isProductWishlisted({ productId: product.id });

    return (
        <Card className="w-full max-w-sm rounded-lg shadow-md overflow-hidden group transition-shadow hover:shadow-lg">
           <CardHeader className="p-0 items-center relative">
            <ProductBadges price={product.price} compareAtPrice={product.compareAtPrice} stock={product.stock} />
            <ProductCardActions productId={product.id} initialWishlisted={initialWishlisted} isSignedIn={isSignedIn} />
            <Link href={`/product/${product.slug}`} className="overflow-hidden block w-full">
            <Image
              src={product.images[0]}
              alt={product.name}
              height={300}
              width={300}
              priority={true}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            </Link>
           </CardHeader>
            <CardContent className="p-4 grid gap-4">
            <div className="text-xs">{product.brand}</div>
            <Link href={`/product/${product.slug}`}>
            <h2 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h2>
            </Link>
            <div className="flex-between gap-4">
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {product.rating}
            </p>
            {product.stock > 0 ? (
              <div className="flex items-baseline gap-2">
                {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${Number(product.compareAtPrice).toFixed(2)}
                  </span>
                )}
                <ProductPrice value={Number(product.price)} />
              </div>
            ) : (
              <p className="font-bold text-destructive">Out of stock</p>
            )}
            </div>
            </CardContent>

        </Card>
    );
}