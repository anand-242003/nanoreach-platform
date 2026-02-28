import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, DollarSign, Clock, Filter, Plus, Search, Target } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export default function MyCampaigns() {
  const navigate = useNavigate();
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
      const { data } = await axios.get(`${API_URL}/campaigns/my${params}`, { withCredentials: true });
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700',
      DRAFT: 'bg-yellow-100 text-yellow-700',
      COMPLETED: 'bg-neutral-100 text-neutral-600',
    };
    return colors[status] || 'bg-neutral-100 text-neutral-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Campaigns</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your brand campaigns</p>
        </div>
        <button 
          onClick={() => navigate('/campaigns/create')}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
      </div>
      
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-600">Status:</span>
          {['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status === 'ALL' ? '' : status)}
              className={`px-3 py-1 rounded text-sm ${
                (status === 'ALL' && !filter) || filter === status
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <Target className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 mb-4">No campaigns found</p>
          <button 
            onClick={() => navigate('/campaigns/create')}
            className="text-sm text-neutral-900 font-medium hover:underline"
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
              className="bg-white border rounded-lg p-5 hover:border-neutral-400 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-neutral-900 line-clamp-1">{campaign.title}</h3>
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{campaign.description}</p>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
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
