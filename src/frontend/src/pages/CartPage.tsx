import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useGetCart, useGetCartTotal, useRemoveFromCart, useUpdateCartQuantity, useListProducts } from '../hooks/useQueries';
import { toast } from 'sonner';
import { useMemo } from 'react';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartItems = [], isLoading } = useGetCart();
  const { data: cartTotal = BigInt(0) } = useGetCartTotal();
  const { data: allProducts = [] } = useListProducts(0, 1000);
  const removeFromCart = useRemoveFromCart();
  const updateQuantity = useUpdateCartQuantity();

  const cartWithProducts = useMemo(() => {
    return cartItems.map((item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      return { ...item, product };
    });
  }, [cartItems, allProducts]);

  const handleRemove = async (productId: bigint) => {
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const handleUpdateQuantity = async (productId: bigint, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity.mutateAsync({ productId, quantity: BigInt(newQuantity) });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-12">
        <div className="max-w-md mx-auto text-center space-y-6">
          <img
            src="/assets/generated/empty-cart.dim_800x600.png"
            alt="Empty Cart"
            className="w-full rounded-lg"
          />
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground">Add some products to get started!</p>
          <Button onClick={() => navigate({ to: '/shop' })}>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  const total = Number(cartTotal) / 100;

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartWithProducts.map(({ productId, quantity, product }) => {
            if (!product) return null;
            const price = Number(product.price) / 100;
            const lineTotal = price * Number(quantity);

            return (
              <Card key={productId.toString()}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">📦</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">${price.toFixed(2)} each</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(productId, Number(quantity) - 1)}
                            disabled={Number(quantity) <= 1 || updateQuantity.isPending}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-semibold">{Number(quantity)}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(productId, Number(quantity) + 1)}
                            disabled={Number(quantity) >= Number(product.stock) || updateQuantity.isPending}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(productId)}
                          disabled={removeFromCart.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${lineTotal.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div>
          <Card className="sticky top-20">
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
            <CardFooter>
              <Button size="lg" className="w-full" onClick={() => navigate({ to: '/checkout' })}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
