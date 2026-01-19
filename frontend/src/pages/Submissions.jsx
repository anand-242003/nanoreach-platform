import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Upload, FileText, Image as ImageIcon, Video, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/axios';

const Submissions = () => {
  const navigate = useNavigate();
  const { id: campaignId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [submissionText, setSubmissionText] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submissionText && files.length === 0 && !socialLink) {
      toast({
        title: 'Validation Error',
        description: 'Please provide at least a description, file, or social media link',
        variant: 'destructive',
      });
      return;
    }

    if (!campaignId) {
      toast({
        title: 'Error',
        description: 'Campaign ID is missing',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('description', submissionText);
      formData.append('campaignId', campaignId);
      
      if (socialLink) {
        formData.append('socialLink', socialLink);
      }

      files.forEach((file) => {
        formData.append('files', file);
      });

      const { data } = await api.post('/submissions', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      toast({
        title: 'Submission Successful!',
        description: 'Your work has been submitted for review',
      });

      setSubmissionText('');
      setSocialLink('');
      setFiles([]);
      setUploadProgress(0);

      navigate(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.message || 'Failed to submit your work',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">Submit Your Work</h1>
          <p className="text-neutral-600 mt-2">Share your content for this campaign</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <Label htmlFor="description" className="text-lg font-medium text-neutral-900 mb-3 block">
              Tell us about your submission
            </Label>
            <Textarea
              id="description"
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Describe your content, approach, and how it meets the campaign requirements..."
              className="min-h-[150px] text-base"
            />
            <p className="text-sm text-neutral-500 mt-2">
              Tip: Explain your creative process and how your content aligns with the brand
            </p>
          </div>

          {/* Social Media Link */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <Label htmlFor="socialLink" className="text-lg font-medium text-neutral-900 mb-3 block">
              Social Media Link (Optional)
            </Label>
            <Input
              id="socialLink"
              type="url"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              placeholder="https://instagram.com/p/your-post"
              className="text-base h-12"
            />
            <p className="text-sm text-neutral-500 mt-2">
              Link to your published content on Instagram, TikTok, YouTube, etc.
            </p>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <Label className="text-lg font-medium text-neutral-900 mb-3 block">
              Upload Files
            </Label>
            
            <div className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-neutral-400 transition-colors">
              <input
                type="file"
                id="fileUpload"
                multiple
                accept="image/*,video/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="fileUpload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-700 font-medium mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-neutral-500">
                  Images, videos, or PDFs (max 100MB each)
                </p>
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {file.type.startsWith('image/') && (
                        <ImageIcon className="w-5 h-5 text-blue-500" />
                      )}
                      {file.type.startsWith('video/') && (
                        <Video className="w-5 h-5 text-purple-500" />
                      )}
                      {file.type === 'application/pdf' && (
                        <FileText className="w-5 h-5 text-red-500" />
                      )}
                      {!file.type.startsWith('image/') && !file.type.startsWith('video/') && file.type !== 'application/pdf' && (
                        <FileText className="w-5 h-5 text-neutral-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{file.name}</p>
                        <p className="text-xs text-neutral-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
                  <span>Uploading files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1 h-12"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 bg-neutral-900 hover:bg-neutral-800"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Work'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Submissions;
