import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TikTokEmbed, InstagramEmbed, YouTubeEmbed } from 'react-social-media-embed';
import { Check, X, Loader2, ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function CampaignSubmissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('Fetching submissions for campaign:', id);
      const res = await api.get(`/campaigns/${id}/submissions`);
      console.log('Submissions response:', res.data);
      setSubmissions(res.data);
    } catch (error) {
      console.error('Fetch submissions error:', error);
      console.error('Error response:', error.response);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to load submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaign = async () => {
    try {
      const res = await api.get(`/campaigns/${id}`);
      setCampaign(res.data.campaign || res.data);
    } catch (error) {
      console.error('Failed to load campaign:', error);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchCampaign();
  }, [id]);

  const handleStatus = async (subId, status) => {
    try {
      await api.patch(`/submissions/${subId}/status`, { status });
      toast({
        title: "Success",
        description: `Submission ${status.toLowerCase()}`,
        className: "bg-green-600 text-white border-none"
      });
      fetchSubmissions();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const renderEmbed = (url) => {
    try {
      if (url.includes('tiktok')) {
        return <TikTokEmbed url={url} width="100%" />;
      }
      if (url.includes('instagram')) {
        return <InstagramEmbed url={url} width="100%" />;
      }
      if (url.includes('youtube') || url.includes('youtu.be')) {
        return <YouTubeEmbed url={url} width="100%" />;
      }
      return (
        <div className="p-4 text-center">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            View Link
          </a>
        </div>
      );
    } catch (error) {
      return (
        <div className="p-4 text-center">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            View Link
          </a>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/my-campaigns')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Campaigns
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Review Submissions</h1>
            {campaign && (
              <p className="text-muted-foreground mt-1">
                {campaign.campaign?.title || campaign.title || 'Campaign'}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {submissions.length} Submission{submissions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {submissions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No submissions yet</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => (
            <Card key={sub.id} className="overflow-hidden">
              <CardHeader className="bg-neutral-50 dark:bg-neutral-900 border-b p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{sub.creator.name}</span>
                    <p className="text-xs text-muted-foreground">{sub.creator.email}</p>
                  </div>
                  <Badge 
                    variant={
                      sub.status === 'APPROVED' ? 'default' : 
                      sub.status === 'REJECTED' ? 'destructive' : 
                      'outline'
                    }
                  >
                    {sub.status}
                  </Badge>
                </div>
                {sub.message && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    "{sub.message}"
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-0">
                {/* THE VISUAL VERIFICATION LAYER */}
                <div className="flex justify-center bg-black min-h-[300px] items-center">
                  {renderEmbed(sub.contentUrl)}
                </div>
                {sub.status === 'PENDING' && (
                  <div className="flex p-4 gap-2">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700" 
                      onClick={() => handleStatus(sub.id, 'APPROVED')}
                    >
                      <Check className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950" 
                      onClick={() => handleStatus(sub.id, 'REJECTED')}
                    >
                      <X className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
