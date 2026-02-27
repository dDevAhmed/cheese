import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import Offers from "@/components/Offers";
import Tiers from "@/components/Tiers";
import HowItWorks from "@/components/HowItWorks";
import TrustBar from "@/components/TrustBar";
import Testimonials from "@/components/Testimonials";
import CTABand from "@/components/CTABand";
import Footer from "@/components/Footer";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

export default function Home() {
  return (
    <ScrollRevealProvider>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <Offers />
        <Tiers />
        <HowItWorks />
        <TrustBar />
        <Testimonials />
        <CTABand />
      </main>
      <Footer />
    </ScrollRevealProvider>
  );
}
