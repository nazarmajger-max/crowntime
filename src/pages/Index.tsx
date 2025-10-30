import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Filters } from '@/types/product';
import heroBg from '@/assets/hero-bg.jpg';
import { toast } from 'sonner';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts: Product[] = (data || []).map(p => {
        const gender = (p.gender?.toLowerCase() || 'unisex') as 'men' | 'women' | 'unisex';
        const type = (p.category?.toLowerCase() || 'analog') as Product['type'];
        const validTypes = ['analog', 'digital', 'sport', 'luxury', 'dress', 'dive'];
        
        return {
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: Number(p.price),
          description: p.description || '',
          image: p.image_url,
          category: p.category,
          gender: ['men', 'women', 'unisex'].includes(gender) ? gender : 'unisex',
          type: validTypes.includes(type) ? type : 'analog',
          caseMaterial: p.case_material || 'Steel',
          dialColor: p.dial_color || 'Black',
          waterResistance: p.water_resistance || '50m',
          movementType: p.movement_type || 'Automatic',
          movement: p.movement_type || 'Automatic',
          inStock: p.in_stock,
        };
      });

      setProducts(formattedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Помилка завантаження товарів');
    } finally {
      setLoading(false);
    }
  };

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
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold"></div>
              </div>
            ) : (
              <>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onProductClick={setSelectedProduct}
                    />
                  ))}
                </div>

                {filteredAndSortedProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="font-body text-muted-foreground">
                      No products found matching your filters.
                    </p>
                  </div>
                )}
              </>
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
