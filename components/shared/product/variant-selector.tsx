'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import ProductPrice from './product-price';
import AddToCart from './add-to-cart';
import { Cart, ProductVariant } from '@/types';
import { PRODUCT_COLOR_SWATCHES as colorMap } from '@/lib/constants';

interface VariantSelectorProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: string;
    stock: number;
    images: string[];
  };
  variants: ProductVariant[];
  cart?: Cart;
}

const VariantSelector = ({ product, variants, cart }: VariantSelectorProps) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const hasVariants = variants.length > 0;

  // Unique colors that have at least one in-stock variant
  const availableColors = hasVariants
    ? [...new Set(variants.filter((v) => v.stock > 0).map((v) => v.color))]
    : [];

  // Sizes available for the selected color
  const availableSizes = selectedColor
    ? variants
        .filter((v) => v.color === selectedColor && v.stock > 0)
        .map((v) => v.size)
    : [];

  const selectedVariant =
    selectedColor && selectedSize
      ? variants.find((v) => v.color === selectedColor && v.size === selectedSize) ?? null
      : null;

  // Display price: variant price when selected, else product base price
  const displayPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(product.price);

  // Display stock
  const displayStock = selectedVariant
    ? selectedVariant.stock
    : hasVariants
    ? variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(null); // reset size when color changes
  };

  return (
    <Card>
      <CardContent className='p-4 space-y-4'>
        {/* Color picker */}
        {hasVariants && availableColors.length > 0 && (
          <div>
            <p className='text-sm font-medium mb-2'>
              Color{selectedColor ? `: ${selectedColor}` : ''}
            </p>
            <div className='flex flex-wrap gap-2'>
              {availableColors.map((color) => (
                <button
                  key={color}
                  type='button'
                  title={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-black scale-110'
                      : 'border-gray-300 hover:border-gray-500'
                  } ${color === 'White' ? 'shadow-inner' : ''}`}
                  style={{ backgroundColor: colorMap[color] ?? color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Size picker */}
        {selectedColor && availableSizes.length > 0 && (
          <div>
            <p className='text-sm font-medium mb-2'>
              Size{selectedSize ? `: ${selectedSize}` : ''}
            </p>
            <div className='flex flex-wrap gap-2'>
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type='button'
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 rounded border text-sm font-medium transition-all ${
                    selectedSize === size
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-gray-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className='flex justify-between items-center'>
          <div>Price</div>
          <ProductPrice value={displayPrice} />
        </div>

        {/* Stock status */}
        <div className='flex justify-between items-center'>
          <div>Status</div>
          {displayStock > 0 ? (
            <Badge variant='outline'>In Stock</Badge>
          ) : (
            <Badge variant='destructive'>Out Of Stock</Badge>
          )}
        </div>

        {/* Add to cart */}
        {!hasVariants && product.stock > 0 && (
          <div className='flex-center'>
            <AddToCart
              cart={cart}
              item={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                qty: 1,
                image: product.images[0],
              }}
            />
          </div>
        )}

        {hasVariants && !selectedColor && (
          <p className='text-sm text-muted-foreground text-center'>
            Select a color to continue
          </p>
        )}

        {hasVariants && selectedColor && !selectedSize && (
          <p className='text-sm text-muted-foreground text-center'>
            Select a size to continue
          </p>
        )}

        {hasVariants && selectedVariant && selectedVariant.stock > 0 && (
          <div className='flex-center'>
            <AddToCart
              cart={cart}
              item={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: String(selectedVariant.price),
                qty: 1,
                image: selectedVariant.image,
                variantId: selectedVariant.id,
                color: selectedVariant.color,
                size: selectedVariant.size,
              }}
            />
          </div>
        )}

        {hasVariants && selectedVariant && selectedVariant.stock === 0 && (
          <Badge variant='destructive' className='w-full justify-center'>
            This combination is out of stock
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default VariantSelector;
