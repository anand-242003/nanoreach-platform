import SmoothScroll from '@/components/SmoothScroll';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import TrustedBy from '@/components/landing/TrustedBy';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import LiveCampaigns from '@/components/landing/LiveCampaigns';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function Landing() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-white">
        <Navbar />
        <HeroSection />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <LiveCampaigns />
        <CTA />
        <Footer />
      </div>
    </SmoothScroll>
  );
}
