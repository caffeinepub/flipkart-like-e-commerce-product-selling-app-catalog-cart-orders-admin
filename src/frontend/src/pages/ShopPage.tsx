import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductGrid from '../components/products/ProductGrid';
import { useListProducts, useListCategories, useSearchProducts, useFilterProductsByCategory } from '../hooks/useQueries';

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const { data: allProducts = [], isLoading: productsLoading } = useListProducts(0, 100);
  const { data: categories = [] } = useListCategories();
  const { data: searchResults = [] } = useSearchProducts(searchQuery);
  const { data: categoryProducts = [] } = useFilterProductsByCategory(
    selectedCategory !== 'all' ? selectedCategory : undefined
  );

  const displayProducts = useMemo(() => {
    let products = allProducts;

    // Apply search
    if (searchQuery.trim()) {
      products = searchResults;
    }
    // Apply category filter
    else if (selectedCategory !== 'all') {
      products = categoryProducts;
    }

    // Apply sorting
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'popular':
        sorted.sort((a, b) => Number(b.purchases) - Number(a.purchases));
        break;
      case 'newest':
      default:
        sorted.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
        break;
    }

    return sorted;
  }, [allProducts, searchResults, categoryProducts, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shop All Products</h1>
        <p className="text-muted-foreground">Browse our complete collection</p>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id.toString()} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <ProductGrid products={displayProducts} isLoading={productsLoading} />
    </div>
  );
}
