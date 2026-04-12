import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Clock, CheckCircle, ExternalLink, Copy, Loader2 } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
export default function Submissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [referralStats, setReferralStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submissions');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [submissionsRes, referralRes] = await Promise.all([
        axios.get(`${API_URL}/api/submissions/my`, { withCredentials: true }).catch(() => ({ data: { submissions: [] } })),
        axios.get(`${API_URL}/api/referral/my-stats`, { withCredentials: true }).catch(() => ({ data: { stats: [] } })),
      ]);
      setSubmissions(submissionsRes.data.submissions || []);
      setReferralStats(referralRes.data.stats || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Activity</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your submissions and referrals</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'submissions' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Submissions
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'referrals' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
        >
          Referral Links
        </button>
      </div>

      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white border rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No submissions yet</p>
              <button
                onClick={() => navigate('/campaigns')}
                className="text-sm text-primary font-medium hover:underline"
              >
                Browse campaigns to apply
              </button>
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} className="bg-white border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{sub.campaign?.title}</h3>
                    <a 
                      href={sub.contentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary flex items-center gap-1"
                    >
                      View Content <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    sub.validationStatus === 'APPROVED' ? 'bg-primary/10 text-primary' :
                    sub.validationStatus === 'REJECTED' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {sub.validationStatus}
                  </span>
                </div>
                
                {sub.leaderboardEntry && (
                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Rank</p>
                      <p className="text-lg font-bold">#{sub.leaderboardEntry.rank || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Score</p>
                      <p className="text-lg font-bold">{sub.leaderboardEntry.totalScore?.toFixed(1) || '0'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="text-lg font-bold">{sub.leaderboardEntry.engagementScore?.toFixed(1) || '0'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Prize</p>
                      <p className="text-lg font-bold text-primary">
                        {sub.leaderboardEntry.prizeAmount ? `₹${sub.leaderboardEntry.prizeAmount.toLocaleString()}` : '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="space-y-4">
          {referralStats.length === 0 ? (
            <div className="bg-white border rounded-lg p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No referral links yet. Apply to campaigns to get your unique links!</p>
            </div>
          ) : (
            referralStats.map((stat, index) => (
              <div key={index} className="bg-white border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{stat.campaign?.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      stat.campaign?.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-muted'
                    }`}>
                      {stat.campaign?.status}
                    </span>
                  </div>
                </div>
                
                {stat.referralLink && (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
                      <code className="text-sm flex-1 truncate">{stat.referralLink.url}</code>
                      <button 
                        onClick={() => copyToClipboard(stat.referralLink.url)}
                        className="p-2 hover:bg-muted/80 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{stat.referralLink.totalClicks}</p>
                        <p className="text-xs text-primary">Total Clicks</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{stat.referralLink.uniqueClicks}</p>
                        <p className="text-xs text-purple-700">Unique Clicks</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-foreground">{stat.referralLink.conversions}</p>
                        <p className="text-xs text-muted-foreground">Conversions</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
