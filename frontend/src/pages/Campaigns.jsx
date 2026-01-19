import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Search, Filter, Target, Calendar, DollarSign, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Campaigns() {
  const navigate = useNavigate();
  const { verificationStatus } = useSelector((state) => state.auth);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/campaigns?status=ACTIVE`, { withCredentials: true });
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Fetch campaigns error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  if (verificationStatus !== 'VERIFIED') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-amber-50 rounded-xl p-8 text-center">
          <Target className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verification Required</h2>
          <p className="text-neutral-600 mb-6">Complete your profile verification to browse campaigns.</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-neutral-900 text-white rounded-lg"
          >
            Complete Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Campaigns</h1>
          <p className="text-neutral-600 mt-1">Discover and apply to campaigns</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 border rounded-lg hover:bg-neutral-50">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No campaigns found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/campaigns/${campaign.id}`)}
              className="bg-white border rounded-xl p-6 hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                  {campaign.status}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">
                {campaign.title}
              </h3>
              <p className="text-sm text-neutral-500 mb-4 line-clamp-3">
                {campaign.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {campaign.categoryTags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs bg-neutral-100 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <DollarSign className="w-4 h-4" />
                  ₹{campaign.budget?.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Calendar className="w-4 h-4" />
                  {new Date(campaign.endDate).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
