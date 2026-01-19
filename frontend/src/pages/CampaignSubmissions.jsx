import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ExternalLink, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

const CampaignSubmissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/campaigns/${id}/submissions`);
      setSubmissions(data.submissions || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId) => {
    try {
      setActionLoading(submissionId);
      await api.put(`/submissions/${submissionId}/approve`);
      
      toast({
        title: 'Success',
        description: 'Submission approved successfully',
      });
      
      setSubmissions(submissions.map(sub => 
        sub.id === submissionId ? { ...sub, status: 'APPROVED' } : sub
      ));
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve submission',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (submissionId) => {
    try {
      setActionLoading(submissionId);
      await api.put(`/submissions/${submissionId}/reject`);
      
      toast({
        title: 'Success',
        description: 'Submission rejected',
      });
      
      setSubmissions(submissions.map(sub => 
        sub.id === submissionId ? { ...sub, status: 'REJECTED' } : sub
      ));
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject submission',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
      APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      REJECTED: 'bg-red-50 text-red-700 border border-red-200',
    };
    return colors[status] || 'bg-neutral-100 text-neutral-600';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Button
          onClick={() => navigate(`/campaigns/${id}`)}
          variant="outline"
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaign
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Campaign Submissions</h1>
          <p className="text-neutral-600 mt-2">{submissions.length} submissions received</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900">
                      {submission.creator?.name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-neutral-500">{submission.creator?.email}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Submitted {formatDate(submission.createdAt)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                </div>

                <div className="mb-4">
                  <p className="text-neutral-700 leading-relaxed">{submission.description}</p>
                </div>

                {submission.socialLink && (
                  <div className="mb-4">
                    <a
                      href={submission.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Social Media
                    </a>
                  </div>
                )}

                {submission.files && submission.files.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-700 mb-2">Attached Files:</p>
                    <div className="space-y-2">
                      {submission.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-neutral-400" />
                            <div>
                              <p className="text-sm font-medium text-neutral-900">{file.name}</p>
                              <p className="text-xs text-neutral-500">{file.type}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => handleDownload(file.url, file.name)}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-neutral-100">
                  {submission.status === 'PENDING' && (
                    <>
                      <Button 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApprove(submission.id)}
                        disabled={actionLoading === submission.id}
                      >
                        {actionLoading === submission.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          'Approve'
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleReject(submission.id)}
                        disabled={actionLoading === submission.id}
                      >
                        {actionLoading === submission.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Rejecting...
                          </>
                        ) : (
                          'Reject'
                        )}
                      </Button>
                    </>
                  )}
                  {submission.status === 'APPROVED' && (
                    <Button variant="outline" className="flex-1">
                      Contact Creator
                    </Button>
                  )}
                  {submission.status === 'REJECTED' && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleApprove(submission.id)}
                      disabled={actionLoading === submission.id}
                    >
                      Reconsider
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && submissions.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
            <p className="text-neutral-500 text-lg">No submissions yet</p>
            <p className="text-neutral-400 text-sm mt-2">
              Creators will see your campaign and submit their work here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignSubmissions;
