import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Copy } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const categories = ['Tech', 'Gaming', 'Education', 'Lifestyle', 'Business', 'Entertainment', 'Health', 'Travel', 'Food', 'Fashion'];

export default function CreateCampaign() {
  const navigate = useNavigate();
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
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: campaignData } = await axios.post(`${API_URL}/campaigns`, formData, { withCredentials: true });
      setCampaign(campaignData.campaign);

      const { data: escrowData } = await axios.post(
        `${API_URL}/escrow/campaigns/${campaignData.campaign.id}/create`,
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
        `${API_URL}/escrow/campaigns/${campaign.id}/confirm-payment`,
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

  if (step === 2) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Fund Your Campaign</h1>
          <p className="text-neutral-500 text-sm mt-1">Pay 25% security deposit to activate</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Campaign Created</p>
              <p className="text-sm text-green-700">{campaign?.title}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">Payment Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">₹{paymentInfo?.securityDeposit?.toLocaleString()}</p>
              <p className="text-sm text-blue-600">Security Deposit (25%)</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-neutral-700">₹{paymentInfo?.totalPrizePool?.toLocaleString()}</p>
              <p className="text-sm text-neutral-600">Total Prize Pool</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-neutral-50 rounded">
              <span className="text-sm text-neutral-600">Bank</span>
              <span className="font-medium">{paymentInfo?.bankName}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-neutral-50 rounded">
              <span className="text-sm text-neutral-600">Account</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{paymentInfo?.accountNumber}</span>
                <button onClick={() => copyToClipboard(paymentInfo?.accountNumber, 'account')} className="p-1 hover:bg-neutral-200 rounded">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-neutral-50 rounded">
              <span className="text-sm text-neutral-600">IFSC</span>
              <span className="font-mono">{paymentInfo?.ifsc}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded">
              <span className="text-sm text-blue-700">Reference</span>
              <div className="flex items-center gap-2">
                <span className="font-bold font-mono text-blue-700">{paymentInfo?.reference}</span>
                <button onClick={() => copyToClipboard(paymentInfo?.reference, 'ref')} className="p-1 hover:bg-blue-100 rounded">
                  <Copy className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          </div>
          {copied && <p className="text-sm text-green-600 mt-2">Copied!</p>}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important</p>
              <p>Include the reference in payment remarks. Security deposit is refunded after prizes are distributed.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="flex gap-4">
          <button
            onClick={handlePayLater}
            className="flex-1 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50"
          >
            Pay Later
          </button>
          <button onClick={handleConfirmPayment} disabled={loading}
            className="flex-1 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            I've Made Payment
          </button>
        </div>

        <p className="text-xs text-center text-neutral-500 mt-4">
          Campaign will remain in DRAFT status until payment is verified
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-600 mb-6 text-sm hover:text-neutral-900">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Create Campaign</h1>
        <p className="text-neutral-500 text-sm mt-1">Fill in the details to create a new campaign</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Campaign title" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Describe your campaign..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Total Prize Pool (₹) *</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} required min="1000"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="100000" />
              {formData.budget && (
                <p className="text-xs text-blue-600 mt-1">
                  Security deposit: ₹{Math.round(formData.budget * 0.25).toLocaleString()} (25%)
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date *</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required
                min={new Date().toISOString().split('T')[0]}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button key={category} type="button" onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1 rounded-lg text-sm border ${
                  formData.categoryTags.includes(category)
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400'
                }`}>
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">Requirements</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Content Requirements</label>
            <textarea name="contentRequirements" value={formData.contentRequirements} onChange={handleChange} rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="What kind of content do you expect?" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rules</label>
            <textarea name="rules" value={formData.rules} onChange={handleChange} rows={3}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Campaign rules..." />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border rounded-lg hover:bg-neutral-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
