import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '@/lib/axios';
import { CheckCircle, XCircle, User, Building2, ExternalLink, Loader2, Eye } from 'lucide-react';

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
        ? '/api/admin/verifications/influencers?status=UNDER_REVIEW'
        : '/api/admin/verifications/brands?status=UNDER_REVIEW';
      const { data } = await axios.get(endpoint);
      setItems(isInfluencer ? (data.influencers || []) : (data.brands || []));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to load pending verifications');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const endpoint = isInfluencer 
        ? `/api/admin/verifications/influencers/${id}/approve`
        : `/api/admin/verifications/brands/${id}/approve`;
      await axios.post(endpoint, { notes });
      setSelectedItem(null);
      setNotes('');
      fetchPending();
    } catch (error) {
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
        ? `/api/admin/verifications/influencers/${id}/reject`
        : `/api/admin/verifications/brands/${id}/reject`;
      await axios.post(endpoint, { notes });
      setSelectedItem(null);
      setNotes('');
      fetchPending();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isInfluencer ? 'Influencer' : 'Brand'} Verifications
        </h1>
        <p className="text-muted-foreground mt-1">Review and approve pending verifications</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/verifications/influencers')}
          className={`px-4 py-2 rounded-lg font-medium ${isInfluencer ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
        >
          Influencers
        </button>
        <button
          onClick={() => navigate('/admin/verifications/brands')}
          className={`px-4 py-2 rounded-lg font-medium ${!isInfluencer ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
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
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">No pending verifications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedItem?.id === item.id ? 'ring-2 ring-primary' : 'hover:border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    {isInfluencer ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {isInfluencer 
                        ? item.influencerProfile?.displayName || item.name
                        : item.brandProfile?.companyName || item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.email}</p>
                  </div>
                  <Eye className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>

          {selectedItem && (
            <div className="bg-white border rounded-xl p-6 sticky top-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Review Details</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{selectedItem.email}</p>
                </div>
                
                {isInfluencer && selectedItem.influencerProfile && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground">Display Name</label>
                      <p className="font-medium">{selectedItem.influencerProfile.displayName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Bio</label>
                      <p className="text-sm text-foreground">{selectedItem.influencerProfile.bio || 'N/A'}</p>
                    </div>
                    {selectedItem.influencerProfile.youtubeChannelUrl && (
                      <div>
                        <label className="text-sm text-muted-foreground">YouTube Channel</label>
                        <a 
                          href={selectedItem.influencerProfile.youtubeChannelUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary flex items-center gap-1 text-sm"
                        >
                          View Channel <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-muted-foreground">Subscribers</label>
                      <p className="font-medium">{selectedItem.influencerProfile.subscriberCount?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Categories</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedItem.influencerProfile.categoryTags?.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-muted rounded text-xs">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {!isInfluencer && selectedItem.brandProfile && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground">Company Name</label>
                      <p className="font-medium">{selectedItem.brandProfile.companyName}</p>
                    </div>
                    {selectedItem.brandProfile.website && (
                      <div>
                        <label className="text-sm text-muted-foreground">Website</label>
                        <a 
                          href={selectedItem.brandProfile.website} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary flex items-center gap-1 text-sm"
                        >
                          Visit Website <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-muted-foreground">Industry</label>
                      <p className="font-medium">{selectedItem.brandProfile.industry || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">GST Number</label>
                      <p className="font-medium">{selectedItem.brandProfile.gstNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">PAN Number</label>
                      <p className="font-medium">{selectedItem.brandProfile.panNumber || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="mb-6">
                <label className="text-sm text-muted-foreground block mb-2">Notes (required for rejection)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedItem.id)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
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
