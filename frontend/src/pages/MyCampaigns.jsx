import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Loader2, DollarSign, Clock, Filter, Plus, Search, Target } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export default function MyCampaigns() {
  const navigate = useNavigate();
  const { verificationStatus } = useSelector((state) => state.auth);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMyCampaigns();
  }, [filter]);

  const fetchMyCampaigns = async () => {
    try {
      setLoading(true);
      const params = filter ? `?status=${filter}` : '';
      const { data } = await axios.get(`${API_URL}/api/campaigns/my${params}`, { withCredentials: true });
      setCampaigns(data.campaigns || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (verificationStatus === 'UNDER_REVIEW') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-muted rounded-xl p-10 text-center border border-border">
          <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Profile Under Review</h2>
          <p className="text-muted-foreground">Your brand profile is being reviewed. Campaigns will be available here once your account is approved.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-primary/10 text-primary',
      DRAFT: 'bg-muted text-muted-foreground',
      COMPLETED: 'bg-muted text-muted-foreground',
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Campaigns</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your brand campaigns</p>
        </div>
        <button 
          onClick={() => navigate('/campaigns/create')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Status:</span>
          {['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status === 'ALL' ? '' : status)}
              className={`px-3 py-1 rounded text-sm ${
                (status === 'ALL' && !filter) || filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No campaigns found</p>
          <button 
            onClick={() => navigate('/campaigns/create')}
            className="text-sm text-primary font-medium hover:underline"
          >
            Create your first campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              onClick={() => navigate(`/campaigns/${campaign.id}`)}
              className="bg-card border rounded-lg p-5 hover:border-foreground/30 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground line-clamp-1">{campaign.title}</h3>
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{campaign.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  ₹{campaign.budget?.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(campaign.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
