import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  ArrowLeft, Calendar, DollarSign, Users, Target, Clock, 
  CheckCircle, Loader2, Copy, ExternalLink, Trophy
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);
  const [submissionWindow, setSubmissionWindow] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pitch, setPitch] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const isInfluencer = user?.role === 'INFLUENCER';

  useEffect(() => {
    fetchCampaign();
    if (isInfluencer) {
      checkExistingApplication();
      checkSubmissionWindow();
    }
    fetchLeaderboard();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/campaigns/${id}`, { withCredentials: true });
      setCampaign(data.campaign || data);
    } catch (error) {
      setError('Campaign not found');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/applications/my?campaignId=${id}`, { withCredentials: true });
      if (data.application) setApplication(data.application);
    } catch (error) {}
  };

  const checkSubmissionWindow = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/submissions/campaign/${id}/window`, { withCredentials: true });
      setSubmissionWindow(data);
    } catch (error) {}
  };

  const fetchLeaderboard = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/submissions/campaign/${id}/leaderboard`, { withCredentials: true });
      setLeaderboard(data.leaderboard || []);
    } catch (error) {}
  };

  const handleApply = async () => {
    if (!pitch.trim()) {
      setError('Please write a pitch');
      return;
    }
    setApplying(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/applications`, {
        campaignId: id,
        pitch: pitch.trim(),
      }, { withCredentials: true });
      setApplication(data.application);
      setSuccess('Application submitted!');
      setPitch('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleSubmitContent = async () => {
    if (!contentUrl.trim()) {
      setError('Please enter your content URL');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API_URL}/submissions`, {
        campaignId: id,
        contentUrl: contentUrl.trim(),
      }, { withCredentials: true });
      setSuccess('Content submitted successfully!');
      setContentUrl('');
      checkSubmissionWindow();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-600 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-neutral-500 text-center py-12">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-600 mb-6 text-sm hover:text-neutral-900">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
            {campaign.status}
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 mt-2">{campaign.title}</h1>
        </div>

        {}
        <div className="flex border-b">
          {['details', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize ${
                activeTab === tab ? 'border-b-2 border-neutral-900' : 'text-neutral-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="p-6">
            {}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                <p className="text-lg font-bold">₹{campaign.budget?.toLocaleString()}</p>
                <p className="text-xs text-neutral-500">Prize Pool</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <Calendar className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                <p className="text-lg font-bold">{new Date(campaign.endDate).toLocaleDateString()}</p>
                <p className="text-xs text-neutral-500">Deadline</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <Users className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                <p className="text-lg font-bold">{campaign._count?.applications || 0}</p>
                <p className="text-xs text-neutral-500">Applications</p>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <Target className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
                <p className="text-lg font-bold">{campaign._count?.submissions || 0}</p>
                <p className="text-xs text-neutral-500">Submissions</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-neutral-600 text-sm whitespace-pre-line">{campaign.description}</p>
              </div>
              
              {campaign.contentRequirements && (
                <div>
                  <h2 className="font-semibold mb-2">Requirements</h2>
                  <p className="text-neutral-600 text-sm whitespace-pre-line">{campaign.contentRequirements}</p>
                </div>
              )}

              {campaign.prizeDistribution && (
                <div>
                  <h2 className="font-semibold mb-2">Prizes</h2>
                  <div className="space-y-2">
                    {campaign.prizeDistribution.map((prize, i) => (
                      <div key={i} className="flex justify-between p-3 bg-neutral-50 rounded">
                        <span>Rank {prize.rank}</span>
                        <span className="font-semibold">₹{prize.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="p-6">
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={entry.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-neutral-200 text-neutral-700' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-neutral-100 text-neutral-600'
                    }`}>
                      {entry.rank || i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{entry.influencer?.displayName || 'Anonymous'}</p>
                      <p className="text-sm text-neutral-500">Score: {entry.totalScore?.toFixed(1)}</p>
                    </div>
                    {entry.prizeAmount && (
                      <span className="font-bold text-green-600">₹{entry.prizeAmount.toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {}
        {isInfluencer && (
          <div className="p-6 border-t bg-neutral-50">
            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>}

            {!application ? (
              <div>
                <h3 className="font-semibold mb-3">Apply to Campaign</h3>
                <textarea
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  rows={3}
                  placeholder="Why are you a good fit?"
                  className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
                />
                <button onClick={handleApply} disabled={applying}
                  className="w-full py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50">
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {application.status === 'PENDING' && <Clock className="w-5 h-5 text-yellow-500" />}
                  {application.status === 'APPROVED' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  <span className="font-medium">Application {application.status}</span>
                </div>

                {application.status === 'APPROVED' && application.referralLink && (
                  <div className="mb-4 p-3 bg-white border rounded-lg">
                    <p className="text-xs text-neutral-500 mb-1">Your Referral Link:</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm flex-1 truncate">{application.referralLink.url}</code>
                      <button onClick={() => copyToClipboard(application.referralLink.url)} className="p-2 hover:bg-neutral-100 rounded">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {application.status === 'APPROVED' && submissionWindow?.window?.status === 'OPEN' && !submissionWindow.hasSubmitted && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Submit Your Content</h4>
                    <input
                      type="url"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
                    />
                    <button onClick={handleSubmitContent} disabled={submitting}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                      {submitting ? 'Submitting...' : 'Submit Content'}
                    </button>
                  </div>
                )}

                {submissionWindow?.hasSubmitted && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="w-5 h-5 text-green-600 inline mr-2" />
                    Content submitted! Check the leaderboard for your ranking.
                  </div>
                )}

                {submissionWindow?.window?.status === 'NOT_STARTED' && (
                  <p className="text-sm text-neutral-500 mt-4">
                    Submission window opens on {new Date(submissionWindow.window.opensAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
