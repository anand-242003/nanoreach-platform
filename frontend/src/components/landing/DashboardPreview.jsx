import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bell, Search, Plus, TrendingUp, Users, DollarSign, BarChart3 } from 'lucide-react';

Chart.register(...registerables);

export default function DashboardPreview() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Engagement',
            data: [1200, 1900, 1500, 2800, 2200, 3100, 2800],
            borderColor: '#171717',
            backgroundColor: 'rgba(23, 23, 23, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#171717',
          },
          {
            label: 'Reach',
            data: [800, 1200, 1100, 1800, 1600, 2200, 2000],
            borderColor: '#a3a3a3',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#a3a3a3', font: { size: 11 } } },
          y: { grid: { color: '#f5f5f5' }, ticks: { color: '#a3a3a3', font: { size: 11 } } },
        },
        interaction: { intersect: false, mode: 'index' },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [mounted]);

  const stats = [
    { label: 'Total Reach', value: '2.4M', icon: Users, change: '+12%' },
    { label: 'Campaigns', value: '12', icon: BarChart3, change: '+3' },
    { label: 'Revenue', value: '$48.2K', icon: DollarSign, change: '+8%' },
    { label: 'Engagement', value: '5.2%', icon: TrendingUp, change: '+0.8%' },
  ];

  return (
    <div className="h-full w-full bg-neutral-50">
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-neutral-900 tracking-tight">
            DRK<span className="text-neutral-400">/</span>MTTR
          </span>
          <div className="flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-1.5">
            <Search className="h-4 w-4 text-neutral-400" />
            <span className="text-sm text-neutral-400">Search...</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-neutral-500" />
          <div className="h-8 w-8 rounded-full bg-neutral-900" />
        </div>
      </div>

      <div className="flex h-[calc(100%-57px)]">
        <div className="w-48 border-r border-neutral-200 bg-white p-4">
          <div className="space-y-1">
            {['Dashboard', 'Campaigns', 'Creators', 'Analytics', 'Payments'].map((item, i) => (
              <div
                key={item}
                className={`rounded-lg px-3 py-2 text-sm ${i === 0 ? 'bg-neutral-900 text-white' : 'text-neutral-600'}`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
              <p className="text-sm text-neutral-500">Welcome back</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white">
              <Plus className="h-4 w-4" />
              New Campaign
            </button>
          </div>

          <div className="mb-6 grid grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <stat.icon className="h-4 w-4 text-neutral-400" />
                  <span className="text-xs text-green-600">{stat.change}</span>
                </div>
                <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900">Performance</h3>
                <p className="text-sm text-neutral-500">Last 7 days</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-neutral-900" />
                  <span className="text-neutral-600">Engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-neutral-400" />
                  <span className="text-neutral-600">Reach</span>
                </div>
              </div>
            </div>
            <div className="h-48">
              <canvas ref={chartRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
