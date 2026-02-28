import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import {
  LayoutDashboard, Target, FileText, Activity, BarChart3,
  DollarSign, Eye, Award, Zap, Shield, Sparkles, CheckCircle2,
  ArrowUpRight, ChevronRight,
} from 'lucide-react';

Chart.register(...registerables);
const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',       active: true  },
  { icon: Target,          label: 'Browse Campaigns', active: false },
  { icon: FileText,        label: 'My Applications',  active: false },
  { icon: Activity,        label: 'Activity Feed',    active: false },
  { icon: BarChart3,       label: 'Referral Hub',     active: false },
];

const STATS = [
  { icon: FileText,   label: 'Applications',  value: '24',   accent: '#e50914', bg: 'rgba(229,9,20,0.08)'   },
  { icon: DollarSign, label: 'Total Earnings', value: '₹82K', accent: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  { icon: Eye,        label: 'Total Views',    value: '1.4M', accent: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  { icon: Award,      label: 'Success Rate',   value: '91%',  accent: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
];

const FEATURES = [
  { icon: CheckCircle2, label: 'Verified creators only', color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
  { icon: Zap,          label: '24-hour payouts',         color: '#e50914', bg: 'rgba(229,9,20,0.08)'    },
  { icon: Sparkles,     label: 'AI campaign matching',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)'  },
  { icon: Shield,       label: 'Escrow protection',       color: '#3b82f6', bg: 'rgba(59,130,246,0.08)'  },
];

const CAMPAIGNS = [
  { name: 'Urban Threads SS26',    budget: '₹45,000', days: 12 },
  { name: 'GlowLab Skincare Drop', budget: '₹28,500', days: 7  },
  { name: 'TechGear Pro Launch',   budget: '₹62,000', days: 21 },
];

export default function DashboardPreview() {
  const chartRef      = useRef(null);
  const chartInstance = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Earnings',
            data: [3200, 5400, 4100, 7800, 6200, 9100, 8400],
            borderColor: '#e50914',
            backgroundColor: 'rgba(229,9,20,0.07)',
            fill: true,
            tension: 0.45,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#e50914',
            borderWidth: 2,
          },
          {
            label: 'Views',
            data: [1800, 3200, 2600, 5100, 4200, 6300, 5800],
            borderColor: '#d1d5db',
            backgroundColor: 'transparent',
            borderDash: [4, 4],
            tension: 0.45,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 9 } } },
          y: { grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af', font: { size: 9 } } },
        },
      },
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [mounted]);

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
      <div style={{ width: 152, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#111111', borderRight: '1px solid #2a2a2a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid #2a2a2a' }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: '#e50914', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield style={{ width: 11, height: 11, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
            DRK<span style={{ color: '#e50914' }}>/</span>MTTR
          </span>
        </div>
        <nav style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                backgroundColor: active ? 'rgba(229,9,20,0.12)' : 'transparent',
                color: active ? '#e50914' : '#9ca3af',
              }}
            >
              <Icon style={{ width: 12, height: 12, flexShrink: 0 }} />
              <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: 10, borderTop: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#e50914', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>A</span>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#e5e7eb', lineHeight: 1.3 }}>Alex Creator</p>
            <p style={{ fontSize: 9, color: '#6b7280' }}>Influencer</p>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 46, flexShrink: 0, backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <Zap style={{ width: 10, height: 10, color: '#e50914' }} />
              <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e50914' }}>Creator Dashboard</span>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Welcome, Alex</p>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: '#e50914', color: '#fff', border: 'none', borderRadius: 5, padding: '4px 9px', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
            <Target style={{ width: 9, height: 9 }} />
            Browse Campaigns
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {STATS.map(({ icon: Icon, label, value, accent, bg }) => (
              <div key={label} style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 13, height: 13, color: accent }} />
                  </div>
                  <ArrowUpRight style={{ width: 11, height: 11, color: '#d1d5db' }} />
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#111', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 9, color: '#9ca3af', marginTop: 3, fontWeight: 500 }}>{label}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
            {FEATURES.map(({ icon: Icon, label, color, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, backgroundColor: '#fff', borderRadius: 7, border: '1px solid #e5e7eb', padding: '7px 9px' }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 10, height: 10, color }} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 500, color: '#374151', lineHeight: 1.3 }}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 10, flex: 1, minHeight: 0 }}>
            <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#111' }}>Earnings Overview</p>
                  <p style={{ fontSize: 9, color: '#9ca3af' }}>Last 7 days</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#e50914' }} />
                    <span style={{ fontSize: 9, color: '#6b7280' }}>Earnings</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#d1d5db' }} />
                    <span style={{ fontSize: 9, color: '#6b7280' }}>Views</span>
                  </div>
                </div>
              </div>
              <div style={{ height: 100 }}>
                <canvas ref={chartRef} />
              </div>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#111' }}>Available Campaigns</p>
                <span style={{ fontSize: 9, color: '#e50914', fontWeight: 600, cursor: 'pointer' }}>View all</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {CAMPAIGNS.map((c) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafafa', border: '1px solid #f3f4f6', borderRadius: 6, padding: '7px 9px', cursor: 'pointer' }}>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#111', lineHeight: 1.4 }}>{c.name}</p>
                      <p style={{ fontSize: 8.5, color: '#9ca3af' }}>{c.budget} · {c.days}d left</p>
                    </div>
                    <ChevronRight style={{ width: 9, height: 9, color: '#d1d5db', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
