import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { applyToCampaign } from '@/api/applications';

export default function ApplyToCampaignModal({ campaign, open, onOpenChange, onSuccess }) {
  const [pitch, setPitch] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pitch.trim()) {
      toast({
        title: 'Error',
        description: 'Please write a pitch for your application',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await applyToCampaign(campaign.id, {
        pitch,
        proposedContent,
      });
      
      toast({
        title: 'Application Submitted!',
        description: 'Your application has been submitted for review.',
      });
      
      setPitch('');
      setProposedContent('');
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess(result.application);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply to Campaign</DialogTitle>
          <DialogDescription>
            Apply to "{campaign?.title}" - Tell the brand why you're a great fit!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pitch">Your Pitch *</Label>
            <Textarea
              id="pitch"
              placeholder="Explain why you're a great fit for this campaign. Highlight your relevant experience, audience demographics, and what makes your content unique..."
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              rows={5}
              required
            />
            <p className="text-xs text-muted-foreground">
              Be specific about how you can help the brand achieve their goals
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="proposedContent">Proposed Content Ideas (Optional)</Label>
            <Textarea
              id="proposedContent"
              placeholder="Share your content ideas for this campaign. What type of videos would you create? What's your creative approach?"
              value={proposedContent}
              onChange={(e) => setProposedContent(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Campaign Details:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>Budget: ₹{campaign?.budget?.toLocaleString()}</li>
              <li>Deadline: {campaign?.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'TBD'}</li>
            </ul>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
