import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  MousePointer, 
  Users, 
  IndianRupee,
  RefreshCw,
  BarChart3,
} from 'lucide-react';

export default function ReferralLinkCard({ referralLink, campaign, showAnalytics = false, onRefresh }) {
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(referralLink.url);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const stats = [
    {
      label: 'Total Clicks',
      value: referralLink.totalClicks || 0,
      icon: MousePointer,
      color: 'text-blue-600',
    },
    {
      label: 'Unique Clicks',
      value: referralLink.uniqueClicks || 0,
      icon: Users,
      color: 'text-green-600',
    },
    {
      label: 'Conversions',
      value: referralLink.conversions || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      label: 'Revenue',
      value: `₹${(referralLink.revenue || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-orange-600',
    },
  ];

  const conversionRate = referralLink.uniqueClicks > 0 
    ? ((referralLink.conversions / referralLink.uniqueClicks) * 100).toFixed(1)
    : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{campaign?.title || 'Campaign'}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {referralLink.code}
              </Badge>
              {referralLink.lastClickAt && (
                <span className="text-xs">
                  Last click: {new Date(referralLink.lastClickAt).toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Link</label>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted rounded-lg px-3 py-2 font-mono text-sm break-all">
              {referralLink.url}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={copying}
            >
              <Copy className={`h-4 w-4 ${copying ? 'text-green-500' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={referralLink.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-muted/50 rounded-lg p-3 text-center hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center mb-1">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">Conversion Rate</span>
          </div>
          <Badge variant="outline" className="bg-white dark:bg-background">
            {conversionRate}%
          </Badge>
        </div>

        {showAnalytics && referralLink.recentClicks?.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recent Clicks</label>
            <div className="space-y-1">
              {referralLink.recentClicks.slice(0, 5).map((click, index) => (
                <div 
                  key={click.id || index}
                  className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {click.deviceType || 'Desktop'}
                    </Badge>
                    <span className="text-muted-foreground">
                      {click.browser || 'Unknown'}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(click.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
