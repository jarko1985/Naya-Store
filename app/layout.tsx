import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { APP_NAME, APP_DESCRIPTION, SERVER_URL } from "@/lib/constants";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import ShapeGrid from "@/components/ShapeGrid";
import GoogleAnalytics from "@/components/analytics/google-analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CurrencyProvider } from "@/components/shared/currency/currency-provider";
import { getActiveCurrency, getExchangeRates } from "@/lib/currency";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  weight: ["500", "600", "700"],
});
export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
  icons: {
    icon: "/favicon.ico",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const [activeCurrency, exchangeRates] = await Promise.all([
    getActiveCurrency(),
    getExchangeRates(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`relative z-0 ${inter.className} ${fraunces.variable} antialiased`}
      >
        {gaMeasurementId && <GoogleAnalytics measurementId={gaMeasurementId} />}
        <SpeedInsights />
        <div className="fixed inset-0 -z-10">
          <div className="relative w-full h-full backdrop-blur-md">
            <ShapeGrid
              shape="square"
              direction="diagonal"
              speed={0.5}
              squareSize={48}
              borderColor="rgba(255, 255, 255, 0.5)"
              hoverFillColor="rgba(255, 255, 255, 0.85)"
              vignetteColor="rgba(178, 189, 196, 0.4)"
              hoverTrailAmount={6}
            />
            <div className="absolute inset-0 pointer-events-none mix-blend-overlay" />
          </div>
        </div>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <CurrencyProvider initialCurrency={activeCurrency} initialRates={exchangeRates}>
            {children}
            <Toaster />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
