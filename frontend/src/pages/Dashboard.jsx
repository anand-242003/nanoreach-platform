import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    
    if (logoutUser.fulfilled.match(result)) {
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      navigate('/auth/login');
    } else {
      toast({
        title: 'Error',
        description: 'Logout failed',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">NanoReach</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{user?.role}</Badge>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h2>
          <p className="text-gray-600 mt-2">
            {user?.role === 'BRAND' 
              ? 'Manage your campaigns and find creators' 
              : 'Discover campaigns and grow your influence'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">{user?.role}</p>
              </div>
            </CardContent>
          </Card>

          {user?.role === 'BRAND' && (
            <Card>
              <CardHeader>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>Manage your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Create Campaign</Button>
              </CardContent>
            </Card>
          )}

          {user?.role === 'CREATOR' && (
            <Card>
              <CardHeader>
                <CardTitle>Discover</CardTitle>
                <CardDescription>Find campaigns to join</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Browse Campaigns</Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">
                {user?.role === 'BRAND' ? 'Active Campaigns' : 'Submissions'}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
