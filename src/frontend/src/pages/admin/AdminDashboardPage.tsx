import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Settings } from 'lucide-react';
import AdminRouteGuard from '../../components/auth/AdminRouteGuard';
import { useGetAllOrders, useListProducts } from '../../hooks/useQueries';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data: orders = [] } = useGetAllOrders();
  const { data: products = [] } = useListProducts(0, 1000);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0) / 100;

  return (
    <AdminRouteGuard>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{products.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{orders.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => navigate({ to: '/admin/products' })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Manage Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Add, edit, or remove products from your catalog</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => navigate({ to: '/admin/orders' })}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                View Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View and manage customer orders</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
