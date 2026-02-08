import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminRouteGuard from '../../components/auth/AdminRouteGuard';
import { useGetAllOrders } from '../../hooks/useQueries';

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetAllOrders();

  return (
    <AdminRouteGuard>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">All Orders</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const total = Number(order.total) / 100;
              const date = new Date(Number(order.timestamp) / 1000000);

              return (
                <Card key={order.id.toString()}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          Customer: {order.user.toString().slice(0, 20)}...
                        </p>
                      </div>
                      <Badge>Confirmed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </p>
                        <p className="font-bold text-lg mt-1">${total.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate({ to: '/order/$orderId', params: { orderId: order.id.toString() } })}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminRouteGuard>
  );
}
