import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { SiX, SiLinkedin, SiGithub } from 'react-icons/si';
import { SparklesCore } from '@/components/ui/sparkles';

const FEATURES = [
  { icon: CheckCircle2, label: 'Verified creators only' },
  { icon: Zap,          label: 'Instant 24-hour payouts' },
  { icon: Sparkles,     label: 'AI campaign matching' },
  { icon: Shield,       label: 'Escrow protection' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="relative overflow-hidden border-b border-white/10">
        <SparklesCore
          id="footer-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.4}
          particleDensity={90}
          className="absolute inset-0 w-full h-full"
          particleColor="#e50914"
          speed={1.5}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-12"
          >
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Get started free</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4 tracking-tight">
                Ready to get started?
              </h2>
              <p className="text-white/50 text-lg max-w-lg">
                Join thousands of brands and creators already using{' '}
                <span className="text-white font-semibold">DRK<span className="text-primary">/</span>MTTR</span>{' '}
                to drive real results.
              </p>
              <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
                {FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-white/70 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                to="/auth/signup"
                className="group flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Start free trial
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/auth/login"
                className="flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Contact sales
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block text-xl font-bold tracking-tight mb-4">
              DRK<span className="text-primary">/</span>MTTR
            </Link>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed mb-6">
              The modern marketplace connecting brands with authentic nano-influencers who drive real engagement.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-white/30 hover:text-white transition-colors"><SiX className="h-4 w-4" /></a>
              <a href="#" className="text-white/30 hover:text-white transition-colors"><SiLinkedin className="h-4 w-4" /></a>
              <a href="#" className="text-white/30 hover:text-white transition-colors"><SiGithub className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Product</h4>
            <ul className="space-y-3">
              {['Features', 'For Creators', 'Pricing', 'API'].map(l => (
                <li key={l}><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Company</h4>
            <ul className="space-y-3">
              {['About', 'Blog', 'Careers', 'Contact'].map(l => (
                <li key={l}><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacy', 'Terms', 'Cookies'].map(l => (
                <li key={l}><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/25">© {new Date().getFullYear()} DRK/MTTR. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-white/25">Platform status: operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
