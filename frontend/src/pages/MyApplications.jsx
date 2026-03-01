import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getMyApplications } from '@/api/applications';
import ReferralLinkCard from '@/components/campaigns/ReferralLinkCard';
import { FileText, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, BarChart3 } from 'lucide-react';

const statusConfig = {
  PENDING: { label: 'Pending Review', color: 'bg-muted-foreground', icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-primary', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-destructive', icon: XCircle },
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getMyApplications();
      setApplications(data.applications || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-2">
          Track your campaign applications and referral links
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse campaigns and apply to start earning!
            </p>
            <Button asChild>
              <Link to="/campaigns">Browse Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const status = statusConfig[app.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;
            
            return (
              <Card key={app.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        <Link 
                          to={`/campaigns/${app.campaign?.id}`}
                          className="hover:underline"
                        >
                          {app.campaign?.title || 'Campaign'}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`${status.color} text-white border-0`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Your Pitch:</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {app.pitch}
                      </p>
                    </div>
                    
                    {app.status === 'REJECTED' && app.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                              Rejection Reason:
                            </p>
                            <p className="text-sm text-red-600/80 dark:text-red-400/80">
                              {app.rejectionReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {app.status === 'APPROVED' && app.referralLink && (
                      <div className="mt-4">
                        <ReferralLinkCard
                          referralLink={app.referralLink}
                          campaign={app.campaign}
                          showAnalytics={true}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                          asChild
                        >
                          <Link to={`/referral/${app.campaign?.id}/analytics`}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Detailed Analytics
                          </Link>
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Budget: ₹{app.campaign?.budget?.toLocaleString()}</span>
                        {app.campaign?.endDate && (
                          <span>Ends: {new Date(app.campaign.endDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/campaigns/${app.campaign?.id}`}>
                          View Campaign
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
