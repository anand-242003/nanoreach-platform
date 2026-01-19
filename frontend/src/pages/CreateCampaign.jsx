import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Rocket, 
  DollarSign, 
  Calendar, 
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createCampaign } from '@/store/slices/campaignSlice';

const campaignSchema = z.object({
  title: z.string()
    .min(3, 'Give your campaign a name with at least 3 characters')
    .max(100, 'Keep it under 100 characters so it\'s easy to remember'),
  description: z.string()
    .min(50, 'Help creators understand what you need—add at least 50 characters')
    .max(2000, 'Try to keep it under 2000 characters'),
  budget: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Enter a prize pool amount greater than $0'
    }),
  deadline: z.string()
    .refine((val) => {
      const selectedDate = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate > today;
    }, {
      message: 'Please pick a date in the future to give creators time to work'
    })
});

const CreateCampaign = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { loading } = useSelector((state) => state.campaigns);
  const [daysUntilDeadline, setDaysUntilDeadline] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(campaignSchema),
    mode: 'onBlur'
  });

  const deadlineValue = watch('deadline');

  useEffect(() => {
    if (deadlineValue) {
      const selected = new Date(deadlineValue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = selected - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysUntilDeadline(diffDays > 0 ? diffDays : null);
    } else {
      setDaysUntilDeadline(null);
    }
  }, [deadlineValue]);

  const onSubmit = async (data) => {
    try {
      const campaignData = {
        title: data.title,
        description: data.description,
        prizePool: parseFloat(data.budget),
        deadline: new Date(data.deadline).toISOString()
      };

      const result = await dispatch(createCampaign(campaignData)).unwrap();
      
      toast({
        title: '🎉 Campaign launched!',
        description: 'Creators can now discover and join your campaign.',
      });

      navigate('/campaigns');
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: error || 'Please try again in a moment.',
        variant: 'destructive'
      });
    }
  };

  const suggestions = [
    'Mention required hashtags',
    'Specify video length',
    'Mood board link'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
            Let's set up your next campaign
          </h1>
          <p className="text-lg text-neutral-600">
            Fill in the details below, and we'll connect you with the right creators.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: The Basics */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-medium text-neutral-900">
                Campaign Title
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Summer Skincare Launch 2026"
                className={`text-lg h-12 focus-visible:ring-neutral-400 ${
                  errors.title ? 'border-red-400 focus-visible:ring-red-400' : ''
                }`}
              />
              {errors.title ? (
                <p className="text-sm text-red-600 mt-2">{errors.title.message}</p>
              ) : (
                <p className="text-sm text-neutral-500 mt-2">
                  Tip: Make it memorable—this is what creators will see first.
                </p>
              )}
            </div>
          </div>

          {/* Section 2: The Brief */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <Label htmlFor="description" className="text-lg font-medium text-neutral-900">
                  The Brief & Requirements
                </Label>
                <Lightbulb className="w-5 h-5 text-amber-500" />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-sm text-neutral-600">Suggestions:</span>
                {suggestions.map((suggestion, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-neutral-100 text-neutral-700 hover:bg-neutral-200 cursor-default"
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>

              <Textarea
                id="description"
                {...register('description')}
                placeholder="Tell creators exactly what you're looking for. Be specific about deliverables, tone, and any must-haves..."
                className={`min-h-[200px] text-base leading-relaxed focus-visible:ring-neutral-400 ${
                  errors.description ? 'border-red-400 focus-visible:ring-red-400' : ''
                }`}
              />
              {errors.description ? (
                <p className="text-sm text-red-600 mt-2">{errors.description.message}</p>
              ) : (
                <p className="text-sm text-neutral-500 mt-2">
                  Tip: Be specific about the deliverables (e.g., "1 TikTok video using our sound"). Creators love clarity.
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Logistics */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-lg font-medium text-neutral-900">
                  Total Prize Pool
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    {...register('budget')}
                    placeholder="5000"
                    className={`text-lg h-12 pl-10 focus-visible:ring-neutral-400 ${
                      errors.budget ? 'border-red-400 focus-visible:ring-red-400' : ''
                    }`}
                  />
                </div>
                {errors.budget ? (
                  <p className="text-sm text-red-600 mt-2">{errors.budget.message}</p>
                ) : (
                  <p className="text-sm text-neutral-500 mt-2">
                    Tip: Higher budgets attract more creators.
                  </p>
                )}
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-lg font-medium text-neutral-900">
                  Submission Deadline
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
                  <Input
                    id="deadline"
                    type="date"
                    {...register('deadline')}
                    className={`text-lg h-12 pl-10 focus-visible:ring-neutral-400 ${
                      errors.deadline ? 'border-red-400 focus-visible:ring-red-400' : ''
                    }`}
                  />
                </div>
                {errors.deadline ? (
                  <p className="text-sm text-red-600 mt-2">{errors.deadline.message}</p>
                ) : daysUntilDeadline ? (
                  <div className="mt-2">
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      That gives creators {daysUntilDeadline} {daysUntilDeadline === 1 ? 'day' : 'days'} to submit
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 mt-2">
                    Tip: Give creators at least 7-14 days for quality work.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Launching...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Publish Campaign
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Footer Note */}
        <p className="text-center text-sm text-neutral-500 mt-8">
          You can edit or pause your campaign anytime from the dashboard.
        </p>
      </div>
    </div>
  );
};

export default CreateCampaign;
