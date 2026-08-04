"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Minus,
  Plus,
  Loader,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Lock,
  ChevronRight,
  Ruler,
  Copy,
  Scale,
  Bell,
  Check,
} from "lucide-react";
import { Cart, CartItem, Product, ProductVariant, Review } from "@/types";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { toggleWishlistItem } from "@/lib/actions/wishlist.actions";
import { subscribeToStockAlert } from "@/lib/actions/stock-alert.actions";
import { useCompare } from "@/lib/hooks/use-compare";
import { useCurrency } from "@/components/shared/currency/currency-provider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import ProductGallery from "./product-gallery";
import ReviewSummaryCard from "./review-summary-card";
import Rating from "./rating";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProductDetailsClientProps {
  product: Product;
  variants: ProductVariant[];
  cart?: Cart;
  userId?: string;
  initialWishlisted?: boolean;
  reviews?: Review[];
}

// color name → hex (mirrors product-form.tsx)
const colorMap: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Red: "#EF4444",
  Green: "#22C55E",
  Blue: "#3B82F6",
  Yellow: "#EAB308",
  Orange: "#F97316",
  Purple: "#A855F7",
  Pink: "#EC4899",
  Brown: "#92400E",
  Gray: "#6B7280",
  Navy: "#1E3A5F",
  Beige: "#D4B896",
  Teal: "#14B8A6",
};

// Unique ordered sizes for guide table
const SIZE_GUIDE_ROWS = [
  { size: "XS", chest: '32"', waist: '24"', hips: '34"' },
  { size: "S", chest: '34"', waist: '26"', hips: '36"' },
  { size: "M", chest: '36"', waist: '28"', hips: '38"' },
  { size: "L", chest: '38"', waist: '30"', hips: '40"' },
  { size: "XL", chest: '40"', waist: '32"', hips: '42"' },
  { size: "XXL", chest: '42"', waist: '34"', hips: '44"' },
];

const ProductDetailsClient = ({
  product,
  variants,
  cart,
  userId,
  initialWishlisted = false,
  reviews = [],
}: ProductDetailsClientProps) => {
  const router = useRouter();
  const { formatFromUsd } = useCurrency();
  const [isPending, startTransition] = useTransition();
  const [isWishlistPending, startWishlistTransition] = useTransition();
  const [isAlertPending, startAlertTransition] = useTransition();
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSent, setAlertSent] = useState(false);
  const {
    isComparing,
    toggle: toggleCompare,
    limit: compareLimit,
  } = useCompare();
  const comparing = isComparing(product.id);

  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.color ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.size ?? null,
  );
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [copiedSku, setCopiedSku] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [mainBuyBarVisible, setMainBuyBarVisible] = useState(true);
  const buyBarRef = useRef<HTMLDivElement>(null);

  const hasVariants = variants.length > 0;

  // --- Derived state ---
  // Variant colors that are in-stock
  const variantColors = [
    ...new Set(variants.filter((v) => v.stock > 0).map((v) => v.color)),
  ];

  // Always show the base product color first; append variant colors that differ
  const availableColors = product.color
    ? [product.color, ...variantColors.filter((c) => c !== product.color)]
    : variantColors;

  // One representative variant image per color for the color picker
  const colorVariantImage: Record<string, string> = {};
  variantColors.forEach((color) => {
    const v = variants.find((v) => v.color === color);
    if (v) colorVariantImage[color] = v.image;
  });

  // True when selected color is the base product color with no variant stock
  const isBaseColorSelected =
    selectedColor === product.color &&
    !variants.some((v) => v.color === product.color && v.stock > 0);

  // Variant sizes for the selected color
  const variantSizesForColor = selectedColor
    ? [
        ...new Set(
          variants
            .filter((v) => v.color === selectedColor && v.stock > 0)
            .map((v) => v.size),
        ),
      ]
    : [];

  // Always show the base product size first; append variant sizes that differ
  const availableSizes = selectedColor
    ? product.size
      ? [
          product.size,
          ...variantSizesForColor.filter((s) => s !== product.size),
        ]
      : variantSizesForColor
    : [];

  // Exact selected variant
  const selectedVariant =
    selectedColor && selectedSize
      ? (variants.find(
          (v) => v.color === selectedColor && v.size === selectedSize,
        ) ?? null)
      : null;

  // Gallery image: null when base color selected (shows product.images); variant image otherwise
  const activeVariantImage =
    selectedColor && !isBaseColorSelected
      ? (colorVariantImage[selectedColor] ?? null)
      : null;

  // Display price
  const displayPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(product.price);

  // Display stock
  const displayStock = selectedVariant
    ? selectedVariant.stock
    : hasVariants
      ? variants.reduce((sum, v) => sum + v.stock, 0)
      : product.stock;

  // SKU — use product id last 12 chars
  const sku = product.id.replace(/-/g, "").slice(0, 12).toUpperCase();

  // Show the back-in-stock signup whenever the currently displayed stock is 0
  const showStockAlert = displayStock === 0;

  // --- Handlers ---
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(product.size ?? null);
  };

  const handleAddToCart = () => {
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const item: CartItem = selectedVariant
      ? {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: String(selectedVariant.price),
          qty: 1,
          image: selectedVariant.image,
          variantId: selectedVariant.id,
          color: selectedVariant.color,
          size: selectedVariant.size,
        }
      : {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          qty: 1,
          image: product.images[0],
          color: selectedColor ?? undefined,
        };

    startTransition(async () => {
      const res = await addItemToCart(item);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message, {
        action: {
          label: "Go To Cart",
          onClick: () => router.push("/cart"),
        },
      });
    });
  };

  const handleRemoveFromCart = () => {
    const variantId = selectedVariant?.id;
    startTransition(async () => {
      const res = await removeItemFromCart(product.id, variantId);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  const existItem = cart?.items.find(
    (x) =>
      x.productId === product.id &&
      x.variantId === (selectedVariant?.id ?? undefined),
  );

  const handleCopySku = () => {
    navigator.clipboard.writeText(sku).then(() => {
      setCopiedSku(true);
      setTimeout(() => setCopiedSku(false), 1500);
    });
  };

  const handleWishlist = () => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const nextState = !wishlisted;
    setWishlisted(nextState);

    startWishlistTransition(async () => {
      const res = await toggleWishlistItem({ productId: product.id });
      if (!res.success) {
        setWishlisted(!nextState);
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
    });
  };

  const handleStockAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail) {
      toast.error("Please enter your email");
      return;
    }

    startAlertTransition(async () => {
      const res = await subscribeToStockAlert({
        email: alertEmail,
        productId: product.id,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      setAlertSent(true);
      toast.success(res.message);
    });
  };

  const handleCompareToggle = () => {
    const result = toggleCompare(product.id);
    if (result === "limit-reached") {
      toast.error(`You can compare up to ${compareLimit} products at a time`);
    }
  };

  useEffect(() => {
    const el = buyBarRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setMainBuyBarVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const FAQ_ITEMS = [
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards, PayPal, and cash on delivery in select regions.",
    },
    {
      question: "How long does shipping take?",
      answer: `Standard delivery takes 5–10 business days. Orders above ${formatFromUsd(FREE_SHIPPING_THRESHOLD)} ship free.`,
    },
    {
      question: "Can I return this item?",
      answer:
        "Yes — unworn items in original packaging can be returned within 30 days for a full refund or exchange.",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 bg-white rounded-2xl opacity-80">
      {/* ══════════════════════════════════════════
          LEFT — Product Gallery
      ══════════════════════════════════════════ */}
      <div className="flex flex-col gap-5">
        <ProductGallery
          images={product.images}
          activeVariantImage={activeVariantImage}
        />
        <ReviewSummaryCard
          rating={Number(product.rating)}
          numReviews={product.numReviews}
          reviews={reviews}
        />
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Product Info
      ══════════════════════════════════════════ */}
      <div className="flex flex-col gap-5 pt-3 pr-2 pb-3">
        {/* ── 1. Product Name ── */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
            {product.brand} · {product.category?.name}
          </p>
          <h1 className="text-2xl font-bold leading-snug text-foreground">
            {product.name}
          </h1>
        </div>

        {/* ── 2. SKU + Reviews ── */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-medium text-foreground/60">SKU:</span>
            <span className="font-mono">{sku}</span>
            <button
              type="button"
              onClick={handleCopySku}
              className="hover:text-foreground transition-colors"
              title="Copy SKU"
            >
              {copiedSku ? (
                <span className="text-xs text-green-600 font-medium">
                  Copied!
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <Rating value={Number(product.rating)} />
            <a
              href="#reviews"
              className="text-primary underline-offset-2 hover:underline text-xs font-medium"
            >
              ({product.numReviews} Reviews)
            </a>
          </div>
        </div>

        {/* ── 3. Price ── */}
        <div className="flex items-baseline gap-3 py-3 px-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
          <span className="text-3xl font-extrabold text-orange-500">
            {formatFromUsd(displayPrice)}
          </span>
          {hasVariants && !selectedVariant && (
            <span className="text-sm text-muted-foreground font-normal">
              starting from
            </span>
          )}
          {displayStock > 0 ? (
            <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-2.5 py-1 rounded-full">
              In Stock
            </span>
          ) : (
            <span className="ml-auto text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* ── 3b. Back-in-stock alert ── */}
        {showStockAlert && (
          <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
            {alertSent ? (
              <p className="text-sm font-medium flex items-center gap-1.5 text-green-600">
                <Check className="w-4 h-4" />
                We&apos;ll email you when this is back in stock
              </p>
            ) : (
              <form
                onSubmit={handleStockAlertSubmit}
                className="flex flex-col sm:flex-row gap-2"
              >
                <p className="text-sm font-medium flex items-center gap-1.5 sm:hidden">
                  <Bell className="w-4 h-4 text-primary" />
                  Notify me when back in stock
                </p>
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className="flex-1 h-10 bg-background"
                  disabled={isAlertPending}
                />
                <button
                  type="submit"
                  disabled={isAlertPending}
                  className="h-10 px-4 rounded-full bg-black text-white text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors disabled:opacity-50 shrink-0"
                >
                  {isAlertPending ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Bell className="w-4 h-4 hidden sm:inline" />
                      Notify Me
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── 4. Color Selector ── */}
        {availableColors.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2.5">
              Color:{" "}
              {selectedColor && (
                <span className="font-normal text-muted-foreground">
                  {selectedColor}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map((color) => {
                const img =
                  colorVariantImage[color] ??
                  (color === product.color ? product.images[0] : undefined);
                return (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => handleColorSelect(color)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-md hover:scale-105 focus:outline-none ${
                      selectedColor === color
                        ? "border-black shadow-lg scale-105 ring-2 ring-black ring-offset-1"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={color}
                        fill
                        className="object-cover object-center"
                      />
                    ) : (
                      <span
                        className="w-full h-full block"
                        style={{ backgroundColor: colorMap[color] ?? "#ccc" }}
                      />
                    )}
                    {selectedColor === color && (
                      <span className="absolute inset-0 flex items-end justify-end p-0.5">
                        <span className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 5. Size Selector + Guide ── */}
        {selectedColor && availableSizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-sm font-semibold">
                Size:{" "}
                {selectedSize && (
                  <span className="font-normal text-muted-foreground">
                    {selectedSize}
                  </span>
                )}
              </p>

              {/* Size Guide Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-primary hover:underline underline-offset-2 transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    Size Guide
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      Size Guide
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Measurements are in inches. For the best fit, measure
                      yourself and compare to the chart below.
                    </p>
                    <div className="rounded-lg overflow-hidden border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Size
                            </th>
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Chest
                            </th>
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Waist
                            </th>
                            <th className="px-4 py-2.5 text-left font-semibold">
                              Hips
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {SIZE_GUIDE_ROWS.map((row) => (
                            <tr
                              key={row.size}
                              className={`transition-colors ${
                                selectedSize === row.size
                                  ? "bg-primary/5 font-medium"
                                  : "hover:bg-muted/30"
                              }`}
                            >
                              <td className="px-4 py-2.5">{row.size}</td>
                              <td className="px-4 py-2.5">{row.chest}</td>
                              <td className="px-4 py-2.5">{row.waist}</td>
                              <td className="px-4 py-2.5">{row.hips}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      * Sizes may vary slightly by style. When in doubt, size
                      up.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 hover:shadow-sm focus:outline-none ${
                    selectedSize === size
                      ? "bg-black text-white border-black shadow-md"
                      : "bg-white dark:bg-background text-foreground border-gray-300 hover:border-gray-600 dark:border-gray-600"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {!selectedSize && (
              <p className="text-xs text-muted-foreground mt-2">
                Please select a size
              </p>
            )}
          </div>
        )}

        {/* ── 6. Add to Cart + Wishlist ── */}
        <div ref={buyBarRef} className="flex gap-2">
          {/* Add / Remove buttons */}
          {existItem ? (
            <div className="flex flex-1 items-center rounded-full border border-border overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={handleRemoveFromCart}
                className="flex-1 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
              </button>
              <span className="px-6 font-semibold text-base tabular-nums">
                {existItem.qty}
              </span>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 flex items-center justify-center hover:bg-muted transition-colors"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isPending || displayStock === 0}
              className="flex-1 h-12 rounded-full bg-black text-white text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : displayStock === 0 ? (
                "Out of Stock"
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Cart
                </>
              )}
            </button>
          )}

          {/* Wishlist heart */}
          <button
            type="button"
            onClick={handleWishlist}
            disabled={isWishlistPending}
            className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:shadow-md active:scale-95 focus:outline-none disabled:opacity-60 ${
              wishlisted
                ? "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-500"
                : "border-gray-300 hover:border-red-300 text-muted-foreground hover:text-red-400"
            }`}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlistPending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Heart
                className={`w-5 h-5 transition-all duration-200 ${wishlisted ? "fill-red-500 text-red-500 scale-110" : ""}`}
              />
            )}
          </button>

          {/* Compare toggle */}
          <button
            type="button"
            onClick={handleCompareToggle}
            className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:shadow-md active:scale-95 focus:outline-none ${
              comparing
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-300 hover:border-primary/50 text-muted-foreground hover:text-primary"
            }`}
            title={comparing ? "Remove from compare" : "Add to compare"}
          >
            <Scale className="w-5 h-5" />
          </button>
        </div>

        {/* ── 7. Shipping Info Box ── */}
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-primary" />
              Shipping Information
            </p>
          </div>

          {/* Free Shipping row */}
          <ShippingRow
            icon={<Truck className="w-4 h-4 text-green-600" />}
            iconBg="bg-green-50 dark:bg-green-950/30"
            open={shippingOpen}
            onToggle={() => setShippingOpen((p) => !p)}
            title={
              <span className="text-green-600 font-semibold">
                Free Shipping (Orders ≥ {formatFromUsd(FREE_SHIPPING_THRESHOLD)})
              </span>
            }
            subtitle="Est. Delivery: 5 – 10 business days"
            detail={`Orders above ${formatFromUsd(FREE_SHIPPING_THRESHOLD)} qualify for free standard shipping. Express options available at checkout. We ship to most countries worldwide.`}
          />

          {/* Return Policy row */}
          <ShippingRow
            icon={<RotateCcw className="w-4 h-4 text-blue-600" />}
            iconBg="bg-blue-50 dark:bg-blue-950/30"
            open={returnOpen}
            onToggle={() => setReturnOpen((p) => !p)}
            title="Return Policy"
            subtitle="30-day hassle-free returns"
            detail="Not satisfied? Return any item within 30 days of delivery for a full refund or exchange. Items must be unworn and in original packaging."
          />

          {/* Security row */}
          <ShippingRow
            icon={<ShieldCheck className="w-4 h-4 text-green-600" />}
            iconBg="bg-green-50 dark:bg-green-950/30"
            open={securityOpen}
            onToggle={() => setSecurityOpen((p) => !p)}
            title="Shopping Security"
            detail=""
            isLast
          >
            <div className="flex items-center gap-4 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CreditCard className="w-3.5 h-3.5 text-green-500" />
                Safe Payments
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="w-3.5 h-3.5 text-green-500" />
                Privacy Protection
              </span>
            </div>
          </ShippingRow>
        </div>

        {/* ── 8. Description ── */}
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-sm font-semibold">Product Description</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description || "No description available."}
            </p>
          </div>
        </div>

        {/* ── 9. FAQ ── */}
        <div className="rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <p className="text-sm font-semibold">Frequently Asked Questions</p>
          </div>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={item.question}
              className={
                i === FAQ_ITEMS.length - 1 ? "" : "border-b border-border"
              }
            >
              <button
                type="button"
                onClick={() => setFaqOpen((prev) => (prev === i ? null : i))}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
              >
                <span className="text-sm font-medium">{item.question}</span>
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${faqOpen === i ? "rotate-90" : ""}`}
                />
              </button>
              {faqOpen === i && (
                <div className="px-4 pb-3 pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky mobile buy bar ── */}
      {!mainBuyBarVisible && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border shadow-lg px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">
              {product.name}
            </p>
            <p className="text-lg font-bold">{formatFromUsd(displayPrice)}</p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isPending || displayStock === 0}
            className="h-11 px-6 rounded-full bg-black text-white text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : displayStock === 0 ? (
              "Out of Stock"
            ) : existItem ? (
              "Update Cart"
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── Shipping accordion row ─── */
interface ShippingRowProps {
  icon: React.ReactNode;
  iconBg: string;
  open: boolean;
  onToggle: () => void;
  title: React.ReactNode;
  subtitle?: string;
  detail?: string;
  isLast?: boolean;
  children?: React.ReactNode;
}

const ShippingRow = ({
  icon,
  iconBg,
  open,
  onToggle,
  title,
  subtitle,
  detail,
  isLast,
  children,
}: ShippingRowProps) => (
  <div className={`${isLast ? "" : "border-b border-border"}`}>
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
    >
      <span className={`p-1.5 rounded-full ${iconBg} flex-shrink-0`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {children
          ? children
          : subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
      </div>
      <ChevronRight
        className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      />
    </button>
    {open && detail && (
      <div className="px-4 pb-3 pt-0">
        <p className="text-xs text-muted-foreground leading-relaxed pl-9">
          {detail}
        </p>
      </div>
    )}
  </div>
);

export default ProductDetailsClient;
