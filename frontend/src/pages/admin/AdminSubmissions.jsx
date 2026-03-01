import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, ArrowRight, Loader2, Trophy } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const STATUS_STYLE = {
  ACTIVE:    'bg-primary/10 text-primary',
  COMPLETED: 'bg-muted text-muted-foreground',
  DRAFT:     'bg-muted text-muted-foreground',
  PAUSED:    'bg-muted text-muted-foreground',
};

export default function AdminSubmissions() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/campaigns`, { withCredentials: true });
      setCampaigns(data.campaigns || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Submission Reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">Select a campaign to review and score its submissions</p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-background flex items-center justify-between">
          <span className="font-semibold text-foreground">All Campaigns</span>
          <span className="text-sm text-muted-foreground">{campaigns.length} total</span>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">No campaigns found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => navigate(`/admin/submissions/${campaign.id}`)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted text-left transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{campaign.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLE[campaign.status] || 'bg-muted text-muted-foreground'}`}>
                      {campaign.status}
                    </span>
                    {campaign.status === 'COMPLETED' && (
                      <Trophy className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Budget: ₹{campaign.budget?.toLocaleString()}</span>
                    <span>Ends: {new Date(campaign.endDate).toLocaleDateString()}</span>
                    {campaign._count?.submissions !== undefined && (
                      <span>{campaign._count.submissions} submission{campaign._count.submissions !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
