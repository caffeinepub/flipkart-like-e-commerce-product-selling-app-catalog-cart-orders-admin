import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '../../backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const price = Number(product.price) / 100;
  const isOutOfStock = Number(product.stock) === 0;

  return (
    <Link to="/product/$productId" params={{ productId: product.id.toString() }}>
      <Card className="h-full hover:shadow-medium transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          <div className="aspect-square bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
            <div className="text-6xl group-hover:scale-110 transition-transform">📦</div>
          </div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">${price.toFixed(2)}</span>
            {isOutOfStock ? (
              <Badge variant="destructive" className="w-fit mt-1">
                Out of Stock
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground mt-1">{Number(product.stock)} in stock</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
