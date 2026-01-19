import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCampaignById, clearCurrentCampaign } from '@/store/slices/campaignSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, DollarSign, Clock, Calendar, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { currentCampaign, loading, error } = useSelector((state) => state.campaigns);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchCampaignById(id));
    }
    return () => {
      dispatch(clearCurrentCampaign());
    };
  }, [id, dispatch]);

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
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          <span className="text-neutral-600">Loading campaign...</span>
        </div>
      </div>
    );
  }

  if (error || !currentCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <p className="text-red-600 font-medium mb-4">{error || 'Campaign not found'}</p>
          <Button onClick={() => navigate('/campaigns')} variant="outline">
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => navigate('/campaigns')}
          variant="outline"
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Button>

        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  {currentCampaign.title}
                </h1>
                {currentCampaign.brand?.name && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Building2 className="w-4 h-4" />
                    <span>{currentCampaign.brand.name}</span>
                  </div>
                )}
              </div>
              <Badge className={`${getStatusColor(currentCampaign.status)} text-sm px-4 py-1`}>
                {currentCampaign.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Prize Pool</p>
                  <p className="text-xl font-bold text-neutral-900">
                    {formatCurrency(currentCampaign.budget || currentCampaign.prizePool)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Deadline</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {formatDate(currentCampaign.deadline)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Created</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {formatDate(currentCampaign.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Campaign Brief</h2>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                  {currentCampaign.description}
                </p>
              </div>
            </div>

            {user?.role === 'CREATOR' && currentCampaign.status === 'ACTIVE' && (
              <div className="flex gap-4">
                <Button 
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white h-12"
                  onClick={() => navigate(`/campaigns/${currentCampaign.id}/submit`)}
                >
                  Submit Your Work
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => {
                    toast({
                      title: 'Campaign Saved',
                      description: 'You can find this in your saved campaigns',
                    });
                  }}
                >
                  Save for Later
                </Button>
              </div>
            )}

            {user?.role === 'BRAND' && currentCampaign.brand?.id === user?.id && (
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={() => navigate(`/campaigns/${currentCampaign.id}/edit`)}
                >
                  Edit Campaign
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={() => navigate(`/campaigns/${currentCampaign.id}/submissions`)}
                >
                  View Submissions
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
