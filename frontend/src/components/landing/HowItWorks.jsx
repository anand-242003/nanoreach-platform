import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Create your campaign',
    description: 'Set your budget, requirements, and target audience. Our intuitive interface makes it easy to get started in under 5 minutes.',
  },
  {
    number: '02',
    title: 'Get matched with creators',
    description: 'Our AI algorithm analyzes thousands of creators to find the perfect match for your brand and campaign goals.',
  },
  {
    number: '03',
    title: 'Review and approve',
    description: 'Review creator applications, approve content submissions, and release payment. Simple, transparent, and secure.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-neutral-500 mb-4">How it works</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight">
            Three simple steps
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="text-7xl font-bold text-neutral-200 mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">{step.title}</h3>
              <p className="text-neutral-600 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
