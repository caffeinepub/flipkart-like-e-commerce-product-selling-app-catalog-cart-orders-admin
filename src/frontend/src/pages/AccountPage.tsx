import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Package, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';

export default function AccountPage() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">My Account</h1>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-semibold">{userProfile?.name || 'Not set'}</p>
            </div>
            {userProfile?.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{userProfile.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Principal ID</p>
              <p className="font-mono text-xs break-all">{identity?.getPrincipal().toString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate({ to: '/orders' })}>
              <Package className="mr-2 h-4 w-4" />
              View My Orders
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate({ to: '/cart' })}>
              <Package className="mr-2 h-4 w-4" />
              View Cart
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
