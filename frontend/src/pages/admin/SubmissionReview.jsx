import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, ExternalLink, CheckCircle, Trophy } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export default function SubmissionReview() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [scores, setScores] = useState({ engagementScore: 0, referralScore: 0, qualityScore: 0, feedback: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [campaignId]);

  const fetchData = async () => {
    try {
      const [subRes, campRes] = await Promise.all([
        axios.get(`${API_URL}/submissions/campaign/${campaignId}`, { withCredentials: true }),
        axios.get(`${API_URL}/campaigns/${campaignId}`, { withCredentials: true }),
      ]);
      setSubmissions(subRes.data.submissions || []);
      setCampaign(campRes.data.campaign);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScore = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/submissions/${selected.id}/score`, scores, { withCredentials: true });
      setSelected(null);
      setScores({ engagementScore: 0, referralScore: 0, qualityScore: 0, feedback: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRevealLeaderboard = async () => {
    const prizeAmounts = {};
    campaign?.prizeDistribution?.forEach(p => { prizeAmounts[p.rank] = p.amount; });
    
    try {
      await axios.post(`${API_URL}/submissions/campaign/${campaignId}/reveal`, { prizeAmounts }, { withCredentials: true });
      alert('Leaderboard revealed!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-600 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{campaign?.title}</h1>
          <p className="text-neutral-500 text-sm">Review and score submissions</p>
        </div>
        {submissions.length > 0 && campaign?.status !== 'COMPLETED' && (
          <button onClick={handleRevealLeaderboard} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Reveal Results
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-white border rounded-lg p-12 text-center">
              <p className="text-neutral-500">No submissions yet</p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div key={sub.id} onClick={() => { setSelected(sub); setScores({ engagementScore: sub.leaderboardEntry?.engagementScore || 0, referralScore: sub.leaderboardEntry?.referralScore || 0, qualityScore: sub.leaderboardEntry?.qualityScore || 0, feedback: sub.adminNotes || '' }); }}
                className={`bg-white border rounded-lg p-4 cursor-pointer ${selected?.id === sub.id ? 'ring-2 ring-neutral-900' : 'hover:border-neutral-400'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{sub.influencer?.displayName || 'Unknown'}</span>
                  <span className={`px-2 py-1 text-xs rounded ${sub.validationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {sub.validationStatus}
                  </span>
                </div>
                <a href={sub.contentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 flex items-center gap-1">
                  View Content <ExternalLink className="w-3 h-3" />
                </a>
                {sub.leaderboardEntry && (
                  <p className="text-sm text-neutral-500 mt-2">Score: {sub.leaderboardEntry.totalScore?.toFixed(1)} | Rank: #{sub.leaderboardEntry.rank || '-'}</p>
                )}
              </div>
            ))
          )}
        </div>

        {selected && (
          <div className="bg-white border rounded-lg p-6 sticky top-6 h-fit">
            <h2 className="font-semibold mb-4">Score Submission</h2>
            <p className="text-sm text-neutral-500 mb-4">{selected.influencer?.displayName}</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Engagement Score (40%)</label>
                <input type="range" min="0" max="100" value={scores.engagementScore} onChange={(e) => setScores({ ...scores, engagementScore: parseInt(e.target.value) })} className="w-full" />
                <span className="text-sm">{scores.engagementScore}</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Referral Score (30%)</label>
                <input type="range" min="0" max="100" value={scores.referralScore} onChange={(e) => setScores({ ...scores, referralScore: parseInt(e.target.value) })} className="w-full" />
                <span className="text-sm">{scores.referralScore}</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Quality Score (30%)</label>
                <input type="range" min="0" max="100" value={scores.qualityScore} onChange={(e) => setScores({ ...scores, qualityScore: parseInt(e.target.value) })} className="w-full" />
                <span className="text-sm">{scores.qualityScore}</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Feedback (for influencer)</label>
                <textarea value={scores.feedback} onChange={(e) => setScores({ ...scores, feedback: e.target.value })} rows={3} placeholder="Why they scored this way..." className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg mb-4">
              <p className="text-sm">Total Score: <strong>{(scores.engagementScore * 0.4 + scores.referralScore * 0.3 + scores.qualityScore * 0.3).toFixed(1)}</strong></p>
            </div>

            <button onClick={handleScore} disabled={saving} className="w-full py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Score
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
