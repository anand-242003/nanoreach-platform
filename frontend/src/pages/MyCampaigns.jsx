import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Loader2, DollarSign, Clock, Filter, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

const MyCampaigns = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMyCampaigns();
  }, [filter]);

  useEffect(() => {
    filterCampaigns();
  }, [searchQuery, allCampaigns]);

  const fetchMyCampaigns = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      const { data } = await api.get('/campaigns/my', { params });
      setAllCampaigns(data.campaigns);
      setCampaigns(data.campaigns);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    if (!searchQuery.trim()) {
      setCampaigns(allCampaigns);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = allCampaigns.filter(campaign => 
      campaign.title.toLowerCase().includes(query) ||
      campaign.description.toLowerCase().includes(query)
    );
    setCampaigns(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      DRAFT: 'bg-amber-50 text-amber-700 border border-amber-200',
      COMPLETED: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
    };
    return colors[status] || 'bg-neutral-100 text-neutral-600 border border-neutral-200';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = d - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Ends today';
    if (diffDays === 1) return 'Ends tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          <span className="text-neutral-600">Loading your campaigns...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">My Campaigns</h1>
            <p className="text-neutral-600 mt-2">Manage your brand campaigns</p>
          </div>
          <Button 
            onClick={() => navigate('/campaigns/create')}
            className="bg-neutral-900 hover:bg-neutral-800 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search your campaigns by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-6 text-base border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
            />
          </div>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700">Status:</span>
            
            {['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status === 'ALL' ? '' : status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  (status === 'ALL' && !filter) || filter === status
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        {campaigns.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-neutral-500 text-lg mb-4">No campaigns found</p>
            <Button 
              onClick={() => navigate('/campaigns/create')}
              className="bg-neutral-900 hover:bg-neutral-800"
            >
              Create Your First Campaign
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 mb-1">
                      {campaign.title}
                    </h3>
                  </div>
                  <Badge className={`${getStatusColor(campaign.status)} shrink-0 h-fit`}>
                    {campaign.status}
                  </Badge>
                </div>
                
                <div className="text-neutral-600 text-sm mb-4 line-clamp-3 flex-grow min-h-[60px]">
                  {campaign.description}
                </div>
                
                <div className="flex items-center gap-6 text-sm mb-4 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-neutral-400" />
                    <span className="font-semibold text-neutral-900">
                      {formatCurrency(campaign.prizePool)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-600">
                      {formatDate(campaign.deadline)}
                    </span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  View Details
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCampaigns;
