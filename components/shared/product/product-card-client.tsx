"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import ProductPrice from "./product-price";
import ProductBadges from "./product-badges";
import ProductCardActions from "./product-card-actions";
import Rating from "./rating";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Product } from "@/types";

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
};

interface ProductCardClientProps {
  product: Product;
  isSignedIn: boolean;
  initialWishlisted: boolean;
}

const ProductCardClient = ({
  product,
  isSignedIn,
  initialWishlisted,
}: ProductCardClientProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [7, -7]), {
    stiffness: 300,
    damping: 28,
  });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 300,
    damping: 28,
  });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || event.pointerType !== "mouse" || !cardRef.current)
        return;
      const rect = cardRef.current.getBoundingClientRect();
      rawX.set((event.clientX - rect.left) / rect.width - 0.5);
      rawY.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [reducedMotion, rawX, rawY],
  );

  const handlePointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    setHovered(false);
  }, [rawX, rawY]);

  const secondImage = product.images[1];
  const isOutOfStock = product.stock <= 0;
  const numPrice = Number(product.price);
  const numCompareAt = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;
  const hasCompareAt = !!numCompareAt && numCompareAt > numPrice;
  const colors = Array.from(
    new Set((product.variants ?? []).map((v) => v.color)),
  ).filter(Boolean);

  return (
    <motion.div
      ref={cardRef}
      initial="rest"
      animate={hovered ? "hover" : "rest"}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="group relative w-full max-w-sm overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-shadow duration-300 hover:shadow-xl opacity-80 hover:opacity-100"
    >
      <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
        <ProductBadges
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          stock={product.stock}
        />
        <ProductCardActions
          productId={product.id}
          initialWishlisted={initialWishlisted}
          isSignedIn={isSignedIn}
        />

        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 block"
          tabIndex={-1}
        >
          <motion.div
            variants={{
              rest: { scale: 1 },
              hover: { scale: reducedMotion ? 1 : 1.06 },
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-cover"
            />
          </motion.div>

          {secondImage && (
            <motion.div
              variants={{
                rest: { opacity: 0 },
                hover: { opacity: reducedMotion ? 0 : 1 },
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={secondImage}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover"
              />
            </motion.div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
              <span className="rounded-full border bg-background px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground">
                Out of Stock
              </span>
            </div>
          )}
        </Link>

        {/* Hover reveal: rating, colors, quick link */}
        <motion.div
          variants={{
            rest: { y: "100%", opacity: 0 },
            hover: { y: "0%", opacity: 1 },
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background via-background/90 to-transparent px-3 pb-3 pt-10"
        >
          <div className="flex items-center gap-1.5">
            <Rating value={Number(product.rating)} />
            <span className="text-xs text-muted-foreground">
              ({product.numReviews})
            </span>
          </div>

          {colors.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {colors.slice(0, 4).map((color) => (
                <Badge
                  key={color}
                  variant="outline"
                  className="bg-background/80 text-[10px] font-normal"
                >
                  {color}
                </Badge>
              ))}
              {colors.length > 4 && (
                <span className="text-[10px] text-muted-foreground">
                  +{colors.length - 4}
                </span>
              )}
            </div>
          )}

          <Link
            href={`/product/${product.slug}`}
            className="pointer-events-auto mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary focus-visible:outline focus-visible:outline-primary focus-visible:outline-offset-2"
          >
            View Details
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>
      </div>

      <div className="grid gap-1.5 p-4">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <Link href={`/product/${product.slug}`}>
          <h2 className="line-clamp-1 text-sm font-medium transition-colors group-hover:text-primary">
            {product.name}
          </h2>
        </Link>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span>{Number(product.rating).toFixed(1)}</span>
          <span>({product.numReviews})</span>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          {hasCompareAt && (
            <span className="text-xs text-muted-foreground line-through">
              ${numCompareAt!.toFixed(2)}
            </span>
          )}
          {product.stock > 0 ? (
            <ProductPrice
              value={numPrice}
              className={cn(hasCompareAt && "text-destructive")}
            />
          ) : (
            <p className="text-sm font-bold text-destructive">Out of stock</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardClient;
