import Footer from "@/components/shared/footer";
import Header from "@/components/shared/header";
import PromoBanner from "@/components/shared/promo-banner";
import CompareBar from "@/components/shared/compare/compare-bar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className='flex flex-col h-screen'>
            <PromoBanner />
            <Header />
            <main className='flex-1 wrapper'>
                {children}
            </main>
            <Footer />
            <CompareBar />
        </div>
    );
}