'use client';

import { useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, type Variants } from 'framer-motion';
import EditorialFashionProgress from './EditorialFashionProgress';
import type { FashionHeroSlide } from './types';

const EASE = [0.22, 1, 0.36, 1] as const;

const imageVariants: Variants = {
  inactive: { scale: 1.12, clipPath: 'inset(0% 0% 0% 100%)' },
  active: {
    scale: 1,
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 1, ease: EASE },
  },
};

const lineVariants: Variants = {
  inactive: { y: '110%' },
  active: (i: number) => ({
    y: '0%',
    transition: { duration: 0.9, ease: EASE, delay: 0.15 + i * 0.08 },
  }),
};

const metaVariants: Variants = {
  inactive: { opacity: 0, y: 16 },
  active: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.45 } },
};

const ctaVariants: Variants = {
  inactive: { opacity: 0, y: 12 },
  active: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay: 0.6 } },
};

interface EditorialFashionSlideProps {
  slide: FashionHeroSlide;
  index: number;
  total: number;
  isActive: boolean;
  priority: boolean;
  reducedMotion: boolean;
  isPlaying: boolean;
  autoplayDelay: number;
}

const EditorialFashionSlide = ({
  slide,
  index,
  total,
  isActive,
  priority,
  reducedMotion,
  isPlaying,
  autoplayDelay,
}: EditorialFashionSlideProps) => {
  const state = isActive ? 'active' : 'inactive';
  const imageWrapRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 120, damping: 20, mass: 0.4 });
  const springY = useSpring(rawY, { stiffness: 120, damping: 20, mass: 0.4 });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || event.pointerType !== 'mouse' || !imageWrapRef.current) return;
      const rect = imageWrapRef.current.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      rawX.set(relX * 14);
      rawY.set(relY * 14);
    },
    [reducedMotion, rawX, rawY]
  );

  const handlePointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  const headline = (
    <h1
      className="font-(family-name:--font-fraunces) uppercase font-semibold"
      style={{
        fontSize: 'clamp(3.25rem, 15vw, 6rem)',
        lineHeight: 0.88,
        letterSpacing: '-0.03em',
      }}
    >
      {slide.titleLines.map((line, i) => (
        <span key={line} className="block overflow-hidden">
          <motion.span
            className="block"
            custom={i}
            variants={lineVariants}
            animate={reducedMotion ? undefined : state}
            initial={false}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );

  return (
    <div
      className="embla__slide relative h-full w-full shrink-0 grow-0 basis-full"
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      aria-hidden={!isActive}
      inert={!isActive}
    >
      {/* ---------- Mobile composition ---------- */}
      <div className="relative h-full w-full md:hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="relative h-full w-full"
            variants={reducedMotion ? undefined : imageVariants}
            animate={reducedMotion ? undefined : state}
            initial={false}
          >
            <Image
              src={slide.mainImage.src}
              alt={slide.mainImage.alt}
              fill
              priority={priority}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.mainImage.position ?? 'center' }}
            />
          </motion.div>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${slide.backgroundColor} 8%, ${slide.backgroundColor}99 32%, transparent 62%)`,
            }}
          />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between text-[11px] font-medium tracking-[0.2em]">
            <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
            <span className="tabular-nums opacity-60">{String(total).padStart(2, '0')}</span>
          </div>

          <div>
            <motion.p
              variants={metaVariants}
              animate={reducedMotion ? undefined : state}
              initial={false}
              className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] opacity-80"
            >
              {slide.eyebrow}
            </motion.p>
            {headline}
            <motion.div
              variants={ctaVariants}
              animate={reducedMotion ? undefined : state}
              initial={false}
              className="mt-5"
            >
              <Link
                href={slide.ctaHref}
                className="group inline-flex items-center gap-2 text-sm font-medium tracking-[0.08em]"
              >
                <span className="relative">
                  {slide.ctaLabel}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-current transition-transform duration-300 group-hover:scale-x-0" />
                </span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
            <div className="mt-5">
              <EditorialFashionProgress index={index} total={total} isPlaying={isPlaying} duration={autoplayDelay} compact />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Desktop composition ---------- */}
      <div className="relative hidden h-full w-full md:grid md:grid-cols-12 md:items-center md:gap-6 md:px-10 md:py-16 lg:gap-10 lg:px-16">
        {/* Layered low-opacity background headline, sits behind the model image */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 z-0 hidden -translate-y-1/2 select-none overflow-hidden md:block"
        >
          <span
            className="font-(family-name:--font-fraunces) block whitespace-nowrap italic font-semibold uppercase"
            style={{
              fontSize: 'clamp(5rem, 10vw, 11rem)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: slide.mutedColor ?? slide.foregroundColor,
              opacity: 0.08,
            }}
          >
            {slide.titleLines.join(' ')}
          </span>
        </div>

        {/* Text column */}
        <div className="relative z-20 md:col-span-6 md:col-start-1 md:row-start-1">
          <div className="mb-6 flex items-center gap-4 text-[11px] font-medium tracking-[0.2em]">
            <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
            <span aria-hidden className="h-px w-8 bg-current opacity-40" />
            <span className="uppercase opacity-80">{slide.eyebrow}</span>
          </div>

          {headline}

          <motion.div
            variants={metaVariants}
            animate={reducedMotion ? undefined : state}
            initial={false}
            className="mt-8 max-w-sm"
          >
            <p className="text-xs font-medium uppercase tracking-[0.15em] opacity-70">{slide.season}</p>
            <p className="mt-3 text-sm leading-relaxed opacity-80">{slide.description}</p>
          </motion.div>

          <motion.div
            variants={ctaVariants}
            animate={reducedMotion ? undefined : state}
            initial={false}
            className="mt-9"
          >
            <Link
              href={slide.ctaHref}
              className="group inline-flex items-center gap-2 text-sm font-medium tracking-[0.08em] focus-visible:outline focus-visible:outline-current focus-visible:outline-offset-4"
            >
              <span className="relative">
                {slide.ctaLabel}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-current transition-transform duration-300 group-hover:scale-x-0" />
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* Image column */}
        <div
          ref={imageWrapRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative z-10 h-[58vh] max-h-[46rem] overflow-hidden md:col-span-7 md:col-start-6 md:row-start-1 md:h-[64vh]"
        >
          <motion.div
            className="relative h-full w-full"
            style={{ x: springX, y: springY }}
            variants={reducedMotion ? undefined : imageVariants}
            animate={reducedMotion ? undefined : state}
            initial={false}
          >
            <Image
              src={slide.mainImage.src}
              alt={slide.mainImage.alt}
              fill
              priority={priority}
              sizes="(max-width: 767px) 100vw, 58vw"
              className="object-cover"
              style={{ objectPosition: slide.mainImage.position ?? 'center' }}
            />
          </motion.div>

          {slide.detailImage ? (
            <motion.div
              variants={reducedMotion ? undefined : { inactive: { opacity: 0, y: 24, rotate: -3 }, active: { opacity: 1, y: 0, rotate: -2, transition: { duration: 0.8, ease: EASE, delay: 0.5 } } }}
              animate={reducedMotion ? undefined : state}
              initial={false}
              className="absolute -bottom-8 -left-10 hidden h-40 w-32 overflow-hidden border shadow-xl lg:block"
              style={{ borderColor: `${slide.foregroundColor}22` }}
            >
              <Image
                src={slide.detailImage.src}
                alt={slide.detailImage.alt}
                fill
                sizes="128px"
                className="object-cover"
              />
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EditorialFashionSlide;
