import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useGetCart, useGetCartTotal, useCheckout, useListProducts } from '../hooks/useQueries';
import { validateCheckoutForm } from '../lib/validation';
import ErrorAlert from '../components/feedback/ErrorAlert';
import { toast } from 'sonner';
import { useMemo } from 'react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cartItems = [] } = useGetCart();
  const { data: cartTotal = BigInt(0) } = useGetCartTotal();
  const { data: allProducts = [] } = useListProducts(0, 1000);
  const checkout = useCheckout();

  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const cartWithProducts = useMemo(() => {
    return cartItems.map((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      return { ...item, product };
    });
  }, [cartItems, allProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateCheckoutForm({ address });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const orderId = await checkout.mutateAsync(address);
      toast.success('Order placed successfully!');
      navigate({ to: '/order-confirmation/$orderId', params: { orderId: orderId.toString() } });
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate({ to: '/shop' })}>Go to Shop</Button>
        </div>
      </div>
    );
  }

  const total = Number(cartTotal) / 100;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Shipping Address *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setErrors({});
                    }}
                    placeholder="Enter your complete shipping address"
                    rows={4}
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>

                {checkout.isError && (
                  <ErrorAlert message={checkout.error?.message || 'Failed to place order'} />
                )}

                <Button type="submit" size="lg" className="w-full" disabled={checkout.isPending}>
                  {checkout.isPending ? 'Placing Order...' : 'Place Order'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartWithProducts.map(({ productId, quantity, product }) => {
                  if (!product) return null;
                  const price = Number(product.price) / 100;
                  const lineTotal = price * Number(quantity);
                  return (
                    <div key={productId.toString()} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {product.title} × {Number(quantity)}
                      </span>
                      <span className="font-semibold">${lineTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <Separator />
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
