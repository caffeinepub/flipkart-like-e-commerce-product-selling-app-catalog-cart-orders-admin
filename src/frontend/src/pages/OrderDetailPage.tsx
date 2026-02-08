import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { useGetOrder, useListProducts } from '../hooks/useQueries';
import { useMemo } from 'react';

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/order/$orderId' });
  const navigate = useNavigate();
  const { data: order, isLoading } = useGetOrder(orderId);
  const { data: allProducts = [] } = useListProducts(0, 1000);

  const orderItems = useMemo(() => {
    if (!order) return [];
    return order.items.map(([productId, quantity]) => {
      const product = allProducts.find((p) => p.id === productId);
      return { productId, quantity, product };
    });
  }, [order, allProducts]);

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Button onClick={() => navigate({ to: '/orders' })}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  const total = Number(order.total) / 100;
  const date = new Date(Number(order.timestamp) / 1000000);

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/orders' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Order #{order.id.toString()}</CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Placed on {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                  </p>
                </div>
                <Badge>Confirmed</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.map(({ productId, quantity, product }) => {
                if (!product) return null;
                const price = Number(product.price) / 100;
                const lineTotal = price * Number(quantity);

                return (
                  <div key={productId.toString()}>
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">📦</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {Number(quantity)}</p>
                        <p className="text-sm text-muted-foreground">${price.toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${lineTotal.toFixed(2)}</p>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">{order.address}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
