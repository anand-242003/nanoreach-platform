import { motion } from 'framer-motion';
import { Sparkles, Zap, Users, TrendingUp } from 'lucide-react';

export default function LoadingCard() {
  const features = [
    { icon: Users, text: 'Finding creators', delay: 0.5 },
    { icon: Zap, text: 'Setting up dashboard', delay: 1 },
    { icon: TrendingUp, text: 'Preparing analytics', delay: 1.5 },
    { icon: Sparkles, text: 'Almost ready', delay: 2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full mx-4"
      >
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-2xl">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              background: [
                'linear-gradient(45deg, #ef4444 0%, #dc2626 100%)',
                'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
                'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                'linear-gradient(180deg, #dc2626 0%, #ef4444 100%)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Content */}
          <div className="relative">
            {/* Logo/Brand */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                DRK<span className="text-red-600">/</span>MTTR
              </h2>
              <p className="text-sm text-neutral-500">Creating your account...</p>
            </div>

            {/* Animated Spinner */}
            <div className="flex justify-center mb-8">
              <div className="relative w-20 h-20">
                {/* Outer ring */}
                <motion.div
                  className="absolute inset-0 border-4 border-red-100 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                {/* Inner spinning ring */}
                <motion.div
                  className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                {/* Center dot */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-3 h-3 bg-red-600 rounded-full" />
                </motion.div>
              </div>
            </div>

            {/* Feature Loading Steps */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: feature.delay, duration: 0.5 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: feature.delay + 0.2, type: 'spring' }}
                    className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0"
                  >
                    <feature.icon className="w-4 h-4 text-red-600" />
                  </motion.div>
                  <span className="text-sm text-neutral-700 font-medium">{feature.text}</span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: feature.delay + 0.3, duration: 0.8 }}
                    className="ml-auto h-1 bg-red-600 rounded-full"
                    style={{ maxWidth: '40px' }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Bottom text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="text-center text-xs text-neutral-400 mt-6"
            >
              This will only take a moment...
            </motion.p>
          </div>
        </div>

        {/* Decorative floating elements */}
        <motion.div
          className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 rounded-full opacity-20"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-4 -left-4 w-6 h-6 bg-red-500 rounded-full opacity-20"
          animate={{
            y: [0, 10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}
