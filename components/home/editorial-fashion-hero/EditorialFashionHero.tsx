"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import EditorialFashionSlide from "./EditorialFashionSlide";
import EditorialFashionNavigation from "./EditorialFashionNavigation";
import EditorialFashionProgress from "./EditorialFashionProgress";
import { fashionHeroSlides } from "./fashionHeroData";
import type { EditorialFashionHeroProps, PauseReason } from "./types";

const DEFAULT_AUTOPLAY_DELAY = 5000;

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

const EditorialFashionHero = ({
  slides = fashionHeroSlides,
  autoplay = true,
  autoplayDelay = DEFAULT_AUTOPLAY_DELAY,
  loop = true,
  className,
  onThemeChange,
}: EditorialFashionHeroProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pauseReasons, setPauseReasons] = useState<Set<PauseReason>>(
    () => new Set(),
  );
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const setPause = useCallback((reason: PauseReason, active: boolean) => {
    setPauseReasons((prev) => {
      if (prev.has(reason) === active) return prev;
      const next = new Set(prev);
      if (active) next.add(reason);
      else next.delete(reason);
      return next;
    });
  }, []);

  // Reduced motion disables autoplay entirely.
  useEffect(() => {
    setPause("reduced-motion", reducedMotion);
  }, [reducedMotion, setPause]);

  // Pause while the browser tab isn't visible.
  useEffect(() => {
    const onVisibility = () => setPause("hidden", document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setPause]);

  // Pause when the hero scrolls mostly out of view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPause("offscreen", !entry.isIntersecting),
      {
        threshold: 0.4,
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [setPause]);

  // Track active slide + drag state from Embla.
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    const onPointerDown = () => setPause("dragging", true);
    const onPointerUp = () => setPause("dragging", false);

    emblaApi.on("select", onSelect);
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi, setPause]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const isPlaying = autoplay && pauseReasons.size === 0;

  // A single managed timer drives autoplay for the current slide.
  useEffect(() => {
    if (!isPlaying || !emblaApi) return;
    const timer = window.setTimeout(() => emblaApi.scrollNext(), autoplayDelay);
    return () => window.clearTimeout(timer);
  }, [isPlaying, selectedIndex, autoplayDelay, emblaApi]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  const activeSlide = slides[selectedIndex] ?? slides[0];

  useEffect(() => {
    onThemeChange?.(activeSlide.theme);
  }, [activeSlide.theme, onThemeChange]);

  const heroStyle = useMemo(
    () =>
      ({
        "--hero-bg": activeSlide.backgroundColor,
        "--hero-fg": activeSlide.foregroundColor,
      }) as CSSProperties,
    [activeSlide.backgroundColor, activeSlide.foregroundColor],
  );

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Featured collections"
      data-hero-theme={activeSlide.theme}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPause("hover", true)}
      onMouseLeave={() => setPause("hover", false)}
      onFocusCapture={() => setPause("focus", true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPause("focus", false);
        }
      }}
      style={heroStyle}
      className={`relative mb-12 w-full overflow-hidden rounded-2xl bg-[var(--hero-bg)] text-[var(--hero-fg)] transition-colors duration-700 h-[72svh] min-h-[480px] max-h-[780px] md:h-[clamp(760px,88vh,980px)] md:min-h-[680px] md:max-h-[980px] lg:min-h-[760px] ${className ?? ""}`.trim()}
    >
      <p className="sr-only" aria-live="polite">
        {`Slide ${selectedIndex + 1} of ${slides.length}: ${activeSlide.eyebrow}`}
      </p>

      <div className="h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <EditorialFashionSlide
              key={slide.id}
              slide={slide}
              index={index}
              total={slides.length}
              isActive={index === selectedIndex}
              priority={index === 0}
              reducedMotion={reducedMotion}
              isPlaying={isPlaying}
              autoplayDelay={autoplayDelay}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 hidden items-center justify-between gap-4 p-5 md:flex md:p-10">
        <div className="pointer-events-auto">
          <EditorialFashionProgress
            index={selectedIndex}
            total={slides.length}
            isPlaying={isPlaying}
            duration={autoplayDelay}
          />
        </div>
        <div className="pointer-events-auto">
          <EditorialFashionNavigation onPrev={scrollPrev} onNext={scrollNext} />
        </div>
      </div>
    </section>
  );
};

export default EditorialFashionHero;
