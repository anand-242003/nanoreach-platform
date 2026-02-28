import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, User, Building2, ExternalLink, Loader2, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export default function VerificationQueue() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const isInfluencer = type === 'influencers';

  useEffect(() => {
    fetchPending();
  }, [type]);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const endpoint = isInfluencer 
        ? '/admin/verifications/influencers?status=UNDER_REVIEW'
        : '/admin/verifications/brands?status=UNDER_REVIEW';
      const { data } = await axios.get(`${API_URL}${endpoint}`, { withCredentials: true });
      setItems(isInfluencer ? (data.influencers || []) : (data.brands || []));
    } catch (error) {
      console.error('Fetch error:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const endpoint = isInfluencer 
        ? `/admin/verifications/influencers/${id}/approve`
        : `/admin/verifications/brands/${id}/approve`;
      await axios.post(`${API_URL}${endpoint}`, { notes }, { withCredentials: true });
      setSelectedItem(null);
      setNotes('');
      fetchPending();
    } catch (error) {
      console.error('Approve error:', error);
      alert(error.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!notes || notes.length < 10) {
      alert('Please provide a reason for rejection (min 10 characters)');
      return;
    }
    setActionLoading(true);
    try {
      const endpoint = isInfluencer 
        ? `/admin/verifications/influencers/${id}/reject`
        : `/admin/verifications/brands/${id}/reject`;
      await axios.post(`${API_URL}${endpoint}`, { notes }, { withCredentials: true });
      setSelectedItem(null);
      setNotes('');
      fetchPending();
    } catch (error) {
      console.error('Reject error:', error);
      alert(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">
          {isInfluencer ? 'Influencer' : 'Brand'} Verifications
        </h1>
        <p className="text-neutral-600 mt-1">Review and approve pending verifications</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/verifications/influencers')}
          className={`px-4 py-2 rounded-lg font-medium ${isInfluencer ? 'bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}
        >
          Influencers
        </button>
        <button
          onClick={() => navigate('/admin/verifications/brands')}
          className={`px-4 py-2 rounded-lg font-medium ${!isInfluencer ? 'bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200'}`}
        >
          Brands
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-neutral-500 text-lg">No pending verifications</p>
          {}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedItem?.id === item.id ? 'ring-2 ring-neutral-900' : 'hover:border-neutral-400'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    {isInfluencer ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {isInfluencer 
                        ? item.influencerProfile?.displayName || item.name
                        : item.brandProfile?.companyName || item.name}
                    </h3>
                    <p className="text-sm text-neutral-500">{item.email}</p>
                  </div>
                  <Eye className="w-5 h-5 text-neutral-400" />
                </div>
              </div>
            ))}
          </div>

          {selectedItem && (
            <div className="bg-white border rounded-xl p-6 sticky top-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Review Details</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-neutral-500">Email</label>
                  <p className="font-medium">{selectedItem.email}</p>
                </div>
                
                {isInfluencer && selectedItem.influencerProfile && (
                  <>
                    <div>
                      <label className="text-sm text-neutral-500">Display Name</label>
                      <p className="font-medium">{selectedItem.influencerProfile.displayName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-500">Bio</label>
                      <p className="text-sm text-neutral-700">{selectedItem.influencerProfile.bio || 'N/A'}</p>
                    </div>
                    {selectedItem.influencerProfile.youtubeChannelUrl && (
                      <div>
                        <label className="text-sm text-neutral-500">YouTube Channel</label>
                        <a 
                          href={selectedItem.influencerProfile.youtubeChannelUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 flex items-center gap-1 text-sm"
                        >
                          View Channel <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-neutral-500">Subscribers</label>
                      <p className="font-medium">{selectedItem.influencerProfile.subscriberCount?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-500">Categories</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedItem.influencerProfile.categoryTags?.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-neutral-100 rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {!isInfluencer && selectedItem.brandProfile && (
                  <>
                    <div>
                      <label className="text-sm text-neutral-500">Company Name</label>
                      <p className="font-medium">{selectedItem.brandProfile.companyName}</p>
                    </div>
                    {selectedItem.brandProfile.website && (
                      <div>
                        <label className="text-sm text-neutral-500">Website</label>
                        <a 
                          href={selectedItem.brandProfile.website} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 flex items-center gap-1 text-sm"
                        >
                          Visit Website <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-neutral-500">Industry</label>
                      <p className="font-medium">{selectedItem.brandProfile.industry || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-500">GST Number</label>
                      <p className="font-medium">{selectedItem.brandProfile.gstNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-500">PAN Number</label>
                      <p className="font-medium">{selectedItem.brandProfile.panNumber || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="mb-6">
                <label className="text-sm text-neutral-500 block mb-2">Notes (required for rejection)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedItem.id)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedItem.id)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
