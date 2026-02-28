import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import { 
  Home, Target, FileText, LogOut, Menu, X,
  Building2, Sparkles, Plus, DollarSign, ClipboardList, Users
} from 'lucide-react';
import { useState } from 'react';
import VerificationBanner from './VerificationBanner';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, verificationStatus } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isBrand = user?.role === 'BRAND';

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/auth/login');
  };

  const adminLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/admin/verifications/influencers', icon: Sparkles, label: 'Influencer Verifications' },
    { to: '/admin/verifications/brands', icon: Building2, label: 'Brand Verifications' },
    { to: '/admin/applications', icon: ClipboardList, label: 'Application Queue' },
    { to: '/admin/escrow', icon: DollarSign, label: 'Escrow Management' },
    { to: '/campaigns', icon: Target, label: 'All Campaigns' },
    { to: '/admin/submissions', icon: FileText, label: 'Submission Reviews' },
  ];

  const brandLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/campaigns/my', icon: Target, label: 'My Campaigns' },
    { to: '/campaigns/create', icon: Plus, label: 'Create Campaign' },
    { to: '/payments/pending', icon: DollarSign, label: 'Pending Payments' },
  ];

  const influencerLinks = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/campaigns', icon: Target, label: 'Browse Campaigns' },
    { to: '/applications', icon: ClipboardList, label: 'My Applications' },
    { to: '/submissions', icon: FileText, label: 'My Activity' },
  ];

  const links = isAdmin ? adminLinks : isBrand ? brandLinks : influencerLinks;

  return (
    <div className="min-h-screen bg-neutral-50">
      {verificationStatus && verificationStatus !== 'VERIFIED' && !isAdmin && <VerificationBanner />}
      
      {}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {}
          <div className="p-6 border-b">
            <Link to="/dashboard" className="text-2xl font-bold text-neutral-900">
              DRK<span className="text-neutral-400">/</span>MTTR
            </Link>
            <p className="text-xs text-neutral-500 mt-1 capitalize">{user?.role?.toLowerCase()} Panel</p>
          </div>

          {}
          <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => {
              const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-neutral-900 text-white' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                <span className="text-sm font-semibold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {}
      <main className="lg:ml-64">
        <Outlet />
      </main>
    </div>
  );
}