import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '@/lib/axios';
import { getMe } from '@/store/authSlice';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, AlertCircle } from 'lucide-react';

export default function Settings() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [nameLoading, setNameLoading] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);

  const handleNameSave = async (e) => {
    e.preventDefault();
    setNameLoading(true);
    try {
      await api.put('/api/auth/update-profile', { name });
      dispatch(getMe());
      toast({ title: 'Saved', description: 'Your name has been updated' });
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update', variant: 'destructive' });
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwords.new.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    setPassLoading(true);
    try {
      await api.put('/api/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setPasswords({ current: '', new: '', confirm: '' });
      toast({ title: 'Done', description: 'Password changed successfully' });
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to change password', variant: 'destructive' });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account</p>
      </div>

      <div className="space-y-6">
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-background">
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Account Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <div className="w-full border border-border rounded-lg px-4 py-3 bg-muted text-muted-foreground text-sm">
                {user?.email}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <form onSubmit={handleNameSave}>
              <label className="block text-sm font-medium text-foreground mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Your name"
              />
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="submit"
                  disabled={nameLoading || name === user?.name}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {nameLoading ? 'Saving...' : 'Save Name'}
                </button>
                <span className="text-xs text-muted-foreground capitalize">Role: {user?.role?.toLowerCase()}</span>
              </div>
            </form>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-background">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground">Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Repeat new password"
              />
            </div>
            {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                Passwords do not match
              </div>
            )}
            <button
              type="submit"
              disabled={passLoading || !passwords.current || !passwords.new || !passwords.confirm}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {passLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
