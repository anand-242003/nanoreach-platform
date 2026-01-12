import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Loader2, DollarSign, Users, Clock, Filter } from 'lucide-react';
import { 
  fetchCampaigns, 
  setFilters, 
  resetFilters 
} from '@/store/slices/campaignSlice';

const Campaigns = () => {
  const dispatch = useDispatch();
  
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
  
  const handleResetFilters = () => {
    dispatch(resetFilters());
    dispatch(fetchCampaigns({ page: 1, limit: 10, status: 'ACTIVE' }));
  };
  
  const renderLoading = () => (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      <span className="ml-3 text-neutral-500">Loading campaigns...</span>
    </div>
  );
  
  const renderError = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <p className="text-red-600 font-medium">{error}</p>
      <button 
        onClick={() => dispatch(fetchCampaigns({ page: 1, limit: 10 }))}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
  
  const renderEmpty = () => (
    <div className="text-center py-20">
      <p className="text-neutral-500 text-lg">No campaigns found</p>
      <button 
        onClick={handleResetFilters}
        className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
      >
        Reset Filters
      </button>
    </div>
  );
  
  const renderCampaignCard = (campaign) => (
    <motion.div
      key={campaign.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900">{campaign.title}</h3>
          <p className="text-sm text-neutral-500 mt-1">by {campaign.brand?.name}</p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          {campaign.status}
        </span>
      </div>
      
      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
        {campaign.description}
      </p>
      
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">${campaign.prizePool}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-neutral-400" />
          <span>{new Date(campaign.deadline).toLocaleDateString()}</span>
        </div>
      </div>
      
      <button className="mt-4 w-full py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors">
        View Details
      </button>
    </motion.div>
  );
  
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900">Browse Campaigns</h1>
          <p className="text-neutral-600 mt-2">Find campaigns that match your niche</p>
        </div>
        
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <Filter className="w-5 h-5 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700">Filter by status:</span>
            
            {['ACTIVE', 'DRAFT', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.status === status
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {status}
              </button>
            ))}
            
            <button
              onClick={handleResetFilters}
              className="ml-auto px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900"
            >
              Reset
            </button>
          </div>
        </div>
        
        {loading && renderLoading()}
        {error && !loading && renderError()}
        {!loading && !error && campaigns.length === 0 && renderEmpty()}
        
        {!loading && !error && campaigns.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {campaigns.map(renderCampaignCard)}
            </div>
            
            <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-2xl p-6">
              <p className="text-sm text-neutral-600">
                Showing {campaigns.length} of {pagination.total} campaigns
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-6">
            <p className="font-bold mb-2 text-sm">Redux State (Debug):</p>
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify({ campaigns, loading, error, pagination, filters }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Campaigns;
