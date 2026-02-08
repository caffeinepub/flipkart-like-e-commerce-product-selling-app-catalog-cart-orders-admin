import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ProductGrid from '../components/products/ProductGrid';
import { useGetPopularProducts } from '../hooks/useQueries';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: popularProducts = [], isLoading } = useGetPopularProducts(8);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Discover Amazing Products
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Shop the latest trends and find everything you need in one place. Quality products at great prices.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => navigate({ to: '/shop' })}>
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden shadow-medium">
              <img
                src="/assets/generated/hero-banner.dim_1600x600.png"
                alt="Shop Banner"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="container py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Popular Products</h2>
            <p className="text-muted-foreground">Trending items loved by our customers</p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: '/shop' })}>
            View All
          </Button>
        </div>
        <ProductGrid products={popularProducts} isLoading={isLoading} />
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">🚚</div>
              <h3 className="font-semibold text-xl">Fast Delivery</h3>
              <p className="text-muted-foreground">Quick and reliable shipping to your doorstep</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="font-semibold text-xl">Secure Payments</h3>
              <p className="text-muted-foreground">Your transactions are safe and protected</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="font-semibold text-xl">Quality Products</h3>
              <p className="text-muted-foreground">Carefully curated selection of items</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
