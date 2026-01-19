import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, TrendingUp, Users, Target, Award, Clock, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const endpoint = user?.role === 'BRAND' ? '/campaigns/my' : '/campaigns';
      const { data } = await api.get(endpoint, { params: { limit: 4 } });
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = [
    { id: 'all', label: 'All Campaigns', icon: Target, description: 'Everything, past & present' },
    { id: 'featured', label: 'Featured', icon: Award, description: 'Premium challenges with prizes' },
    { id: 'getting-started', label: 'Getting Started', icon: TrendingUp, description: 'Approachable fundamentals' },
    { id: 'research', label: 'Research', icon: Users, description: 'Scientific and scholarly challenges' },
  ];

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
    if (diffDays <= 7) return `${diffDays} days left`;
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Illustration */}
      <div className="md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-12 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
                {user?.role === 'BRAND' 
                  ? 'Host your brand campaign on DRK/MTTR'
                  : 'Grow your influence with brand campaigns'}
              </h1>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                {user?.role === 'BRAND'
                  ? "Whether you're launching a product, building awareness, or engaging your audience, the DRK/MTTR platform connects you with talented creators to amplify your brand goals."
                  : "Discover exciting brand campaigns, showcase your creativity, and earn rewards. Find help in the documentation or learn about Community Campaigns."}
              </p>
              <Button 
                onClick={() => navigate(user?.role === 'BRAND' ? '/campaigns/create' : '/campaigns')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-6 text-base rounded-lg"
              >
                {user?.role === 'BRAND' ? 'Create a Campaign' : 'Browse Campaigns'}
              </Button>
            </div>
            
            {/* Illustration */}
            <div className=" lg:flex items-center justify-center">
              <img 
                src="/competition-logo.png" 
                alt="Competition" 
                className="w-80 h-80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaigns"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Categories */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {filterCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeFilter === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-3 px-5 py-3 border rounded-lg transition-all group",
                  isActive 
                    ? "bg-slate-900 text-white border-slate-900" 
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                )} />
                <div className="text-left">
                  <div className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-white" : "text-slate-900"
                  )}>{category.label}</div>
                  <div className={cn(
                    "text-xs",
                    isActive ? "text-slate-300" : "text-slate-500"
                  )}>{category.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              <h2 className="text-2xl font-bold text-slate-900">
                {user?.role === 'BRAND' ? 'Your Campaigns' : 'Getting Started'}
              </h2>
            </div>
            <p className="text-sm text-slate-600">
              {user?.role === 'BRAND' 
                ? 'Manage your active campaigns'
                : 'Campaigns with approachable fundamentals'}
            </p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            See all →
          </button>
        </div>
      </div>

      {/* Campaign Cards Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden animate-pulse">
                <div className="h-40 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-lg p-12 text-center">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No campaigns yet</h3>
            <p className="text-slate-600 mb-6">
              {user?.role === 'BRAND' 
                ? 'Create your first campaign to start working with creators'
                : 'Browse available campaigns to get started'}
            </p>
            <Button 
              onClick={() => navigate(user?.role === 'BRAND' ? '/campaigns/create' : '/campaigns')}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {user?.role === 'BRAND' ? 'Create Campaign' : 'Browse Campaigns'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group"
              >
                {/* Campaign Image */}
                <div className="relative h-40  overflow-hidden">
                  <div className="absolute inset-0" />
                  
                  {/* Brand Logo Circle */}
                  <div className="absolute bottom-3 left-3 w-12 h-12 bg-white rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-900">
                      {campaign.brand?.name?.substring(0, 2).toUpperCase() || user?.name?.substring(0, 2).toUpperCase() || 'BR'}
                    </span>
                  </div>
                </div>

                {/* Campaign Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {campaign.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    {campaign.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(campaign.prizePool || campaign.budget)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(campaign.deadline)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Why Section */}
      {user?.role === 'BRAND' && (
        <div className="max-w-7xl mx-auto mt-16 mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Why a DRK/MTTR Campaign?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-slate-600 mb-6 leading-relaxed">
                DRK/MTTR is the home of creator marketing, with thousands of talented creators ready to amplify your brand message through authentic content and engagement.
              </p>
              <p className="text-slate-600 leading-relaxed">
                You set the terms, creators submit their work, and our platform scores their submissions in real-time to find the perfect match for your brand.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Campaign Features</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Creator Network</div>
                    <div className="text-sm text-slate-600">Access thousands of verified creators</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Real-time Analytics</div>
                    <div className="text-sm text-slate-600">Track performance and engagement</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
