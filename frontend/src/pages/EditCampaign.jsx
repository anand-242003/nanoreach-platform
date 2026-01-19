import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { fetchCampaignById, updateCampaign } from '@/store/slices/campaignSlice';

const campaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  prizePool: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Prize pool must be greater than 0'
  }),
  deadline: z.string().refine((val) => new Date(val) > new Date(), {
    message: 'Deadline must be in the future'
  })
});

const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { currentCampaign, loading } = useSelector((state) => state.campaigns);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(campaignSchema),
    mode: 'onBlur'
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchCampaignById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentCampaign) {
      reset({
        title: currentCampaign.title,
        description: currentCampaign.description,
        prizePool: currentCampaign.prizePool.toString(),
        deadline: new Date(currentCampaign.deadline).toISOString().split('T')[0]
      });
    }
  }, [currentCampaign, reset]);

  const onSubmit = async (data) => {
    try {
      const updates = {
        title: data.title,
        description: data.description,
        prizePool: parseFloat(data.prizePool),
        deadline: new Date(data.deadline).toISOString()
      };

      await dispatch(updateCampaign({ id, updates })).unwrap();
      
      toast({
        title: 'Campaign Updated',
        description: 'Your changes have been saved successfully',
      });

      navigate(`/campaigns/${id}`);
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error || 'Please try again',
        variant: 'destructive'
      });
    }
  };

  if (loading || !currentCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          onClick={() => navigate(`/campaigns/${id}`)}
          variant="outline"
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaign
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Edit Campaign</h1>
          <p className="text-neutral-600 mt-2">Update your campaign details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <Label htmlFor="title" className="text-lg font-medium text-neutral-900 mb-3 block">
              Campaign Title
            </Label>
            <Input
              id="title"
              {...register('title')}
              className="text-lg h-12"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-2">{errors.title.message}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <Label htmlFor="description" className="text-lg font-medium text-neutral-900 mb-3 block">
              Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              className="min-h-[200px] text-base"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-2">{errors.description.message}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="prizePool" className="text-lg font-medium text-neutral-900 mb-3 block">
                  Prize Pool ($)
                </Label>
                <Input
                  id="prizePool"
                  type="number"
                  {...register('prizePool')}
                  className="text-lg h-12"
                />
                {errors.prizePool && (
                  <p className="text-sm text-red-600 mt-2">{errors.prizePool.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="deadline" className="text-lg font-medium text-neutral-900 mb-3 block">
                  Deadline
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  {...register('deadline')}
                  className="text-lg h-12"
                />
                {errors.deadline && (
                  <p className="text-sm text-red-600 mt-2">{errors.deadline.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/campaigns/${id}`)}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 bg-neutral-900 hover:bg-neutral-800"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCampaign;
