import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '@/store/authSlice';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, error, isAuthenticated, user, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user && initialized) {
      if (user.role === 'ADMIN') {
        navigate('/dashboard');
        return;
      }
      
      const hasProfile = user.role === 'INFLUENCER' 
        ? user.influencerProfile !== null 
        : user.brandProfile !== null;
      
      if (!hasProfile || user.verificationStatus === 'PENDING') {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate, initialized]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Login Failed',
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
    dispatch(login(formData));
  };

  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="inline-block">
            <div className="text-3xl font-bold tracking-tight">
              DRK<span className="text-neutral-400">/</span>MTTR
            </div>
          </Link>

          <div>
            <h2 className="text-4xl font-bold mb-4">Welcome back</h2>
            <p className="text-neutral-400 text-lg">Sign in to continue your journey</p>
          </div>

          <div className="text-sm text-neutral-400">© 2026 DRK/MTTR</div>
        </div>
      </div>

      {}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
            
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Sign in</h1>
            <p className="text-neutral-600">Enter your credentials to continue</p>
          </div>

          {}
          <div className="mb-6 p-4 bg-neutral-100 rounded-lg text-sm">
            <p className="font-semibold mb-2">Test Accounts:</p>
            <p className="text-neutral-600">Admin: admin@drkmttr.com</p>
            <p className="text-neutral-600">Brand: nike@brand.com</p>
            <p className="text-neutral-600">Influencer: techguru@influencer.com</p>
            <p className="text-neutral-500 mt-1">Password: password123</p>
          </div>
              
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Email</label>
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
              <label className="block text-sm font-semibold text-neutral-900 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••"
                  required
                  className="w-full border border-neutral-300 rounded-lg px-4 py-3 pr-12 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-neutral-300" />
                <span className="text-sm text-neutral-600">Remember me</span>
              </label>
              <Link to="/auth/forgot-password" className="text-sm font-medium text-neutral-900 hover:underline">
                Forgot password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>
              
          <p className="mt-6 text-center text-neutral-600">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="font-semibold text-neutral-900 hover:underline">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
