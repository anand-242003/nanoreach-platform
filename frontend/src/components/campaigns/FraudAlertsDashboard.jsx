import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Shield,
  Eye,
  Clock,
  User
} from 'lucide-react';

const FraudAlertsDashboard = ({ campaignFilter }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [campaignFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/submissions/admin/fraud-alerts?status=PENDING');
      
      let filteredAlerts = response.data.alerts || [];

      if (campaignFilter) {
        filteredAlerts = filteredAlerts.filter(
          alert => alert.submission.campaignId === campaignFilter
        );
      }
      
      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Failed to fetch fraud alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (alertId, action) => {
    try {
      setReviewing(true);
      await axios.post(`/api/submissions/admin/fraud-alerts/${alertId}/review`, {
        action,
        notes: reviewNotes
      });

      setAlerts(alerts.filter(a => a.id !== alertId));
      setSelectedAlert(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Failed to review alert:', error);
      alert('Failed to review fraud alert');
    } finally {
      setReviewing(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      LOW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      MEDIUM: 'bg-orange-100 text-orange-800 border-orange-300',
      HIGH: 'bg-red-100 text-red-800 border-red-300',
      CRITICAL: 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[severity] || colors.LOW;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading fraud alerts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Fraud Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>

      <CardContent>
        {alerts.length === 0 ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              No pending fraud alerts. All submissions passed verification!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{alert.alertType.replace(/_/g, ' ')}</h3>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <Badge className={`${getSeverityColor(alert.severity)} border`}>
                    {alert.severity}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 ml-11">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {alert.influencer?.displayName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {alert.submission?.campaign?.title}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {selectedAlert?.id === alert.id && (
                  <div className="mt-4 pt-4 border-t space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Evidence</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Fraud Score:</strong> {alert.evidence.fraudScore}%</p>
                        <p><strong>Recommendation:</strong> {alert.evidence.recommendation}</p>
                        
                        <div className="mt-3">
                          <strong>Failed Checks:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {alert.evidence.checks
                              ?.filter(c => c.fraudulent)
                              .map((check, idx) => (
                                <li key={idx} className="text-red-600">
                                  {check.name}: {check.details.reason || check.details.explanation}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Review Notes</label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReview(alert.id, 'confirm')}
                        disabled={reviewing}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Confirm Fraud & Reject
                      </Button>
                      <Button
                        onClick={() => handleReview(alert.id, 'dismiss')}
                        disabled={reviewing}
                        variant="outline"
                        className="flex-1"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Dismiss (False Positive)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FraudAlertsDashboard;
