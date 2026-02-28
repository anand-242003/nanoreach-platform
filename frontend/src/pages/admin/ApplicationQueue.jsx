import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  getPendingApplications, 
  adminApproveApplication, 
  adminRejectApplication 
} from '@/api/applications';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Youtube, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  FileText
} from 'lucide-react';

export default function ApplicationQueue() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, application: null });
  const [rejectReason, setRejectReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications(1);
  }, []);

  const fetchApplications = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getPendingApplications(page);
      setApplications(data.applications || []);
      setPagination(data.pagination || { total: 0, pages: 1, currentPage: page });
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

  const handleApprove = async (application) => {
    setActionLoading(application.id);
    try {
      await adminApproveApplication(application.id);
      toast({
        title: 'Application Approved',
        description: `${application.influencer?.name || 'Influencer'} has been approved for the campaign.`,
      });
      fetchApplications(pagination.currentPage);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve application',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(rejectModal.application?.id);
    try {
      await adminRejectApplication(rejectModal.application.id, rejectReason);
      toast({
        title: 'Application Rejected',
        description: 'The application has been rejected.',
      });
      setRejectModal({ open: false, application: null });
      setRejectReason('');
      fetchApplications(pagination.currentPage);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject application',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-40 bg-muted rounded"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Application Queue</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve/reject influencer applications ({pagination.total} pending)
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Applications</h3>
            <p className="text-muted-foreground">
              All applications have been reviewed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {app.influencerProfile?.displayName || app.influencer?.name || 'Influencer'}
                      </CardTitle>
                      <CardDescription>
                        Applied to: {app.campaign?.title || 'Campaign'}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      Score: {app.influencerProfile?.score || 0}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Pitch:</p>
                        <p className="text-sm text-muted-foreground">
                          {app.pitch}
                        </p>
                      </div>
                      
                      {app.proposedContent && (
                        <div>
                          <p className="text-sm font-medium mb-1">Proposed Content:</p>
                          <p className="text-sm text-muted-foreground">
                            {app.proposedContent}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-medium">Subscribers</p>
                          <p className="text-muted-foreground">
                            {app.influencerProfile?.subscriberCount?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Campaign Budget</p>
                          <p className="text-muted-foreground">
                            ₹{app.campaign?.budget?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                      
                      {app.influencerProfile?.youtubeChannelUrl && (
                        <a
                          href={app.influencerProfile.youtubeChannelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-red-500 hover:underline"
                        >
                          <Youtube className="h-4 w-4 mr-1" />
                          View Channel
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                      
                      {app.influencerProfile?.categoryTags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {app.influencerProfile.categoryTags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setRejectModal({ open: true, application: app })}
                      disabled={actionLoading === app.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(app)}
                      disabled={actionLoading === app.id}
                    >
                      {actionLoading === app.id ? (
                        'Processing...'
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchApplications(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchApplications(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.pages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {}
      <Dialog 
        open={rejectModal.open} 
        onOpenChange={(open) => !open && setRejectModal({ open: false, application: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this application. The influencer will see this feedback.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectModal({ open: false, application: null });
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
