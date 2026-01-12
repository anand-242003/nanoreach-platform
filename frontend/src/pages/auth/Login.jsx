import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '@/store/slices/authSlice';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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
        title: 'Login Failed',
        description: error,
        variant: 'destructive',
      });
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const result = await dispatch(loginUser({ email, password }));
    
    if (loginUser.fulfilled.match(result)) {
      toast({
        title: 'Welcome back!',
        description: 'Logged in successfully',
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
            <p className="text-neutral-500">Sign in to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full border border-neutral-200 rounded-lg pl-12 pr-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full border border-neutral-200 rounded-lg pl-12 pr-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <p className="text-center text-neutral-500 mt-6">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-neutral-900 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
