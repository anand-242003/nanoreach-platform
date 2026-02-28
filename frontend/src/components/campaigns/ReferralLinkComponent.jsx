import { useState, useEffect } from 'react';
import { Copy, Check, TrendingUp, Users, MousePointer, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import axios from '@/lib/axios';

const ReferralLinkComponent = ({ campaignId, applicationId }) => {
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReferralLink();
  }, [campaignId]);

  const fetchReferralLink = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/referral/my/${campaignId}`);
      setReferralData(response.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = async () => {
    try {
      setGenerating(true);
      const response = await axios.post(`/api/referral/generate/${applicationId}`);
      setReferralData({
        hasLink: true,
        referralLink: response.data.referralLink,
        campaign: referralData?.campaign
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate referral link');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!referralData?.referralLink?.url) return;
    
    try {
      await navigator.clipboard.writeText(referralData.referralLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/referral/${campaignId}/stats`);
      setReferralData(prev => ({
        ...prev,
        stats: response.data.stats,
        analytics: response.data.analytics
      }));
    } catch (error) {
    }
  };

  useEffect(() => {
    if (referralData?.hasLink) {
      fetchStats();
      
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [referralData?.hasLink]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Link</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!referralData?.hasLink) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Referral Link</CardTitle>
          <CardDescription>
            Generate your unique referral link to share with your audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generateReferralLink} 
            disabled={generating || !referralData?.canGenerate}
          >
            {generating ? 'Generating...' : 'Generate Referral Link'}
          </Button>
          {!referralData?.canGenerate && (
            <p className="text-sm text-muted-foreground mt-2">
              Your application must be approved to generate a referral link
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const { referralLink, stats, analytics } = referralData;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link to track clicks and earn conversions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted p-3 rounded-md font-mono text-sm break-all">
              {referralLink.url}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(referralLink.url, '_blank')}
              title="Open link"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>

          {copied && (
            <p className="text-sm text-green-600 font-medium">
               Copied to clipboard!
            </p>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Code: <span className="font-mono font-semibold">{referralLink.uniqueCode}</span></p>
            <p>Created: {new Date(referralLink.createdAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClicks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.uniqueClicks} unique visitors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clickThroughRate}%</div>
              <p className="text-xs text-muted-foreground">
                Unique / Total clicks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionRate}% conversion rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Detailed insights for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last 24 Hours</p>
                <p className="text-2xl font-bold">{analytics.last24Hours} clicks</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last 7 Days</p>
                <p className="text-2xl font-bold">{analytics.last7Days} clicks</p>
              </div>
            </div>

            {analytics.topCountries && analytics.topCountries.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Top Countries</p>
                <div className="space-y-2">
                  {analytics.topCountries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{country.country}</span>
                      <span className="font-semibold">{country.count} clicks</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.devices && (
              <div>
                <p className="text-sm font-medium mb-2">Device Breakdown</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span> Mobile</span>
                    <span className="font-semibold">{analytics.devices.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span> Desktop</span>
                    <span className="font-semibold">{analytics.devices.desktop}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span> Tablet</span>
                    <span className="font-semibold">{analytics.devices.tablet}</span>
                  </div>
                  {analytics.devices.bot > 0 && (
                    <div className="flex items-center justify-between text-sm text-orange-600">
                      <span>Bots (filtered)</span>
                      <span className="font-semibold">{analytics.devices.bot}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralLinkComponent;
