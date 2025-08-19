import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { logOut } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Mail, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface UserData {
  id: string;
  firebaseUid: string;
  username: string;
  email: string;
  role: 'participant' | 'organizer' | 'judge';
  createdAt: string;
  updatedAt: string;
}

export function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user data from API
  const { data: userData, isLoading, error } = useQuery<UserData>({
    queryKey: ['/api/auth/me'],
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await logOut();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message || 'An error occurred while logging out.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center h-48 text-center">
          <div>
            <p className="text-muted-foreground mb-4">Failed to load profile</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'organizer':
        return 'default';
      case 'judge':
        return 'secondary';
      case 'participant':
      default:
        return 'outline';
    }
  };

  const getUserInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Avatar className="h-20 w-20 mx-auto mb-4">
          <AvatarImage src={user?.photoURL || undefined} alt="Profile" />
          <AvatarFallback className="text-lg">
            {getUserInitials(user?.displayName || '', user?.email || '')}
          </AvatarFallback>
        </Avatar>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Display Name</p>
              <p className="text-sm text-muted-foreground" data-testid="text-display-name">
                {user?.displayName || 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground" data-testid="text-email">
                {user?.email}
              </p>
            </div>
          </div>

          {userData && (
            <>
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Role</p>
                  <Badge variant={getRoleBadgeVariant(userData.role)} data-testid="badge-role">
                    {userData.role}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-username">
                    {userData.username}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}