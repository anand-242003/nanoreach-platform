import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import MacbookFrame from './MacbookFrame';
import DashboardPreview from './DashboardPreview';

export default function MacbookMockup() {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#2C2C2C' }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Bento Grid with Decorative Dotted Shapes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-20 relative"
        >
          {/* Unique Dotted Decorative Shapes */}
          {/* Top Left - Curved Arc */}
          <div className="absolute -top-12 -left-8 w-32 h-32 opacity-50 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M 10 90 Q 10 10, 90 10"
                fill="none"
                stroke="rgba(239, 68, 68, 0.7)"
                strokeWidth="2"
                strokeDasharray="4 8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Top Right - Spiral */}
          <div className="absolute -top-16 -right-12 w-40 h-40 opacity-45 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(239, 68, 68, 0.6)" strokeWidth="2" strokeDasharray="3 6" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(239, 68, 68, 0.7)" strokeWidth="2" strokeDasharray="3 6" />
              <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(239, 68, 68, 0.8)" strokeWidth="2" strokeDasharray="3 6" />
            </svg>
          </div>

          {/* Bottom Left - Zigzag */}
          <div className="absolute -bottom-8 -left-12 w-36 h-24 opacity-50 pointer-events-none">
            <svg viewBox="0 0 120 80" className="w-full h-full">
              <path
                d="M 10 40 L 30 20 L 50 40 L 70 20 L 90 40 L 110 20"
                fill="none"
                stroke="rgba(239, 68, 68, 0.7)"
                strokeWidth="2"
                strokeDasharray="4 8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Bottom Right - Abstract Wave */}
          <div className="absolute -bottom-10 -right-8 w-32 h-32 opacity-45 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M 20 50 Q 35 30, 50 50 T 80 50"
                fill="none"
                stroke="rgba(239, 68, 68, 0.7)"
                strokeWidth="2"
                strokeDasharray="4 8"
                strokeLinecap="round"
              />
              <path
                d="M 20 65 Q 35 45, 50 65 T 80 65"
                fill="none"
                stroke="rgba(239, 68, 68, 0.6)"
                strokeWidth="2"
                strokeDasharray="4 8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Middle Right - Dots Pattern */}
          <div className="absolute top-1/2 -right-6 -translate-y-1/2 opacity-40 pointer-events-none">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {/* Main Card - Spans 2 columns */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 relative overflow-hidden rounded-3xl bg-white p-8 md:p-10 shadow-2xl"
            >
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full mb-4">
                  {/* <Sparkles className="w-4 h-4 text-red-600" /> */}
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Why Choose Us</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
                  Where Brands Meet
                  <br />
                  <span className="text-red-600">Authentic Influence</span>
                </h2>
                
                <p className="text-neutral-600 text-base leading-relaxed mb-6 max-w-xl">
                  Traditional influencer marketing is broken. Expensive agencies, fake followers, and zero transparency. We built DRK/MTTR to fix that—connecting brands directly with verified nano-influencers who drive real engagement and measurable ROI.
                </p>

                {/* Key differentiators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm">10K+ Creators</p>
                      <p className="text-xs text-neutral-500">Verified & vetted</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-sm">127% Avg ROI</p>
                      <p className="text-xs text-neutral-500">Proven results</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Side Stats Cards */}
            <div className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden rounded-3xl p-6 shadow-xl"
                style={{ backgroundColor: '#3a3a3a' }}
              >
                <div className="relative">
                  <Zap className="w-8 h-8 text-red-500 mb-3" />
                  <p className="text-4xl font-bold text-white mb-1">5min</p>
                  <p className="text-sm text-neutral-300">Campaign setup time</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden rounded-3xl p-6 shadow-xl"
                style={{ backgroundColor: '#dc2626' }}
              >
                <div className="relative">
                  <div className="text-5xl font-bold text-white mb-1">95%</div>
                  <p className="text-sm text-red-100">Lower costs vs agencies</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            See it in action
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            A powerful dashboard to manage all your nano-influencer campaigns in one place
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <MacbookFrame>
            <DashboardPreview />
          </MacbookFrame>
        </motion.div>
      </div>
    </section>
  );
}
