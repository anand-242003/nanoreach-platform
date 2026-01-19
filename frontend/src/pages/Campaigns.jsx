import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, DollarSign, Clock, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  fetchCampaigns, 
  setFilters, 
  resetFilters 
} from '@/store/slices/campaignSlice';

const Campaigns = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    campaigns,
    loading,
    error,
    pagination,
    filters
  } = useSelector((state) => state.campaigns);
  
  useEffect(() => {
    dispatch(fetchCampaigns({ 
      page: pagination.page, 
      limit: pagination.limit,
      status: filters.status 
    }));
  }, [dispatch]);
  
  const handleFilterChange = (status) => {
    dispatch(setFilters({ status }));
    dispatch(fetchCampaigns({ 
      page: 1,
      limit: pagination.limit,
      status 
    }));
  };
  
  const handlePageChange = (newPage) => {
    dispatch(fetchCampaigns({ 
      page: newPage, 
      limit: pagination.limit,
      status: filters.status 
    }));
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
          <span className="text-neutral-600">Loading campaigns...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Button 
            onClick={() => dispatch(fetchCampaigns({ page: 1, limit: 10 }))}
            variant="destructive"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Campaigns</h1>
            <p className="text-neutral-600 mt-2">Manage and track your campaigns</p>
          </div>
          <Button 
            onClick={() => navigate('/campaigns/create')}
            className="bg-neutral-900 hover:bg-neutral-800 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
        
        {/* Filters */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700">Status:</span>
            
            {['ACTIVE', 'DRAFT', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.status === status
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {status}
              </button>
            ))}
            
            <button
              onClick={() => {
                dispatch(resetFilters());
                dispatch(fetchCampaigns({ page: 1, limit: 10, status: 'ACTIVE' }));
              }}
              className="ml-auto px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        
        {/* Empty State */}
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
          <>
            {/* Campaign Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {campaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 mb-1">
                        {campaign.title}
                      </h3>
                      {campaign.brand?.name && (
                        <p className="text-sm text-neutral-500">
                          by {campaign.brand.name}
                        </p>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(campaign.status)} shrink-0 h-fit`}>
                      {campaign.status}
                    </Badge>
                  </div>
                  
                  {/* Description */}
                  <div className="text-neutral-600 text-sm mb-4 line-clamp-3 flex-grow min-h-[60px]">
                    {campaign.description}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm mb-4 pb-4 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-neutral-400" />
                      <span className="font-semibold text-neutral-900">
                        {formatCurrency(campaign.budget || campaign.prizePool)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <span className="text-neutral-600">
                        {formatDate(campaign.deadline)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Button 
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
                  >
                    View Details
                  </Button>
                </motion.div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <p className="text-sm text-neutral-600">
                  Showing {campaigns.length} of {pagination.total} campaigns
                </p>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  
                  <span className="px-4 py-2 text-sm text-neutral-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <Button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
