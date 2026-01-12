import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser, clearError } from '@/store/slices/authSlice';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Lock, Loader2, Building2, Sparkles } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CREATOR',
  });
  
  const dispatch = useDispatch();
  const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: 'Signup Failed',
        description: error,
        variant: 'destructive',
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    const result = await dispatch(signupUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    }));

    if (signupUser.fulfilled.match(result)) {
      toast({
        title: 'Welcome to NanoReach!',
        description: 'Account created successfully',
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        
        {/* Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-semibold text-neutral-900 mb-2 block">
              NanoReach
            </Link>
            <p className="text-neutral-500">Create your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'CREATOR' })}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  formData.role === 'CREATOR'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Creator</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'BRAND' })}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  formData.role === 'BRAND'
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-sm font-medium">Brand</span>
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full border border-neutral-200 rounded-lg pl-12 pr-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-neutral-200 rounded-lg pl-12 pr-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full border border-neutral-200 rounded-lg pl-12 pr-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full border border-neutral-200 rounded-lg pl-12 pr-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-900 rounded-lg text-white font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          <p className="text-center text-neutral-500 mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-neutral-900 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
