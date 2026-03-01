import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Clock, XCircle, ArrowRight } from 'lucide-react';

export default function VerificationBanner() {
  const navigate = useNavigate();
  const { verificationStatus } = useSelector((state) => state.auth);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (verificationStatus === 'VERIFIED') {
      const timer = setTimeout(() => setIsDismissed(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [verificationStatus]);

  if (isDismissed || !verificationStatus || verificationStatus === 'VERIFIED') return null;

  const configs = {
    PENDING: {
      icon: AlertCircle,
      bg: 'bg-foreground',
      border: 'border-transparent',
      iconColor: 'text-primary',
      textColor: 'text-background',
      title: 'Complete your profile',
      action: { text: 'Complete Profile', path: '/onboarding' },
    },
    UNDER_REVIEW: {
      icon: Clock,
      bg: 'bg-muted',
      border: 'border-border',
      iconColor: 'text-foreground',
      textColor: 'text-foreground',
      title: 'Under Review',
      action: null,
    },
    REJECTED: {
      icon: XCircle,
      bg: 'bg-destructive/10',
      border: 'border-destructive/30',
      iconColor: 'text-destructive',
      textColor: 'text-destructive',
      title: 'Verification Failed',
      action: { text: 'Update Profile', path: '/onboarding' },
    },
  };

  const config = configs[verificationStatus];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className={`border-b ${config.border} ${config.bg}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
              <p className={`text-sm font-medium ${config.textColor}`}>{config.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {config.action && (
                <button
                  onClick={() => navigate(config.action.path)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md ${config.textColor} hover:underline`}
                >
                  {config.action.text}
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {verificationStatus !== 'UNDER_REVIEW' && (
                <button onClick={() => setIsDismissed(true)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
