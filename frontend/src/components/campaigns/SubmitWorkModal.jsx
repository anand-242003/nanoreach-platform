import { useState } from 'react';
import { Loader2, Link as LinkIcon } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SubmitWorkModal({ campaignId, trigger, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contentUrl, setContentUrl] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

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
        message: message.trim() || undefined
      });
      
      toast({ 
        title: "Submitted!", 
        description: "The brand will review your work shortly.", 
        className: "bg-green-600 text-white border-none" 
      });
      
      setOpen(false);
      setContentUrl('');
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Your Work</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Content Link *</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="https://instagram.com/p/your-post" 
                className="pl-10" 
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
              />
            </div>
            {errors.contentUrl && (
              <p className="text-xs text-red-500">{errors.contentUrl}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Paste the link to your live TikTok, Instagram Reel, or YouTube video.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Message (Optional)</Label>
            <Textarea 
              placeholder="Add a note for the brand..." 
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Share any additional details about your submission.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
