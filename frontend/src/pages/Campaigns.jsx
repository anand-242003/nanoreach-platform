import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Search, Filter, Target, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { CardStack } from '@/components/ui/card-stack';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
export default function Campaigns() {
  const navigate = useNavigate();
  const { verificationStatus } = useSelector((state) => state.auth);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/campaigns?status=ACTIVE`, { withCredentials: true });
      setCampaigns(data.campaigns || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  if (verificationStatus === 'UNDER_REVIEW') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-muted rounded-xl p-8 text-center border border-border">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Profile Under Review</h2>
          <p className="text-muted-foreground">Your profile has been submitted and is currently being reviewed by our team. You'll be able to browse campaigns once approved.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'REJECTED') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-destructive/10 rounded-xl p-8 text-center border border-destructive/30">
          <Target className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verification Rejected</h2>
          <p className="text-destructive mb-6">Your profile was not approved. Please update your details and resubmit.</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          >
            Update & Resubmit
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus !== 'VERIFIED') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-muted rounded-xl p-8 text-center border border-border">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verification Required</h2>
          <p className="text-muted-foreground mb-6">Complete your profile verification to browse campaigns.</p>
          <button
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg"
          >
            Complete Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Discover and apply to campaigns</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 border rounded-lg hover:bg-muted">
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No campaigns found</p>
        </div>
      ) : (
        <CardStack
          items={filteredCampaigns.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            href: `/campaigns/${c.id}`,
            tag: c.status,
            budget: c.budget,
            endDate: c.endDate,
            categoryTags: c.categoryTags,
          }))}
          cardWidth={480}
          cardHeight={300}
          overlap={0.5}
          spreadDeg={44}
          autoAdvance
          intervalMs={3000}
          pauseOnHover
          showDots
          renderCard={(item, { active }) => (
            <CampaignCard item={item} active={active} onNavigate={navigate} />
          )}
        />
      )}
    </div>
  );
}

const CATEGORY_GRADIENTS = [
  "from-violet-600 to-indigo-700",
  "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-700",
  "from-sky-500 to-blue-700",
  "from-fuchsia-500 to-purple-700",
];

function categoryGradient(tags) {
  if (!tags || tags.length === 0) return CATEGORY_GRADIENTS[0];
  const seed = tags[0].charCodeAt(0) % CATEGORY_GRADIENTS.length;
  return CATEGORY_GRADIENTS[seed];
}

function CampaignCard({ item, active, onNavigate }) {
  const grad = categoryGradient(item.categoryTags);
  return (
    <div className={`relative h-full w-full bg-gradient-to-br ${grad}`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {item.tag || "ACTIVE"}
          </span>
          {item.categoryTags?.length > 0 && (
            <span className="rounded-full bg-black/20 px-2 py-1 text-xs text-white/80 backdrop-blur-sm">
              {item.categoryTags[0]}
            </span>
          )}
        </div>

        <div>
          <h3 className="mb-1 line-clamp-2 text-xl font-bold leading-tight text-white">
            {item.title}
          </h3>
          {item.description && (
            <p className="line-clamp-2 text-sm text-white/70">{item.description}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/20 pt-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <DollarSign className="h-4 w-4 opacity-80" />
              ₹{item.budget?.toLocaleString() ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/80">
              <Calendar className="h-4 w-4 opacity-70" />
              {item.endDate ? new Date(item.endDate).toLocaleDateString() : "—"}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(`/campaigns/${item.id}`); }}
              className="ml-auto flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              Apply <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
