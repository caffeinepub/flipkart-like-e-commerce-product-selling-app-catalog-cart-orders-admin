import { Link, useNavigate } from '@tanstack/react-router';
import { ShoppingCart, User, Menu, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCart, useIsCallerAdmin } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function TopNav() {
  const navigate = useNavigate();
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const { data: cartItems = [] } = useGetCart();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const NavLinks = () => (
    <>
      <Link
        to="/"
        className="text-sm font-medium transition-colors hover:text-primary"
        onClick={() => setMobileMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        to="/shop"
        className="text-sm font-medium transition-colors hover:text-primary"
        onClick={() => setMobileMenuOpen(false)}
      >
        Shop
      </Link>
      {isAuthenticated && (
        <Link
          to="/orders"
          className="text-sm font-medium transition-colors hover:text-primary"
          onClick={() => setMobileMenuOpen(false)}
        >
          Orders
        </Link>
      )}
      {isAdmin && (
        <Link
          to="/admin"
          className="text-sm font-medium transition-colors hover:text-primary"
          onClick={() => setMobileMenuOpen(false)}
        >
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/assets/generated/shop-logo.dim_512x512.png" alt="Shop Logo" className="h-8 w-8" />
            <span className="font-bold text-xl">ShopHub</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate({ to: '/cart' })}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: '/account' })}>
                  <User className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/orders' })}>
                  <Package className="mr-2 h-4 w-4" />
                  Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAuth}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleAuth} disabled={loginStatus === 'logging-in'}>
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
            </Button>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
