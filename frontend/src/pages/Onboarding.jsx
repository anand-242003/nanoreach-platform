import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Youtube, Tag, Briefcase, FileText, CheckCircle, 
  ArrowRight, ArrowLeft, Loader2, AlertCircle, Upload, X, Plus, Building2
} from 'lucide-react';
import axios from 'axios';
import { getMe } from '@/store/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const categories = ['Tech', 'Gaming', 'Education', 'Lifestyle', 'Business', 'Entertainment', 'Health', 'Travel', 'Food', 'Fashion'];
const industries = ['E-commerce', 'SaaS', 'FMCG', 'Education', 'Healthcare', 'Finance', 'Retail', 'Media'];

export default function Onboarding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, verificationStatus } = useSelector((state) => state.auth);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isInfluencer = user?.role === 'INFLUENCER';
  const isBrand = user?.role === 'BRAND';

  const [influencerData, setInfluencerData] = useState({
    displayName: '',
    bio: '',
    youtubeChannelUrl: '',
    youtubeChannelId: '',
    subscriberCount: '',
    categoryTags: [],
    pastWorkLinks: [''],
    document: null,
  });

  const [brandData, setBrandData] = useState({
    companyName: '',
    website: '',
    industry: '',
    gstNumber: '',
    panNumber: '',
    document: null,
  });

  const influencerSteps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'YouTube Channel', icon: Youtube },
    { id: 3, title: 'Categories', icon: Tag },
    { id: 4, title: 'Past Work', icon: Briefcase },
    { id: 5, title: 'Verification', icon: FileText },
    { id: 6, title: 'Review', icon: CheckCircle },
  ];

  const brandSteps = [
    { id: 1, title: 'Company Info', icon: Building2 },
    { id: 2, title: 'Business Details', icon: FileText },
    { id: 3, title: 'Verification', icon: FileText },
    { id: 4, title: 'Review', icon: CheckCircle },
  ];

  const steps = isInfluencer ? influencerSteps : brandSteps;

  useEffect(() => {
    if (verificationStatus === 'VERIFIED') {
      navigate('/dashboard');
    }
  }, [verificationStatus, navigate]);

  const handleInfluencerChange = (e) => {
    setInfluencerData({ ...influencerData, [e.target.name]: e.target.value });
  };

  const handleCategoryToggle = (category) => {
    setInfluencerData(prev => ({
      ...prev,
      categoryTags: prev.categoryTags.includes(category)
        ? prev.categoryTags.filter(c => c !== category)
        : [...prev.categoryTags, category]
    }));
  };

  const handleWorkLinkChange = (index, value) => {
    const newLinks = [...influencerData.pastWorkLinks];
    newLinks[index] = value;
    setInfluencerData({ ...influencerData, pastWorkLinks: newLinks });
  };

  const addWorkLink = () => {
    setInfluencerData({ ...influencerData, pastWorkLinks: [...influencerData.pastWorkLinks, ''] });
  };

  const removeWorkLink = (index) => {
    setInfluencerData({ 
      ...influencerData, 
      pastWorkLinks: influencerData.pastWorkLinks.filter((_, i) => i !== index) 
    });
  };

  const handleBrandChange = (e) => {
    setBrandData({ ...brandData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (isInfluencer) {
        setInfluencerData({ ...influencerData, document: file });
      } else {
        setBrandData({ ...brandData, document: file });
      }
      setError('');
    }
  };

  const validateStep = () => {
    if (isInfluencer) {
      switch (currentStep) {
        case 1:
          if (!influencerData.displayName || !influencerData.bio) {
            setError('Please fill all required fields');
            return false;
          }
          if (influencerData.bio.length < 20) {
            setError('Bio must be at least 20 characters');
            return false;
          }
          break;
        case 2:
          if (!influencerData.youtubeChannelUrl) {
            setError('YouTube channel URL is required');
            return false;
          }
          if (!influencerData.youtubeChannelUrl.includes('youtube')) {
            setError('Please enter a valid YouTube URL');
            return false;
          }
          break;
        case 3:
          if (influencerData.categoryTags.length === 0) {
            setError('Please select at least one category');
            return false;
          }
          break;
        case 5:
          if (!influencerData.document) {
            setError('Please upload verification document');
            return false;
          }
          break;
      }
    } else {
      switch (currentStep) {
        case 1:
          if (!brandData.companyName || !brandData.website || !brandData.industry) {
            setError('Please fill all required fields');
            return false;
          }
          break;
        case 3:
          if (!brandData.document) {
            setError('Please upload verification document');
            return false;
          }
          break;
      }
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const submitInfluencerProfile = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/influencer/profile`, {
        displayName: influencerData.displayName,
        bio: influencerData.bio,
        youtubeChannelUrl: influencerData.youtubeChannelUrl,
        categoryTags: JSON.stringify(influencerData.categoryTags),
      }, { withCredentials: true });

      await axios.post(`${API_URL}/api/influencer/profile/social`, {
        youtubeChannelUrl: influencerData.youtubeChannelUrl,
        youtubeChannelId: influencerData.youtubeChannelId,
        subscriberCount: influencerData.subscriberCount,
      }, { withCredentials: true });

      const validWorkLinks = influencerData.pastWorkLinks.filter(link => link.trim() !== '');
      if (validWorkLinks.length > 0) {
        await axios.post(`${API_URL}/api/influencer/profile/work`, {
          workLinks: JSON.stringify(validWorkLinks),
        }, { withCredentials: true });
      }

      const docFormData = new FormData();
      docFormData.append('document', influencerData.document);
      await axios.post(`${API_URL}/api/influencer/profile/documents`, docFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      await axios.post(`${API_URL}/api/influencer/submit-verification`, {}, { withCredentials: true });

      dispatch(getMe());
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitBrandProfile = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const docFormData = new FormData();
      docFormData.append('companyName', brandData.companyName);
      docFormData.append('website', brandData.website);
      docFormData.append('industry', brandData.industry);
      if (brandData.gstNumber) docFormData.append('gstNumber', brandData.gstNumber);
      if (brandData.panNumber) docFormData.append('panNumber', brandData.panNumber);
      docFormData.append('document', brandData.document);

      await axios.post(`${API_URL}/api/profile/brand`, docFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      dispatch(getMe());
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitProfile = () => {
    if (isInfluencer) {
      submitInfluencerProfile();
    } else {
      submitBrandProfile();
    }
  };

  const calculateProgress = () => {
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
              <p className="text-muted-foreground mt-1">Step {currentStep} of {steps.length}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Progress</div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress()}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-sm font-semibold">{Math.round(calculateProgress())}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep > step.id 
                      ? 'bg-primary text-white' 
                      : currentStep === step.id
                        ? 'bg-primary text-white'
                        : 'bg-muted'
                  }`}>
                    {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <AnimatePresence mode="wait">
            {isInfluencer && (
              <>
                {currentStep === 1 && (
                  <motion.div key="inf-step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Basic Information</h2>
                      <p className="text-muted-foreground text-sm">Tell us about yourself</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Display Name *</label>
                      <input type="text" name="displayName" value={influencerData.displayName} onChange={handleInfluencerChange}
                        className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your public name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Bio *</label>
                      <textarea name="bio" value={influencerData.bio} onChange={handleInfluencerChange} rows={4}
                        className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Tell brands about yourself..." />
                      <p className="text-muted-foreground text-sm mt-1">{influencerData.bio.length}/500 characters (min 20)</p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div key="inf-step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">YouTube Channel</h2>
                      <p className="text-muted-foreground text-sm">Connect your YouTube presence</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Channel URL *</label>
                      <input type="url" name="youtubeChannelUrl" value={influencerData.youtubeChannelUrl} onChange={handleInfluencerChange}
                        className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Channel ID (Optional)</label>
                      <input type="text" name="youtubeChannelId" value={influencerData.youtubeChannelId} onChange={handleInfluencerChange}
                        className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="UCxxxxxxxxxxxxxxxxxxxxxx" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Subscriber Count (Optional)</label>
                      <input type="number" name="subscriberCount" value={influencerData.subscriberCount} onChange={handleInfluencerChange}
                        className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="1000" />
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div key="inf-step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Content Categories</h2>
                      <p className="text-muted-foreground text-sm">Select categories that match your content</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {categories.map(category => (
                        <button key={category} type="button" onClick={() => handleCategoryToggle(category)}
                          className={`p-4 border rounded-lg transition-all ${
                            influencerData.categoryTags.includes(category)
                              ? 'border-primary bg-primary text-white'
                              : 'border-border hover:border-primary/50'
                          }`}>
                          <span className="text-sm font-medium">{category}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div key="inf-step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Portfolio</h2>
                      <p className="text-muted-foreground text-sm">Share your best work</p>
                    </div>
                    <div className="space-y-3">
                      {influencerData.pastWorkLinks.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <input type="url" value={link} onChange={(e) => handleWorkLinkChange(index, e.target.value)}
                            className="flex-1 border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder={`Portfolio link ${index + 1}`} />
                          {influencerData.pastWorkLinks.length > 1 && (
                            <button type="button" onClick={() => removeWorkLink(index)}
                              className="p-3 border border-border rounded-lg hover:bg-muted">
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addWorkLink}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4" />Add another link
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div key="inf-step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Identity Verification</h2>
                      <p className="text-muted-foreground text-sm">Upload government-issued ID</p>
                    </div>
                    <div>
                      <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" className="hidden" id="document-upload" />
                      <label htmlFor="document-upload"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer ${
                          influencerData.document ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 bg-background'
                        }`}>
                        {influencerData.document ? (
                          <>
                            <CheckCircle className="w-12 h-12 text-primary mb-3" />
                            <p className="text-sm font-medium text-primary">{influencerData.document.name}</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium">Upload document</p>
                          </>
                        )}
                      </label>
                    </div>
                  </motion.div>
                )}

                {currentStep === 6 && (
                  <motion.div key="inf-step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Review & Submit</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Basic Info</h3>
                        <p className="text-sm text-muted-foreground"><strong>Name:</strong> {influencerData.displayName}</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">YouTube</h3>
                        <p className="text-sm text-muted-foreground">{influencerData.youtubeChannelUrl}</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                          {influencerData.categoryTags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-muted text-sm rounded-full">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
            {isBrand && (
              <>
                {currentStep === 1 && (
                  <motion.div key="brand-step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Company Information</h2>
                      <p className="text-muted-foreground text-sm">Tell us about your business</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Company Name *</label>
                      <input type="text" name="companyName" value={brandData.companyName} onChange={handleBrandChange}
                        className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your company name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Website *</label>
                      <input type="url" name="website" value={brandData.website} onChange={handleBrandChange}
                        className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://example.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Industry *</label>
                      <select name="industry" value={brandData.industry} onChange={handleBrandChange}
                        className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Select industry</option>
                        {industries.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div key="brand-step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Business Details</h2>
                      <p className="text-muted-foreground text-sm">Additional information</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">GST Number</label>
                        <input type="text" name="gstNumber" value={brandData.gstNumber} onChange={handleBrandChange}
                          className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Optional" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">PAN Number</label>
                        <input type="text" name="panNumber" value={brandData.panNumber} onChange={handleBrandChange}
                          className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Optional" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div key="brand-step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Business Verification</h2>
                      <p className="text-muted-foreground text-sm">Upload registration document</p>
                    </div>
                    <div>
                      <input type="file" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" className="hidden" id="document-upload" />
                      <label htmlFor="document-upload"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer ${
                          brandData.document ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 bg-background'
                        }`}>
                        {brandData.document ? (
                          <>
                            <CheckCircle className="w-12 h-12 text-primary mb-3" />
                            <p className="text-sm font-medium text-primary">{brandData.document.name}</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium">Upload document</p>
                          </>
                        )}
                      </label>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div key="brand-step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold mb-2">Review & Submit</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-2">Company Info</h3>
                        <p className="text-sm text-muted-foreground"><strong>Name:</strong> {brandData.companyName}</p>
                        <p className="text-sm text-muted-foreground mt-1"><strong>Website:</strong> {brandData.website}</p>
                        <p className="text-sm text-muted-foreground mt-1"><strong>Industry:</strong> {brandData.industry}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 ? (
              <button type="button" onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted">
                <ArrowLeft className="w-4 h-4" />Back
              </button>
            ) : <div />}

            {currentStep < steps.length ? (
              <button type="button" onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                Continue<ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={submitProfile} disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                ) : (
                  <>Submit for Review<CheckCircle className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
