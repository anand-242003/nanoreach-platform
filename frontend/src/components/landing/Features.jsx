import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { Check, X, ArrowRight } from 'lucide-react';

Chart.register(...registerables);

const ComparisonChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Cost per Engagement', 'Avg. Engagement Rate', 'Campaign Setup Time'],
        datasets: [
          { label: 'Traditional', data: [2.5, 1.2, 14], backgroundColor: '#e5e5e5', borderRadius: 6 },
          { label: 'DRK/MTTR', data: [0.12, 5.2, 1], backgroundColor: '#171717', borderRadius: 6 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { size: 12 } } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { display: false } },
          y: { grid: { display: false }, ticks: { color: '#525252', font: { size: 13 } } },
        },
      },
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [mounted]);

  return <canvas ref={chartRef} />;
};

const ROIVisual = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['ROI Generated', 'Investment'],
        datasets: [{ data: [127, 100], backgroundColor: ['#171717', '#e5e5e5'], borderWidth: 0, cutout: '75%' }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [mounted]);

  return (
    <div className="relative">
      <canvas ref={chartRef} className="w-32 h-32" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-900">127%</p>
          <p className="text-xs text-neutral-500">Avg ROI</p>
        </div>
      </div>
    </div>
  );
};

const comparisonData = [
  { feature: 'Campaign launch time', traditional: '2-4 weeks', nano: 'Same day' },
  { feature: 'Minimum budget', traditional: '$10,000+', nano: '$100' },
  { feature: 'Creator vetting', traditional: false, nano: true },
  { feature: 'Real-time analytics', traditional: false, nano: true },
  { feature: 'Escrow protection', traditional: false, nano: true },
  { feature: 'Direct messaging', traditional: false, nano: true },
];

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm text-neutral-500 mb-4">The difference</p>
          <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight mb-4">
            Why nano beats mega
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto">
            See how nano-influencer marketing outperforms traditional approaches
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl border border-neutral-200 p-8"
          >
            <h3 className="text-xl font-semibold text-neutral-900 mb-6">Performance Comparison</h3>
            <div className="h-64"><ComparisonChart /></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-neutral-900 rounded-3xl p-8 text-white"
          >
            <h3 className="text-xl font-semibold mb-6">By the numbers</h3>
            <div className="grid grid-cols-2 gap-6">
              <div><p className="text-4xl font-bold mb-1">$0.12</p><p className="text-neutral-400 text-sm">Cost per engagement</p></div>
              <div><p className="text-4xl font-bold mb-1">5.2%</p><p className="text-neutral-400 text-sm">Avg engagement rate</p></div>
              <div><p className="text-4xl font-bold mb-1">10K+</p><p className="text-neutral-400 text-sm">Verified creators</p></div>
              <div><p className="text-4xl font-bold mb-1">&lt;5min</p><p className="text-neutral-400 text-sm">Campaign setup</p></div>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-800">
              <div className="flex items-center justify-between">
                <div><p className="text-neutral-400 text-sm mb-1">Average ROI</p><p className="text-3xl font-bold">127%</p></div>
                <ROIVisual />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border border-neutral-200 overflow-hidden"
        >
          <div className="grid grid-cols-3 border-b border-neutral-200">
            <div className="p-6"><p className="text-sm text-neutral-500">Feature</p></div>
            <div className="p-6 text-center border-x border-neutral-200 bg-neutral-50"><p className="text-sm text-neutral-500">Traditional Agencies</p></div>
            <div className="p-6 text-center bg-neutral-900"><p className="text-sm text-neutral-400 font-bold tracking-tight">DRK/MTTR</p></div>
          </div>
          
          {comparisonData.map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-b border-neutral-100 last:border-0">
              <div className="p-6"><p className="text-neutral-900">{row.feature}</p></div>
              <div className="p-6 flex items-center justify-center border-x border-neutral-100 bg-neutral-50">
                {typeof row.traditional === 'boolean' ? (
                  row.traditional ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-neutral-300" />
                ) : (
                  <span className="text-neutral-600">{row.traditional}</span>
                )}
              </div>
              <div className="p-6 flex items-center justify-center bg-neutral-900">
                {typeof row.nano === 'boolean' ? (
                  row.nano ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-neutral-600" />
                ) : (
                  <span className="text-white font-medium">{row.nano}</span>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a 
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors font-medium"
          >
            Start your first campaign
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
