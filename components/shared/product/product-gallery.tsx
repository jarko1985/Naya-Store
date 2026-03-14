'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/free-mode';
import { ChevronUp, ChevronDown, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  activeVariantImage?: string | null;
}

const ProductGallery = ({ images, activeVariantImage }: ProductGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const swiperRef = useRef<SwiperType | null>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);

  // When a variant is selected, show ONLY that variant's image.
  // When no variant is selected, show the base product images.
  const displayImages = activeVariantImage ? [activeVariantImage] : images;

  // Reset to first image whenever the variant changes
  useEffect(() => {
    setActiveIndex(0);
    if (swiperRef.current && !swiperRef.current.destroyed) {
      swiperRef.current.slideTo(0);
    }
  }, [activeVariantImage]);

  const handleThumbClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const currentSrc = displayImages[activeIndex] ?? displayImages[0];

  return (
    <div className='flex gap-3 h-[580px] select-none'>
      {/* ── Vertical thumbnail strip ── */}
      <div className='relative w-[76px] flex-shrink-0 flex flex-col gap-1'>
        {/* Scroll up indicator */}
        <button
          type='button'
          className='w-full flex items-center justify-center py-0.5 text-muted-foreground hover:text-foreground transition-colors'
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <ChevronUp className='w-4 h-4' />
        </button>

        <div className='flex-1 overflow-hidden'>
          <Swiper
            direction='vertical'
            slidesPerView='auto'
            spaceBetween={6}
            freeMode
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            modules={[FreeMode]}
            className='h-full'
          >
            {displayImages.map((img, i) => (
              <SwiperSlide
                key={img + i}
                style={{ height: '76px', width: '76px' }}
              >
                <button
                  type='button'
                  onClick={() => handleThumbClick(i)}
                  className={cn(
                    'w-full h-full rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none',
                    activeIndex === i
                      ? 'border-black shadow-md scale-[1.03]'
                      : 'border-transparent hover:border-gray-300 hover:shadow-sm'
                  )}
                >
                  <Image
                    src={img}
                    alt={`thumbnail ${i + 1}`}
                    width={76}
                    height={76}
                    className='w-full h-full object-cover object-center'
                  />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Scroll down indicator */}
        <button
          type='button'
          className='w-full flex items-center justify-center py-0.5 text-muted-foreground hover:text-foreground transition-colors'
          onClick={() => swiperRef.current?.slideNext()}
        >
          <ChevronDown className='w-4 h-4' />
        </button>
      </div>

      {/* ── Main image ── */}
      <div
        ref={mainImageRef}
        className='relative flex-1 rounded-xl overflow-hidden bg-gray-50 group cursor-zoom-in'
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Zoom hint */}
        <div className='absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow'>
          <ZoomIn className='w-4 h-4 text-gray-600' />
        </div>

        {/* Main display image */}
        <Image
          src={currentSrc}
          alt='product image'
          fill
          priority
          sizes='(max-width: 768px) 100vw, 55vw'
          className={cn(
            'object-cover object-center transition-opacity duration-300',
            isZoomed ? 'opacity-0' : 'opacity-100'
          )}
        />

        {/* Zoom overlay */}
        {isZoomed && (
          <div
            className='absolute inset-0 transition-none'
            style={{
              backgroundImage: `url(${currentSrc})`,
              backgroundSize: '250%',
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        )}

        {/* Image counter */}
        <div className='absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm'>
          {activeIndex + 1} / {displayImages.length}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
