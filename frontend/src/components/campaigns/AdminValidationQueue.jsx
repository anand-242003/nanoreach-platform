import { useState, useEffect } from 'react';
import { Eye, Check, X, Flag, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from '@/lib/axios';

const FRAUD_FLAGS = [
  { value: 'FAKE_VIEWS', label: 'Fake Views' },
  { value: 'FAKE_ENGAGEMENT', label: 'Fake Engagement' },
  { value: 'BOT_TRAFFIC', label: 'Bot Traffic' },
  { value: 'DUPLICATE_CONTENT', label: 'Duplicate Content' },
  { value: 'MISLEADING_METRICS', label: 'Misleading Metrics' },
  { value: 'POLICY_VIOLATION', label: 'Policy Violation' },
  { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity' },
  { value: 'OTHER', label: 'Other' },
];

const AdminValidationQueue = ({ campaignFilter }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingSubmissions();
  }, [campaignFilter]);

  const fetchPendingSubmissions = async () => {
    try {
      setLoading(true);
      const params = campaignFilter ? { campaignId: campaignFilter } : {};
      const response = await axios.get('/api/submissions/admin/pending', { params });
      setSubmissions(response.data.submissions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pending submissions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (submissionId, status, notes) => {
    try {
      setActionLoading(true);
      await axios.post(`/api/submissions/admin/${submissionId}/validate`, {
        status,
        notes
      });
      
      toast({
        title: 'Success',
        description: `Submission ${status.toLowerCase()} successfully`,
        className: 'bg-green-600 text-white'
      });

      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      setSelectedSubmission(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to validate submission',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async (submissionId, flags, reason) => {
    try {
      setActionLoading(true);
      await axios.post(`/api/submissions/admin/${submissionId}/flag`, {
        flags,
        reason
      });
      
      toast({
        title: 'Success',
        description: 'Submission flagged and rejected',
        className: 'bg-orange-600 text-white'
      });

      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      setSelectedSubmission(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to flag submission',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation Queue</CardTitle>
          <CardDescription>Loading pending submissions...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validation Queue</CardTitle>
          <CardDescription>No pending submissions</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          All submissions have been reviewed! 
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation Queue ({submissions.length})</CardTitle>
        <CardDescription>Review and validate influencer submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Influencer</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Content Type</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {submission.influencer?.profileImage && (
                      <img 
                        src={submission.influencer.profileImage} 
                        alt="" 
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">
                        {submission.influencer?.displayName || 'Unknown'}
                      </p>
                      {submission.influencer?.subscriberCount && (
                        <p className="text-xs text-muted-foreground">
                          {submission.influencer.subscriberCount.toLocaleString()} subs
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{submission.campaign?.title}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{submission.socialPlatform}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{submission.contentType}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(submission.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <SubmissionReviewDialog
                        submission={submission}
                        onValidate={handleValidate}
                        onFlag={handleFlag}
                        loading={actionLoading}
                      />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const SubmissionReviewDialog = ({ submission, onValidate, onFlag, loading }) => {
  const [action, setAction] = useState('validate'); 
  const [notes, setNotes] = useState('');
  const [metrics, setMetrics] = useState({
    views: '',
    likes: '',
    comments: '',
    shares: '',
  });
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [flagReason, setFlagReason] = useState('');
  const { toast } = useToast();

  const handleSubmitMetrics = async () => {
    try {
      const metricsData = {};
      Object.entries(metrics).forEach(([key, value]) => {
        if (value && value.trim()) {
          metricsData[key] = parseInt(value.replace(/,/g, ''));
        }
      });

      if (Object.keys(metricsData).length > 0) {
        await axios.put(`/api/submissions/admin/${submission.id}/metrics`, {
          metrics: metricsData
        });
        toast({
          title: 'Metrics Saved',
          description: 'Submission metrics updated successfully'
        });
      }
    } catch (error) {
    }
  };

  const handleApprove = async () => {
    await handleSubmitMetrics();
    await onValidate(submission.id, 'APPROVED', notes);
  };

  const handleReject = async () => {
    await onValidate(submission.id, 'REJECTED', notes);
  };

  const handleFlagSubmit = async () => {
    if (selectedFlags.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one fraud flag',
        variant: 'destructive'
      });
      return;
    }
    await onFlag(submission.id, selectedFlags, flagReason);
  };

  const toggleFlag = (flag) => {
    setSelectedFlags(prev => 
      prev.includes(flag) 
        ? prev.filter(f => f !== flag)
        : [...prev, flag]
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Review Submission</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Content Link</Label>
          <div className="flex items-center gap-2">
            <Input value={submission.contentUrl} readOnly className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(submission.contentUrl, '_blank')}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Platform</Label>
            <p className="font-semibold">{submission.socialPlatform}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Content Type</Label>
            <p className="font-semibold">{submission.contentType}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Action</Label>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="validate">Validate (Approve/Reject)</SelectItem>
              <SelectItem value="flag">Flag for Fraud</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {action === 'validate' ? (
          <>
            <div className="space-y-3">
              <Label>Content Metrics (Optional)</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Views</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 10,000"
                    value={metrics.views}
                    onChange={(e) => setMetrics(prev => ({ ...prev, views: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Likes</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 500"
                    value={metrics.likes}
                    onChange={(e) => setMetrics(prev => ({ ...prev, likes: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Comments</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 50"
                    value={metrics.comments}
                    onChange={(e) => setMetrics(prev => ({ ...prev, comments: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Shares</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 25"
                    value={metrics.shares}
                    onChange={(e) => setMetrics(prev => ({ ...prev, shares: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                placeholder="Add notes for the influencer or internal team..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <Label>Fraud Flags *</Label>
              <div className="grid grid-cols-2 gap-2">
                {FRAUD_FLAGS.map((flag) => (
                  <Button
                    key={flag.value}
                    variant={selectedFlags.includes(flag.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFlag(flag.value)}
                    className="justify-start"
                  >
                    {selectedFlags.includes(flag.value) && <Check className="h-3 w-3 mr-1" />}
                    {flag.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reason for Flagging *</Label>
              <Textarea
                placeholder="Explain why this submission is being flagged..."
                rows={4}
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={handleFlagSubmit}
              disabled={loading || selectedFlags.length === 0 || !flagReason.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Flag className="h-4 w-4 mr-2" />
              )}
              Flag as Fraudulent & Reject
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default AdminValidationQueue;
