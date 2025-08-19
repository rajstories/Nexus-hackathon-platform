import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/components/auth/UserProfile';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950 dark:via-blue-950 dark:to-cyan-950 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Fusion X Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your hackathon command center</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <UserProfile />
          </div>
          
          <div className="md:col-span-1 lg:col-span-2">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Current Events</h3>
                  <p className="text-sm text-muted-foreground">View and manage hackathon events</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Team Management</h3>
                  <p className="text-sm text-muted-foreground">Create or join hackathon teams</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Submissions</h3>
                  <p className="text-sm text-muted-foreground">Submit and track your projects</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Announcements</h3>
                  <p className="text-sm text-muted-foreground">Stay updated with event news</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}