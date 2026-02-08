import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { useGetOrderHistory } from '../hooks/useQueries';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetOrderHistory();

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center space-y-6">
          <Package className="h-24 w-24 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">No orders yet</h2>
          <p className="text-muted-foreground">Start shopping to see your orders here!</p>
          <Button onClick={() => navigate({ to: '/shop' })}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const total = Number(order.total) / 100;
          const date = new Date(Number(order.timestamp) / 1000000);

          return (
            <Card key={order.id.toString()} className="hover:shadow-medium transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {date.toLocaleDateString()} at {date.toLocaleTimeString()}
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
    </div>
  );
}
