import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  ThumbsUp, 
  MessageSquare,
  TrendingUp,
  Shield,
  RefreshCw
} from 'lucide-react';

const FraudRiskBadge = ({ riskLevel, fraudScore }) => {
  const colors = {
    LOW: 'bg-green-100 text-green-800 border-green-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300'
  };

  const icons = {
    LOW: <CheckCircle2 className="w-4 h-4" />,
    MEDIUM: <AlertTriangle className="w-4 h-4" />,
    HIGH: <AlertTriangle className="w-4 h-4" />,
    CRITICAL: <XCircle className="w-4 h-4" />
  };

  return (
    <Badge className={`${colors[riskLevel] || colors.LOW} border px-3 py-1 flex items-center gap-2`}>
      {icons[riskLevel]}
      <span>{riskLevel} Risk ({fraudScore}% fraud score)</span>
    </Badge>
  );
};

const MetricCard = ({ icon: Icon, label, value, subtext }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
    <div className="p-2 bg-white rounded-lg">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value?.toLocaleString() || '0'}</p>
      {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
  </div>
);

const VerificationResultCard = ({ submissionId }) => {
  const [verification, setVerification] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVerificationHistory();
  }, [submissionId]);

  const fetchVerificationHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/submissions/admin/${submissionId}/verification-history`);
      setHistory(response.data.snapshots || []);

      if (response.data.snapshots?.length > 0) {
        setVerification(response.data.snapshots[0]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleReverify = async () => {
    try {
      setReverifying(true);
      const response = await axios.post(`/api/submissions/admin/${submissionId}/verify`);

      if (response.data.verified) {
        setVerification({
          views: response.data.metrics.views,
          likes: response.data.metrics.likes,
          comments: response.data.metrics.comments,
          engagement: response.data.metrics.engagement,
          fraudScore: response.data.fraudScore,
          riskLevel: response.data.riskLevel,
          fraudChecks: response.data.checks,
          capturedAt: new Date().toISOString()
        });

        await fetchVerificationHistory();
      }
    } catch (err) {
      setError('Failed to reverify metrics');
    } finally {
      setReverifying(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading verification data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!verification) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">No verification data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              YouTube Metrics Verification
            </CardTitle>
            <CardDescription>
              Last verified: {new Date(verification.capturedAt).toLocaleString()}
            </CardDescription>
          </div>
          <Button 
            onClick={handleReverify} 
            disabled={reverifying}
            size="sm"
            variant="outline"
          >
            {reverifying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Re-verify
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <p className="text-sm font-medium text-blue-900">Fraud Detection Result</p>
            <p className="text-xs text-blue-700 mt-1">
              {verification.fraudChecks?.length || 4} algorithms analyzed
            </p>
          </div>
          <FraudRiskBadge 
            riskLevel={verification.riskLevel || 'LOW'} 
            fraudScore={verification.fraudScore?.toFixed(1) || 0} 
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Verified Metrics (from YouTube API)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={Eye}
              label="Views"
              value={verification.views}
              subtext="Verified count"
            />
            <MetricCard
              icon={ThumbsUp}
              label="Likes"
              value={verification.likes}
              subtext="Engagement"
            />
            <MetricCard
              icon={MessageSquare}
              label="Comments"
              value={verification.comments}
              subtext="Interactions"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Engagement Rate</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {verification.engagement?.toFixed(2) || 0}%
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Industry benchmark for YouTube: 2-5%
          </p>
        </div>

        {verification.fraudChecks && verification.fraudChecks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Fraud Detection Checks</h3>
            <div className="space-y-2">
              {verification.fraudChecks.map((check, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    check.fraudulent 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {check.fraudulent ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-medium text-sm">{check.name}</span>
                    </div>
                    <Badge variant={check.fraudulent ? 'destructive' : 'success'}>
                      {check.severity}
                    </Badge>
                  </div>
                  {check.details && (
                    <p className="text-xs text-gray-600 mt-2 ml-6">
                      {check.details.explanation || 
                       check.details.engagementRate || 
                       JSON.stringify(check.details)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length > 1 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Verification History</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((snapshot, index) => (
                <div key={snapshot.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <span className="text-gray-600">
                    {new Date(snapshot.capturedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-4">
                    <span>{snapshot.views.toLocaleString()} views</span>
                    <span>{snapshot.likes.toLocaleString()} likes</span>
                    <Badge variant="outline" className="text-xs">
                      {snapshot.riskLevel}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationResultCard;
