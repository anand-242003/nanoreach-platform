import Navbar from '@/components/landing/Navbar';
import HeroSectionNew from '@/components/landing/HeroSectionNew';
import MacbookMockup from '@/components/landing/MacbookMockup';
import TrustedBy from '@/components/landing/TrustedBy';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import LiveCampaigns from '@/components/landing/LiveCampaigns';
import Footer from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
        <HeroSectionNew />
        <MacbookMockup />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <LiveCampaigns />
        <Footer />
      </div>
  );
}
