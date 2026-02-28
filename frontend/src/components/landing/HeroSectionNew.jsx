import { motion } from 'framer-motion';
import { ArrowRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SparklesCore } from '@/components/ui/sparkles';

export default function HeroSectionNew() {
  return (
    <section className="relative min-h-screen pt-20 overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-red-600">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      <SparklesCore
        id="hero-sparkles"
        background="transparent"
        minSize={0.3}
        maxSize={1.2}
        particleDensity={60}
        className="absolute inset-0 w-full h-full"
        particleColor="#ffffff"
        speed={1.2}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-180px)]">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white z-10"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              <span className="font-normal">1,000 Micro-Voices</span>
              <br />
              <span className="font-normal">&gt;</span>
              <br />
              <span className="underline decoration-white/30 decoration-4 underline-offset-8">
                1 Mega-Phone
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed"
            >
              Built for brands of all sizes, DRK/MTTR unifies all your influencer marketing activities on one platform. Engage authentic voices across multiple channels and optimize your campaign ROI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/auth/signup"
                className="px-8 py-4 bg-white text-red-600 rounded-full hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/auth/signup"
                className="px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition-all font-semibold backdrop-blur-sm"
              >
                Sign Up Now
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[600px] hidden lg:flex items-center justify-center"
          >
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px'
              }}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative z-10"
            >
              <img 
                src="/hero-illustration.png" 
                alt="Influencer" 
                className="w-80 h-96 object-cover rounded-3xl shadow-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute top-16 -right-4 bg-white rounded-2xl shadow-xl p-4 z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Participate in</p>
                  <p className="text-sm font-semibold text-neutral-900">campaign</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute top-1/2 -left-8 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-4 z-20"
            >
              <div className="flex items-center gap-3">
                <img 
                  src="https://ui-avatars.com/api/?name=Sarah&background=4F46E5&color=fff"
                  alt="Creator"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Sarah joined</p>
                  <p className="text-xs text-neutral-500">8.2K followers</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute bottom-20 -right-4 bg-white rounded-2xl shadow-xl p-4 z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Payment received</p>
                  <p className="text-sm font-semibold text-neutral-900">+$450.00</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-8 right-1/4 w-16 h-16 border-2 border-white/20 rounded-full"
            />
            
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-1/4 left-1/4 w-12 h-12 border-2 border-white/20 rounded-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
