import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { products } from '@/data/products';
import { Product, Filters } from '@/types/product';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [filters, setFilters] = useState<Filters>({
    brands: [],
    priceRange: [0, 10000],
    gender: [],
    type: [],
    caseMaterial: [],
    dialColor: [],
  });

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(product => {
      const priceMatch = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const brandMatch = filters.brands.length === 0 || filters.brands.includes(product.brand);
      const genderMatch = filters.gender.length === 0 || filters.gender.includes(product.gender);
      const typeMatch = filters.type.length === 0 || filters.type.includes(product.type);
      const materialMatch = filters.caseMaterial.length === 0 || filters.caseMaterial.includes(product.caseMaterial);
      const colorMatch = filters.dialColor.length === 0 || filters.dialColor.includes(product.dialColor);

      return priceMatch && brandMatch && genderMatch && typeMatch && materialMatch && colorMatch;
    });

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return result;
  }, [filters, sortBy]);

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in">
            Timeless Elegance
          </h1>
          <p className="font-body text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in">
            Discover exquisite timepieces that define sophistication and precision
          </p>
          <Button size="lg" className="font-body font-medium animate-scale-in">
            Explore Collection
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex">
        <FilterSidebar filters={filters} onFiltersChange={setFilters} />
        
        <main className="flex-1">
          <div className="container px-6 py-8">
            {/* Sort & Results */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <p className="font-body text-muted-foreground">
                Showing {filteredAndSortedProducts.length} of {products.length} products
              </p>
              
              <div className="flex items-center gap-2">
                <span className="font-body text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured" className="font-body">Featured</SelectItem>
                    <SelectItem value="price-low" className="font-body">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="font-body">Price: High to Low</SelectItem>
                    <SelectItem value="name" className="font-body">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={setSelectedProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="font-body text-lg text-muted-foreground">
                  No products match your filters. Try adjusting your selection.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
      
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
};

export default Index;
