import { useState, useEffect } from 'react';
import { Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PLATFORMS = [
  { value: 'YOUTUBE', label: 'YouTube', icon: '▶️' },
  { value: 'INSTAGRAM', label: 'Instagram', icon: '' },
  { value: 'TIKTOK', label: 'TikTok', icon: '' },
  { value: 'TWITTER', label: 'Twitter/X', icon: '' },
  { value: 'FACEBOOK', label: 'Facebook', icon: '' },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: '' },
];

const CONTENT_TYPES = {
  YOUTUBE: [
    { value: 'VIDEO', label: 'Video' },
    { value: 'SHORT', label: 'YouTube Short' }
  ],
  INSTAGRAM: [
    { value: 'POST', label: 'Post' },
    { value: 'REEL', label: 'Reel' },
    { value: 'STORY', label: 'Story' },
    { value: 'CAROUSEL', label: 'Carousel' }
  ],
  TIKTOK: [
    { value: 'VIDEO', label: 'Video' }
  ],
  TWITTER: [
    { value: 'POST', label: 'Tweet' }
  ],
  FACEBOOK: [
    { value: 'POST', label: 'Post' },
    { value: 'VIDEO', label: 'Video' }
  ],
  LINKEDIN: [
    { value: 'POST', label: 'Post' },
    { value: 'ARTICLE', label: 'Article' }
  ]
};

export default function SubmitWorkModal({ campaignId, trigger, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contentUrl, setContentUrl] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('YOUTUBE');
  const [contentType, setContentType] = useState('VIDEO');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [referralLink, setReferralLink] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchReferralLink();
    }
  }, [open, campaignId]);

  useEffect(() => {
    
    const availableTypes = CONTENT_TYPES[socialPlatform];
    if (availableTypes && !availableTypes.find(t => t.value === contentType)) {
      setContentType(availableTypes[0].value);
    }
  }, [socialPlatform]);

  const fetchReferralLink = async () => {
    try {
      const response = await api.get(`/api/referral/my/${campaignId}`);
      if (response.data.hasLink) {
        setReferralLink(response.data.referralLink);
      }
    } catch (error) {
      console.error('Error fetching referral link:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!contentUrl.trim()) {
      newErrors.contentUrl = 'Content URL is required';
    } else {
      try {
        new URL(contentUrl);
      } catch {
        newErrors.contentUrl = 'Please enter a valid URL';
      }
    }

    if (!socialPlatform) {
      newErrors.socialPlatform = 'Please select a platform';
    }

    if (!contentType) {
      newErrors.contentType = 'Please select a content type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.post('/submissions', { 
        campaignId, 
        contentUrl: contentUrl.trim(),
        socialPlatform,
        contentType,
        message: message.trim() || undefined
      });
      
      toast({ 
        title: "Submitted!", 
        description: "The brand will review your work shortly.", 
        className: "bg-green-600 text-white border-none" 
      });
      
      setOpen(false);
      setContentUrl('');
      setSocialPlatform('YOUTUBE');
      setContentType('VIDEO');
      setMessage('');
      setErrors({});
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to submit", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const availableContentTypes = CONTENT_TYPES[socialPlatform] || [];

  const availableContentTypes = CONTENT_TYPES[socialPlatform] || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Your Work</DialogTitle>
        </DialogHeader>

        {}
        {referralLink && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900">Did you include your referral link?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Make sure to include your referral link in the video description or caption to track your performance!
                </p>
                <div className="mt-2 bg-white border border-blue-300 rounded p-2">
                  <p className="text-xs text-muted-foreground mb-1">Your referral link:</p>
                  <p className="font-mono text-sm break-all text-blue-800">{referralLink.url}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {}
          <div className="space-y-2">
            <Label>Social Platform *</Label>
            <Select value={socialPlatform} onValueChange={setSocialPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(platform => (
                  <SelectItem key={platform.value} value={platform.value}>
                    <span className="flex items-center gap-2">
                      <span>{platform.icon}</span>
                      <span>{platform.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.socialPlatform && (
              <p className="text-xs text-red-500">{errors.socialPlatform}</p>
            )}
          </div>

          {}
          <div className="space-y-2">
            <Label>Content Type *</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableContentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contentType && (
              <p className="text-xs text-red-500">{errors.contentType}</p>
            )}
          </div>

          {}
          <div className="space-y-2">
            <Label>Content Link *</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={`https:
                className="pl-10" 
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
              />
            </div>
            {errors.contentUrl && (
              <p className="text-xs text-red-500">{errors.contentUrl}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Paste the direct link to your published content
            </p>
          </div>

          {}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea 
              placeholder="Add any additional information for the brand..." 
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Share insights about your content performance, audience feedback, etc.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Content"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
