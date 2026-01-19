import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '@/store/slices/authSlice';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
