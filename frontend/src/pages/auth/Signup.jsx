import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup, clearError } from '@/store/authSlice';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Building2, Sparkles, Check } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'INFLUENCER',
  });
  const [showLoading, setShowLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Signup Failed',
        description: error,
        variant: 'destructive',
      });
      dispatch(clearError());
      setShowLoading(false);
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

    setShowLoading(true);

    try {
      await dispatch(signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })).unwrap();

      toast({
        title: 'Welcome to DRK/MTTR!',
        description: 'Account created successfully',
      });

      navigate('/onboarding');
    } catch (err) {
      setShowLoading(false);
    }
  };

  if (showLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/95 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Creating your account...</h2>
          <p className="text-sm text-neutral-400">This will only take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Link to="/" className="inline-block">
              <div className="text-3xl font-bold tracking-tight mb-2">
                DRK<span className="text-neutral-400">/</span>MTTR
              </div>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-6"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                10,000+ Active Users
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl font-bold mb-6 leading-tight"
              >
                Join the future of creator partnerships
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-neutral-300 leading-relaxed"
              >
                Connect with authentic brands, launch campaigns in minutes, and grow your influence with our all-in-one platform.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              {[
                { icon: Check, text: 'Verified brands and creators only' },
                { icon: Check, text: 'Instant payouts within 24 hours' },
                { icon: Check, text: 'AI-powered campaign matching' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-neutral-200">{item.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="pt-8 border-t border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 border-2 border-neutral-800" />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Join 10,000+ users</div>
                  <div className="text-neutral-400">Growing every day</div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-sm text-neutral-400">
            © 2026 DRK/MTTR. All rights reserved.
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-block mb-6">
              <div className="text-3xl font-bold text-neutral-900 tracking-tight">
                DRK<span className="text-neutral-400">/</span>MTTR
              </div>
            </Link>
          </div>

          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8 group lg:absolute lg:top-8 lg:right-8"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
            
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create your account</h1>
            <p className="text-neutral-600">Get started with your free account</p>
          </div>
              
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-3">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'INFLUENCER' })}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.role === 'INFLUENCER'
                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-md'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-semibold">Creator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'BRAND' })}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.role === 'BRAND'
                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-md'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="text-sm font-semibold">Brand</span>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full border border-neutral-300 rounded-lg px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-neutral-300 rounded-lg px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••"
                required
                className="w-full border border-neutral-300 rounded-lg px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Confirm Password *</label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••••"
                  required
                  className={`w-full border rounded-lg px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                      : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900'
                  }`}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 rounded border-neutral-300" />
              <label htmlFor="terms" className="text-sm text-neutral-600">
                I agree to the <Link to="/terms" className="text-neutral-900 font-medium hover:underline">Terms</Link> and <Link to="/privacy" className="text-neutral-900 font-medium hover:underline">Privacy Policy</Link>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'SIGN UP FOR FREE'
              )}
            </button>
          </form>
              
          <p className="mt-6 text-center text-neutral-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold text-neutral-900 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
