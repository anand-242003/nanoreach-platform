import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContainerScroll from './ContainerScroll';
import MacbookFrame from './MacbookFrame';
import DashboardPreview from './DashboardPreview';

export default function HeroSection() {
  return (
    <section className="pt-24 overflow-hidden bg-neutral-950">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(115, 115, 115, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(115, 115, 115, 0.15) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <ContainerScroll
        titleComponent={
          <div className="px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-neutral-300">847 campaigns live right now</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-6 leading-[1.1] bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent"
            >
              1,000 Micro-Voices &gt; 1 Mega-Phone.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-neutral-400 mb-8 max-w-2xl mx-auto"
            >
              The only marketplace dedicated to high-ROI nano influencer campaigns.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Link
                to="/auth/signup"
                className="px-8 py-4 bg-white text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="px-8 py-4 border border-neutral-700 text-white rounded-full hover:bg-neutral-800 transition-colors font-medium">
                Watch demo
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-8 text-sm text-neutral-500"
            >
              {/* <span>✓ No credit card required</span>
              <span>✓ 14-day free trial</span>
              <span>✓ Cancel anytime</span> */}
            </motion.div>
          </div>
        }
      >
        <MacbookFrame>
          <DashboardPreview />
        </MacbookFrame>
      </ContainerScroll>
    </section>
  );
}
