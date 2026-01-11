import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-neutral-900 p-12 md:p-16 text-center"
        >
          <div 
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(115, 115, 115, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(115, 115, 115, 0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          
          <h2 className="relative text-4xl md:text-5xl font-semibold text-white mb-6 tracking-tight">
            Ready to get started?
          </h2>
          <p className="relative text-neutral-400 text-lg mb-10 max-w-lg mx-auto">
            Join thousands of brands and creators already using NanoReach to drive real results.
          </p>
          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-white text-neutral-900 rounded-full font-medium hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
            >
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="px-8 py-4 border border-neutral-700 text-white rounded-full hover:bg-neutral-800 transition-colors">
              Contact sales
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
