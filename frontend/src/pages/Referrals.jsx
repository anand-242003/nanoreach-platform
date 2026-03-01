import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getMyReferralStats } from '@/api/referrals';
import { BarChart3, Copy, ExternalLink, MousePointerClick, TrendingUp, DollarSign, Eye } from 'lucide-react';

export default function Referrals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await getMyReferralStats();
      setData(result.stats || []);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to load referral stats',
        variant: 'destructive',
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied', description: 'Referral link copied to clipboard' });
  };

  const totalClicks = data?.reduce((s, r) => s + (r.referralLink?.totalClicks || 0), 0) ?? 0;
  const totalUnique = data?.reduce((s, r) => s + (r.referralLink?.uniqueClicks || 0), 0) ?? 0;
  const totalConversions = data?.reduce((s, r) => s + (r.referralLink?.conversions || 0), 0) ?? 0;
  const totalRevenue = data?.reduce((s, r) => s + (r.referralLink?.revenue || 0), 0) ?? 0;

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-8 bg-muted rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Referral Links</h1>
        <p className="text-muted-foreground text-sm mt-1">Track performance across all your campaigns</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Clicks', value: totalClicks, icon: MousePointerClick },
          { label: 'Unique Clicks', value: totalUnique, icon: Eye },
          { label: 'Conversions', value: totalConversions, icon: TrendingUp },
          { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-background border border-border rounded-lg p-5">
            <Icon className="w-5 h-5 text-muted-foreground mb-3" />
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-background">
          <h2 className="font-semibold text-foreground">Your Referral Links</h2>
        </div>

        {!data || data.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">No referral links yet</p>
            <p className="text-sm text-muted-foreground mb-4">Apply to campaigns and get approved to receive referral links</p>
            <button
              onClick={() => navigate('/campaigns')}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
            >
              Browse Campaigns
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.map((item, idx) => (
              <div key={idx} className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.campaign?.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      item.campaign?.status === 'ACTIVE'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.campaign?.status}
                    </span>
                  </div>
                  {item.referralLink && (
                    <button
                      onClick={() => navigate(`/referral/${item.campaign?.id}/analytics`)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                    >
                      View Analytics <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {item.referralLink ? (
                  <>
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mb-4">
                      <span className="text-xs text-muted-foreground truncate flex-1 font-mono">{item.referralLink.url}</span>
                      <button onClick={() => copyLink(item.referralLink.url)} className="shrink-0 text-muted-foreground hover:text-foreground">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Total Clicks', value: item.referralLink.totalClicks },
                        { label: 'Unique', value: item.referralLink.uniqueClicks },
                        { label: 'Conversions', value: item.referralLink.conversions },
                        { label: 'Revenue', value: `₹${(item.referralLink.revenue || 0).toLocaleString()}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center p-3 border border-border rounded-lg">
                          <p className="text-lg font-bold text-foreground">{value}</p>
                          <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
                    Referral link not generated yet — awaiting campaign approval
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
