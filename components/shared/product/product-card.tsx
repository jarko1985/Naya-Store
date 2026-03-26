'use client';

import { useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { ShoppingCart, Share2, X, Plus, Minus, Loader } from 'lucide-react';
import { toast } from 'sonner';
import {
  FacebookShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  WhatsappIcon,
  LinkedinIcon,
  XIcon,
} from 'react-share';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ProductPrice from './product-price';
import { Product, ProductVariant, Cart, CartItem } from '@/types';
import { SERVER_URL } from '@/lib/constants';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';

const colorMap: Record<string, string> = {
  Black: '#000000',
  White: '#FFFFFF',
  Red: '#EF4444',
  Green: '#22C55E',
  Blue: '#3B82F6',
  Yellow: '#EAB308',
  Orange: '#F97316',
  Purple: '#A855F7',
  Pink: '#EC4899',
  Gray: '#6B7280',
  Brown: '#92400E',
  Navy: '#1E3A5F',
  Teal: '#14B8A6',
  Maroon: '#7F1D1D',
  Beige: '#D4C9A8',
  Olive: '#6B8E23',
};

const isNew = (createdAt: Date) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(createdAt) >= thirtyDaysAgo;
};

export default function ProductCard({
  product,
  cart,
}: {
  product: Product;
  cart?: Cart;
}) {
  const variants = product.variants ?? [];
  const swiperRef = useRef<SwiperType | null>(null);
  const router = useRouter();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [isPending, startTransition] = useTransition();

  // --- Derived: available colors ---
  const variantColors = [
    ...new Set(variants.filter((v) => v.stock > 0).map((v) => v.color)),
  ];
  const availableColors = product.color
    ? [product.color, ...variantColors.filter((c) => c !== product.color)]
    : variantColors;

  // --- Derived: available sizes based on selected color ---
  const activeColor = selectedColor ?? product.color;
  const variantSizesForColor = activeColor
    ? [
        ...new Set(
          variants
            .filter((v) => v.color === activeColor && v.stock > 0)
            .map((v) => v.size)
        ),
      ]
    : [];
  const availableSizes = product.size
    ? [product.size, ...variantSizesForColor.filter((s) => s !== product.size)]
    : variantSizesForColor;

  // --- Derived: selected variant ---
  const activeSize = selectedSize ?? product.size;
  const selectedVariant: ProductVariant | undefined = variants.find(
    (v) => v.color === activeColor && v.size === activeSize && v.stock > 0
  );

  // --- Derived: price & stock ---
  const displayPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(product.price);
  const displayStock = selectedVariant
    ? selectedVariant.stock
    : product.stock;

  // --- Derived: images for carousel ---
  // When a variant color is selected, show that variant's image; otherwise show base images
  const colorVariantImage: Record<string, string> = {};
  variantColors.forEach((color) => {
    const v = variants.find((vr) => vr.color === color);
    if (v) colorVariantImage[color] = v.image;
  });

  const isBaseColorSelected =
    activeColor === product.color &&
    !variants.some((v) => v.color === product.color && v.stock > 0);

  const activeVariantImage =
    activeColor && !isBaseColorSelected
      ? colorVariantImage[activeColor] ?? null
      : null;

  const displayImages = activeVariantImage
    ? [activeVariantImage]
    : product.images;

  // --- Share URL ---
  const shareUrl = `${SERVER_URL}/product/${product.slug}`;

  // --- Description truncation ---
  const maxDescLength = 100;
  const isDescLong = product.description.length > maxDescLength;
  const truncatedDesc = isDescLong
    ? product.description.slice(0, maxDescLength) + '...'
    : product.description;

  // --- Cart item match ---
  const existItem = cart?.items.find(
    (x: CartItem) =>
      x.productId === product.id &&
      x.variantId === (selectedVariant?.id ?? undefined)
  );

  // --- Handlers ---
  const handleAddToCart = () => {
    startTransition(async () => {
      const item: CartItem = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        qty: 1,
        image: selectedVariant?.image ?? product.images[0],
        price: selectedVariant
          ? String(selectedVariant.price)
          : String(product.price),
        variantId: selectedVariant?.id,
        color: activeColor ?? undefined,
        size: activeSize ?? undefined,
      };
      const res = await addItemToCart(item);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message, {
        action: {
          label: 'Go To Cart',
          onClick: () => router.push('/cart'),
        },
      });
    });
  };

  const handleRemoveFromCart = () => {
    startTransition(async () => {
      const res = await removeItemFromCart(
        product.id,
        selectedVariant?.id
      );
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-lg overflow-hidden flex flex-col relative group">
      {/* ── Image Carousel ── */}
      <div className="relative">
        <Link href={`/product/${product.slug}`}>
          <div
            className="w-full aspect-[4/3] bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden"
            onMouseEnter={() => swiperRef.current?.autoplay?.start()}
            onMouseLeave={() => {
              swiperRef.current?.autoplay?.stop();
              swiperRef.current?.slideTo(0);
            }}
          >
            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 1200, disableOnInteraction: false }}
              loop={displayImages.length > 1}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                swiper.autoplay?.stop();
              }}
              className="h-full w-full"
            >
              {displayImages.map((img, i) => (
                <SwiperSlide key={img + i}>
                  <Image
                    src={img}
                    alt={`${product.name} image ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover object-center"
                    priority={i === 0}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Link>

        {/* Share button */}
        <button
          type="button"
          onClick={() => setShowShare(!showShare)}
          className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
        >
          {showShare ? (
            <X className="w-4 h-4 text-gray-700" />
          ) : (
            <Share2 className="w-4 h-4 text-gray-700" />
          )}
        </button>

        {/* Share popup */}
        {showShare && (
          <div className="absolute top-12 right-3 z-20 bg-white rounded-xl shadow-xl p-2.5 flex gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <FacebookShareButton url={shareUrl} title={product.name}>
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <a
              href={`https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <XIcon size={32} round />
            </a>
            <WhatsappShareButton url={shareUrl} title={product.name}>
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <LinkedinShareButton url={shareUrl} title={product.name}>
              <LinkedinIcon size={32} round />
            </LinkedinShareButton>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Product Name + NEW badge */}
        <div className="flex items-center gap-2">
          <Link href={`/product/${product.slug}`}>
            <h2 className="text-base font-bold leading-tight line-clamp-1 hover:underline">
              {product.name}
            </h2>
          </Link>
          {isNew(product.createdAt) && (
            <Badge
              variant="outline"
              className="text-[10px] font-bold border-blue-500 text-blue-600 uppercase px-1.5 py-0 shrink-0"
            >
              NEW
            </Badge>
          )}
        </div>

        {/* Category */}
        <p className="text-xs text-muted-foreground">{product.category}</p>

        <Separator />

        {/* PRODUCT INFO */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wide mb-0.5">
            Product Info
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {truncatedDesc}
            {isDescLong && (
              <Link
                href={`/product/${product.slug}`}
                className="text-blue-600 hover:underline ml-1 font-medium"
              >
                view more
              </Link>
            )}
          </p>
        </div>

        <Separator />

        {/* COLOR */}
        {availableColors.length > 0 && (
          <>
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wide mb-1.5">
                Color
              </h3>
              <div className="flex gap-1.5 flex-wrap">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize(null);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all duration-150 ${
                      activeColor === color
                        ? 'border-blue-600 scale-110 ring-2 ring-blue-300'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{
                      backgroundColor: colorMap[color] ?? '#888',
                      boxShadow:
                        color === 'White'
                          ? 'inset 0 0 0 1px #d1d5db'
                          : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* SIZE */}
        {availableSizes.length > 0 && (
          <>
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wide mb-1.5">
                Size
              </h3>
              <div className="flex gap-1.5 flex-wrap">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg border-2 text-xs font-medium transition-all duration-150 ${
                      activeSize === size
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 hover:border-gray-500 text-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* ADD TO CART + PRICE */}
        <div className="flex items-center justify-between mt-auto pt-1">
          {displayStock > 0 ? (
            existItem ? (
              <div className="flex items-center rounded-lg border border-border overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={handleRemoveFromCart}
                  className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Minus className="w-3.5 h-3.5" />
                  )}
                </button>
                <span className="px-3 font-semibold text-sm tabular-nums">
                  {existItem.qty}
                </span>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="h-9 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-3 h-9 flex items-center gap-1.5 text-sm transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                {isPending ? 'Adding...' : 'ADD TO CART'}
              </button>
            )
          ) : (
            <Badge variant="destructive" className="text-xs px-2.5 py-1">
              Out of Stock
            </Badge>
          )}
          <ProductPrice value={displayPrice} className="text-xl font-bold" />
        </div>
      </div>
    </Card>
  );
}
