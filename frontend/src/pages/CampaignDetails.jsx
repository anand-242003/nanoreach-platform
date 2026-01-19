import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ArrowLeft, Calendar, DollarSign, Users, Target, Clock, CheckCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [application, setApplication] = useState(null);
  const [pitch, setPitch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isInfluencer = user?.role === 'INFLUENCER';
  const isBrand = user?.role === 'BRAND';

  useEffect(() => {
    fetchCampaign();
    if (isInfluencer) {
      checkExistingApplication();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/campaigns/${id}`, { withCredentials: true });
      setCampaign(data.campaign || data);
    } catch (error) {
      console.error('Fetch campaign error:', error);
      setError('Campaign not found');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/applications/my?campaignId=${id}`, { withCredentials: true });
      if (data.application) {
        setApplication(data.application);
      }
    } catch (error) {
      // No existing application
    }
  };

  const handleApply = async () => {
    if (!pitch.trim()) {
      setError('Please write a pitch explaining why you want to join this campaign');
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
      setSuccess('Application submitted successfully!');
      setPitch('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-600 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="text-center py-12">
          <p className="text-neutral-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-600 mb-6 text-sm hover:text-neutral-900">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </button>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between mb-4">
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
              {campaign.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">{campaign.title}</h1>
          <p className="text-neutral-500 text-sm">by {campaign.brand?.name || 'Brand'}</p>
        </div>

        <div className="p-6 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-neutral-400 mx-auto mb-2" />
              <p className="text-lg font-bold">₹{campaign.budget?.toLocaleString()}</p>
              <p className="text-xs text-neutral-500">Budget</p>
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
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-neutral-600 text-sm whitespace-pre-line">{campaign.description}</p>
          </div>

          {campaign.categoryTags?.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {campaign.categoryTags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-neutral-100 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {campaign.contentRequirements && (
            <div>
              <h2 className="font-semibold mb-2">Content Requirements</h2>
              <p className="text-neutral-600 text-sm whitespace-pre-line">{campaign.contentRequirements}</p>
            </div>
          )}

          {campaign.rules && (
            <div>
              <h2 className="font-semibold mb-2">Rules</h2>
              <p className="text-neutral-600 text-sm whitespace-pre-line">{campaign.rules}</p>
            </div>
          )}

          {campaign.prizeDistribution && (
            <div>
              <h2 className="font-semibold mb-2">Prize Distribution</h2>
              <div className="space-y-2">
                {campaign.prizeDistribution.map((prize, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                    <span className="text-sm">Rank {prize.rank}: {prize.description}</span>
                    <span className="font-semibold">₹{prize.amount?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Application Section for Influencers */}
        {isInfluencer && campaign.status === 'ACTIVE' && (
          <div className="p-6 border-t bg-neutral-50">
            {application ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {application.status === 'PENDING' && (
                    <>
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Application Pending</p>
                        <p className="text-sm text-neutral-500">Your application is under review</p>
                      </div>
                    </>
                  )}
                  {application.status === 'APPROVED' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Application Approved</p>
                        <p className="text-sm text-neutral-500">You can now submit your content after the deadline</p>
                      </div>
                    </>
                  )}
                  {application.status === 'REJECTED' && (
                    <>
                      <Target className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium">Application Rejected</p>
                        <p className="text-sm text-neutral-500">{application.rejectionReason || 'Your application was not selected'}</p>
                      </div>
                    </>
                  )}
                </div>

                {application.status === 'APPROVED' && (
                  <div className="p-4 bg-white border rounded-lg">
                    <h3 className="font-semibold mb-2">Next Steps</h3>
                    <ol className="text-sm text-neutral-600 space-y-2">
                      <li>1. Create content according to the requirements above</li>
                      <li>2. Post it on your YouTube channel</li>
                      <li>3. Submit your content link after the campaign deadline</li>
                      <li>4. Wait for results on {campaign.resultsDate ? new Date(campaign.resultsDate).toLocaleDateString() : 'TBA'}</li>
                    </ol>
                    {application.referralLink && (
                      <div className="mt-4 p-3 bg-neutral-50 rounded">
                        <p className="text-xs text-neutral-500 mb-1">Your referral link:</p>
                        <code className="text-sm break-all">{application.referralLink.url}</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-3">Apply to this Campaign</h3>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                    {success}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Your Pitch
                  </label>
                  <textarea
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    rows={4}
                    placeholder="Explain why you're a good fit for this campaign, your content plan, and relevant experience..."
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>

                <p className="text-xs text-neutral-500 text-center mt-3">
                  After applying, the brand will review your application. If approved, you'll be able to submit your content.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
