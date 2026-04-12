import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Copy, Clock } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
const categories = ['Tech', 'Gaming', 'Education', 'Lifestyle', 'Business', 'Entertainment', 'Health', 'Travel', 'Food', 'Fashion'];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { verificationStatus } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [copied, setCopied] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    endDate: '',
    categoryTags: [],
    contentRequirements: '',
    rules: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      categoryTags: prev.categoryTags.includes(category)
        ? prev.categoryTags.filter(c => c !== category)
        : [...prev.categoryTags, category]
    }));
  };

  const handleSubmit = async (e) => {
    if (verificationStatus !== 'VERIFIED') return;
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: campaignData } = await axios.post(`${API_URL}/api/campaigns`, formData, { withCredentials: true });
      setCampaign(campaignData.campaign);

      const { data: escrowData } = await axios.post(
        `${API_URL}/api/escrow/campaigns/${campaignData.campaign.id}/create`,
        {},
        { withCredentials: true }
      );
      setPaymentInfo(escrowData.paymentInstructions);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `${API_URL}/api/escrow/campaigns/${campaign.id}/confirm-payment`,
        { paymentReference: paymentInfo.reference },
        { withCredentials: true }
      );
      navigate('/campaigns/my');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePayLater = async () => {
    navigate('/campaigns/my');
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  if (verificationStatus === 'UNDER_REVIEW') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-muted rounded-xl p-10 text-center border border-border">
          <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Profile Under Review</h2>
          <p className="text-muted-foreground">Your brand profile is being reviewed. You'll be able to create campaigns once approved.</p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Fund Your Campaign</h1>
          <p className="text-muted-foreground text-sm mt-1">Pay 25% security deposit to activate</p>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Campaign Created</p>
              <p className="text-sm text-muted-foreground">{campaign?.title}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">Payment Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <p className="text-2xl font-bold text-primary">₹{paymentInfo?.securityDeposit?.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Security Deposit (25%)</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold">₹{paymentInfo?.totalPrizePool?.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Prize Pool</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span className="text-sm text-muted-foreground">Bank</span>
              <span className="font-medium">{paymentInfo?.bankName}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span className="text-sm text-muted-foreground">Account</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{paymentInfo?.accountNumber}</span>
                <button onClick={() => copyToClipboard(paymentInfo?.accountNumber, 'account')} className="p-1 hover:bg-border rounded">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded">
              <span className="text-sm text-muted-foreground">IFSC</span>
              <span className="font-mono">{paymentInfo?.ifsc}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-primary/10 border border-primary/20 rounded">
              <span className="text-sm text-primary">Reference</span>
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-primary">{paymentInfo?.reference}</span>
                <button onClick={() => copyToClipboard(paymentInfo?.reference, 'ref')} className="p-1 hover:bg-primary/20 rounded">
                  <Copy className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>
          </div>
          {copied && <p className="text-sm text-primary mt-2">Copied!</p>}
        </div>

        <div className="bg-muted border border-border rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-medium">Important</p>
              <p className="text-muted-foreground">Include the reference in payment remarks. Security deposit is refunded after prizes are distributed.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handlePayLater}
            className="flex-1 py-3 border border-border text-foreground rounded-lg hover:bg-muted"
          >
            Pay Later
          </button>
          <button onClick={handleConfirmPayment} disabled={loading}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            I've Made Payment
          </button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Campaign will remain in DRAFT status until payment is verified
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6 text-sm hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create Campaign</h1>
        <p className="text-muted-foreground text-sm mt-1">Fill in the details to create a new campaign</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Title * <span className="text-muted-foreground font-normal">(min 10 characters)</span></label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required minLength={10}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Campaign title" />
            {formData.title.length > 0 && formData.title.length < 10 && (
              <p className="text-xs text-destructive mt-1">{10 - formData.title.length} more characters needed</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description * <span className="text-muted-foreground font-normal">(min 50 characters)</span></label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Describe your campaign in detail..." />
            {formData.description.length > 0 && formData.description.length < 50 && (
              <p className="text-xs text-destructive mt-1">{50 - formData.description.length} more characters needed</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Prize Pool (₹) * <span className="text-muted-foreground font-normal">(min ₹1,000)</span></label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} required min="1000"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="100000" />
              {formData.budget && (
                <p className="text-xs text-muted-foreground mt-1">
                  Security deposit: ₹{Math.round(formData.budget * 0.25).toLocaleString()} (25%)
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required
                min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
              <p className="text-xs text-muted-foreground mt-1">Campaign auto-starts tomorrow</p>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button key={category} type="button" onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                  formData.categoryTags.includes(category)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                }`}>
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">Requirements</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Content Requirements</label>
            <textarea name="contentRequirements" value={formData.contentRequirements} onChange={handleChange} rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="What kind of content do you expect?" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rules</label>
            <textarea name="rules" value={formData.rules} onChange={handleChange} rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Campaign rules..." />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-border rounded-lg hover:bg-muted">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
