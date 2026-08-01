import { Mail } from "lucide-react";
import NewsletterForm from "@/components/shared/footer/newsletter-form";
import { GridScan } from "@/components/GridScan";

const NewsletterSection = () => {
  return (
    <section className="relative mb-12 overflow-hidden rounded-2xl border border-white/5 bg-[#0f172a] shadow-sm px-6 py-10 md:py-14 flex flex-col items-center text-center">
      <div className="absolute inset-0">
        <GridScan
          linesColor="#312e81"
          scanColor="#669bbc"
          gridScale={0.1}
          scanOpacity={0.7}
          bloomIntensity={0.15}
          noiseIntensity={0.02}
        />
      </div>
      <div className="relative z-10 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mb-4 border border-white/20 shadow-sm backdrop-blur-sm">
        <Mail className="w-5 h-5" />
      </div>
      <h2 className="relative z-10 text-2xl md:text-3xl font-bold mb-2 text-white">
        Get 10% off your first order
      </h2>
      <p className="relative z-10 text-sm text-gray-300 max-w-md mb-6">
        Subscribe for early access to new arrivals, exclusive deals, and style
        inspiration — straight to your inbox.
      </p>
      <div className="relative z-10 w-full max-w-sm">
        <NewsletterForm
          source="homepage"
          className="shadow-sm rounded-lg overflow-hidden"
        />
      </div>
    </section>
  );
};

export default NewsletterSection;
