import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  TrendingUp, Users, DollarSign, Eye, Plus, ArrowRight,
  Clock, AlertCircle, Building2, Sparkles,
  Target, Award, FileText
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, verificationStatus } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN';
  const isBrand = user?.role === 'BRAND';
  const isInfluencer = user?.role === 'INFLUENCER';
  const isVerified = verificationStatus === 'VERIFIED';

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      if (isAdmin) {
        const [influencersRes, brandsRes] = await Promise.all([
          axios.get(`${API_URL}/admin/verifications/influencers?status=UNDER_REVIEW`, { withCredentials: true }).catch(() => ({ data: { influencers: [] } })),
          axios.get(`${API_URL}/admin/verifications/brands?status=UNDER_REVIEW`, { withCredentials: true }).catch(() => ({ data: { brands: [] } })),
        ]);
        setStats({
          pendingInfluencers: influencersRes.data.influencers?.length || 0,
          pendingBrands: brandsRes.data.brands?.length || 0,
        });
      }
      const campaignsRes = await axios.get(`${API_URL}/campaigns?status=ACTIVE`, { withCredentials: true }).catch(() => ({ data: { campaigns: [] } }));
      setCampaigns(campaignsRes.data.campaigns || []);
    } catch (error) {
      console.error('Dashboard Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdmin) return <AdminDashboard stats={stats} campaigns={campaigns} />;
  if (isBrand) return <BrandDashboard campaigns={campaigns} isVerified={isVerified} />;
  return <InfluencerDashboard campaigns={campaigns} isVerified={isVerified} user={user} />;
}

// Admin Dashboard
function AdminDashboard({ stats, campaigns }) {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage verifications and monitor platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Pending Influencers"
          value={stats?.pendingInfluencers || 0}
          icon={Sparkles}
          onClick={() => navigate('/admin/verifications/influencers')}
        />
        <StatCard
          title="Pending Brands"
          value={stats?.pendingBrands || 0}
          icon={Building2}
          onClick={() => navigate('/admin/verifications/brands')}
        />
        <StatCard title="Active Campaigns" value={campaigns.length} icon={Target} />
        <StatCard title="Total Users" value="-" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/admin/verifications/influencers')}
              className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 text-left"
            >
              <span className="text-sm">Review Influencer Verifications</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {stats?.pendingInfluencers || 0}
              </span>
            </button>
            <button
              onClick={() => navigate('/admin/verifications/brands')}
              className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-neutral-50 text-left"
            >
              <span className="text-sm">Review Brand Verifications</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {stats?.pendingBrands || 0}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">API Server</span>
              <span className="text-green-600">Operational</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Database</span>
              <span className="text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">File Storage</span>
              <span className="text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Brand Dashboard
function BrandDashboard({ campaigns, isVerified }) {
  const navigate = useNavigate();
  const { verificationStatus } = useSelector((state) => state.auth);

  if (!isVerified) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <VerificationRequired status={verificationStatus} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Brand Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage campaigns and track performance</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/create')}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Active Campaigns" value="0" icon={Target} />
        <StatCard title="Total Applications" value="0" icon={FileText} />
        <StatCard title="Total Spent" value="₹0" icon={DollarSign} />
        <StatCard title="Total Reach" value="0" icon={Eye} />
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Your Campaigns</h2>
          <Link to="/campaigns/my" className="text-sm text-neutral-600 hover:text-neutral-900">
            View All
          </Link>
        </div>
        
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 mb-4">No campaigns yet</p>
          <button
            onClick={() => navigate('/campaigns/create')}
            className="text-sm text-neutral-900 font-medium hover:underline"
          >
            Create your first campaign
          </button>
        </div>
      </div>
    </div>
  );
}

// Influencer Dashboard
function InfluencerDashboard({ campaigns, isVerified, user }) {
  const navigate = useNavigate();
  const { verificationStatus } = useSelector((state) => state.auth);

  if (!isVerified) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <VerificationRequired status={verificationStatus} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Welcome, {user?.influencerProfile?.displayName || user?.name}
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Find campaigns and start earning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Applied Campaigns" value="0" icon={FileText} />
        <StatCard title="Total Earnings" value="₹0" icon={DollarSign} />
        <StatCard title="Total Views" value="0" icon={Eye} />
        <StatCard title="Success Rate" value="0%" icon={Award} />
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Available Campaigns</h2>
          <Link to="/campaigns" className="text-sm text-neutral-600 hover:text-neutral-900">
            Browse All
          </Link>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">No campaigns available right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.slice(0, 5).map((campaign) => (
              <div
                key={campaign.id}
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-neutral-50 cursor-pointer"
              >
                <div>
                  <h3 className="font-medium text-neutral-900">{campaign.title}</h3>
                  <p className="text-sm text-neutral-500">
                    Budget: ₹{campaign.budget?.toLocaleString()} | Ends: {new Date(campaign.endDate).toLocaleDateString()}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border p-5 ${onClick ? 'cursor-pointer hover:border-neutral-400' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-neutral-400" />
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-sm text-neutral-500">{title}</p>
    </div>
  );
}

// Verification Required Component
function VerificationRequired({ status }) {
  const navigate = useNavigate();

  const config = {
    PENDING: {
      title: 'Complete Your Profile',
      message: 'You need to complete your profile to access the dashboard.',
      action: 'Complete Profile',
    },
    UNDER_REVIEW: {
      title: 'Verification Under Review',
      message: 'Your profile is being reviewed. This usually takes 24-48 hours.',
      action: null,
    },
    REJECTED: {
      title: 'Verification Rejected',
      message: 'Your verification was rejected. Please update your profile and try again.',
      action: 'Update Profile',
    },
  };

  const c = config[status] || config.PENDING;

  return (
    <div className="bg-neutral-50 rounded-lg border p-8 text-center">
      <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-neutral-900 mb-2">{c.title}</h2>
      <p className="text-neutral-600 mb-6 max-w-md mx-auto">{c.message}</p>
      {c.action && (
        <button
          onClick={() => navigate('/onboarding')}
          className="px-6 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
        >
          {c.action}
        </button>
      )}
    </div>
  );
}
