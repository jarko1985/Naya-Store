export type HeaderTheme = 'light' | 'dark';

export interface FashionHeroSlide {
  id: string;
  eyebrow: string;
  titleLines: string[];
  season: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  mainImage: {
    src: string;
    alt: string;
    position?: string;
  };
  detailImage?: {
    src: string;
    alt: string;
  };
  backgroundColor: string;
  foregroundColor: string;
  mutedColor?: string;
  accentColor?: string;
  theme: HeaderTheme;
}

export type PauseReason = 'hover' | 'focus' | 'dragging' | 'hidden' | 'offscreen' | 'reduced-motion';

export interface EditorialFashionHeroProps {
  slides?: FashionHeroSlide[];
  autoplay?: boolean;
  autoplayDelay?: number;
  loop?: boolean;
  className?: string;
  onThemeChange?: (theme: HeaderTheme) => void;
}
