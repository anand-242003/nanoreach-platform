import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import Landing from '@/pages/Landing';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import Dashboard from '@/pages/Dashboard';
import Layout from '@/components/Layout';
import Campaigns from '@/pages/Campaigns';
import CreateCampaign from '@/pages/CreateCampaign';
import CampaignDetails from '@/pages/CampaignDetails';
import MyCampaigns from '@/pages/MyCampaigns';
import Submissions from '@/pages/Submissions';
import EditCampaign from '@/pages/EditCampaign';
import CampaignSubmissions from '@/pages/CampaignSubmissions';
import Onboarding from '@/pages/Onboarding';
import MyApplications from '@/pages/MyApplications';
import ReferralAnalytics from '@/pages/ReferralAnalytics';
import VerificationQueue from '@/pages/admin/VerificationQueue';
import EscrowManagement from '@/pages/admin/EscrowManagement';
import ApplicationQueue from '@/pages/admin/ApplicationQueue';
import PendingPayments from '@/pages/PendingPayments';
import SubmissionReview from '@/pages/admin/SubmissionReview';
import AdminSubmissions from '@/pages/admin/AdminSubmissions';
import Referrals from '@/pages/Referrals';
import Settings from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        <Route element={
          <ProtectedRoute>
            <Layout /> 
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/create" element={<CreateCampaign />} />
          <Route path="/campaigns/my" element={<MyCampaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route path="/campaigns/:id/edit" element={<EditCampaign />} />
          <Route path="/campaigns/:id/submissions" element={<CampaignSubmissions />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/applications" element={<MyApplications />} />
          <Route path="/referral/:campaignId/analytics" element={<ReferralAnalytics />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/payments/pending" element={<PendingPayments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin/verifications/:type" element={<VerificationQueue />} />
          <Route path="/admin/escrow" element={<EscrowManagement />} />
          <Route path="/admin/applications" element={<ApplicationQueue />} />
          <Route path="/admin/submissions" element={<AdminSubmissions />} />
          <Route path="/admin/submissions/:campaignId" element={<SubmissionReview />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
