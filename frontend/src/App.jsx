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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />

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
          <Route path="/campaigns/:id/submit" element={<Submissions />} />
          <Route path="/submissions" element={<Submissions />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
