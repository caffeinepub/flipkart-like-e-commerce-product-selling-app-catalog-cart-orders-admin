import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ArrowLeft, Package, Eye } from 'lucide-react';
import { useGetProduct, useAddToCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { useState } from 'react';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/product/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const { data: product, isLoading } = useGetProduct(productId);
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }

    if (!product) return;

    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(quantity),
      });
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate({ to: '/shop' })}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const price = Number(product.price) / 100;
  const isOutOfStock = Number(product.stock) === 0;

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/shop' })} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shop
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <Card>
          <CardContent className="p-8">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-9xl">📦</div>
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl font-bold text-primary">${price.toFixed(2)}</span>
              {isOutOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : (
                <Badge variant="secondary">{Number(product.stock)} in stock</Badge>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <Separator />

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{Number(product.views)} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>{Number(product.purchases)} sold</span>
            </div>
          </div>

          <Separator />

          {/* Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-semibold">Quantity:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(Number(product.stock), quantity + 1))}
                  disabled={quantity >= Number(product.stock)}
                >
                  +
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCart.isPending || !isAuthenticated}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isOutOfStock ? 'Out of Stock' : addToCart.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>

            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground text-center">Please log in to add items to cart</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
