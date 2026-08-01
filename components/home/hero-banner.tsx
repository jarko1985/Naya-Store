import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Truck } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import Iridescence from "@/components/Iridescence";

const HeroBanner = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-12 border border-white/5 shadow-2xl shadow-indigo-950/30">
      {/* Iridescence shader background */}
      <div className="absolute inset-0">
        <Iridescence
          color={[0, 0.208, 0.4]}
          speed={0.7}
          amplitude={0.07}
          mouseReact={true}
        />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-20 md:py-28 md:px-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 rounded-full px-4 py-1.5 text-sm font-medium mb-8 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          {APP_NAME} — New Collection 2026
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 max-w-4xl">
          Discover Your{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300">
            Perfect Style
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-base md:text-lg max-w-xl mb-10 leading-relaxed">
          Premium products curated for quality and style. Shop the latest
          arrivals and exclusive deals — all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-14">
          <Button
            asChild
            size="lg"
            className="text-base px-8 h-12 rounded-xl bg-white text-gray-900 hover:bg-gray-100 shadow-lg shadow-white/10"
          >
            <Link href="/search">
              Shop Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-base px-8 h-12 rounded-xl border-white/20 text-white bg-white/5 hover:bg-white/15 hover:text-white backdrop-blur-sm"
          >
            <Link href="/search?sort=newest">View New Arrivals</Link>
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-300" />
            Free shipping over $100
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            30-day money back guarantee
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            Exclusive member deals
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
