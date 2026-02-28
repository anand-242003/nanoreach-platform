import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import VerificationBanner from './VerificationBanner';
import { NanoReachSidebar } from '@/components/ui/animated-sidebar';

export default function Layout() {
  const { user, verificationStatus } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-background flex">
      <NanoReachSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {verificationStatus && verificationStatus !== 'VERIFIED' && !isAdmin && <VerificationBanner />}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}