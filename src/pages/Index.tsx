import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Filters } from '@/types/product';
import heroBg from '@/assets/hero-bg.jpg';
import { toast } from 'sonner';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [filters, setFilters] = useState<Filters>({
    brands: [],
    priceRange: [0, 10000],
    gender: [],
    type: [],
    caseMaterial: [],
    dialColor: [],
  });

  // Extract unique values from products for filters
  const availableBrands = useMemo(() => {
    const brands = products.map(p => p.brand).filter(Boolean);
    return Array.from(new Set(brands)).sort();
  }, [products]);

  const availableTypes = useMemo(() => {
    const types = products.map(p => p.category).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [products]);

  const availableGenders = useMemo(() => {
    const genders = products.map(p => p.gender).filter(Boolean);
    return Array.from(new Set(genders)).sort();
  }, [products]);

  const availableCaseMaterials = useMemo(() => {
    const materials = products.map(p => p.caseMaterial).filter(Boolean);
    return Array.from(new Set(materials)).sort();
  }, [products]);

  const availableDialColors = useMemo(() => {
    const colors = products.map(p => p.dialColor).filter(Boolean);
    return Array.from(new Set(colors)).sort();
  }, [products]);

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
    let result = [...products];

    // Apply filters only if they are set
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) {
      result = result.filter(product => 
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );
    }

    if (filters.brands.length > 0) {
      result = result.filter(product => filters.brands.includes(product.brand));
    }

    if (filters.gender.length > 0) {
      result = result.filter(product => filters.gender.includes(product.gender));
    }

    if (filters.type.length > 0) {
      result = result.filter(product => filters.type.includes(product.type));
    }

    if (filters.caseMaterial.length > 0) {
      result = result.filter(product => filters.caseMaterial.includes(product.caseMaterial));
    }

    if (filters.dialColor.length > 0) {
      result = result.filter(product => filters.dialColor.includes(product.dialColor));
    }

    // Apply sorting
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
  }, [products, filters, sortBy]);

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
            WATCHZONE
          </h1>
          <p className="font-body text-lg md:text-xl mb-8 max-w-2xl mx-auto animate-fade-in">
            Найкращий вибір наручних годинників преміум класу
          </p>
          <Button size="lg" className="font-body font-medium animate-scale-in">
            Переглянути колекцію
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex">
        <FilterSidebar 
          filters={filters} 
          onFiltersChange={setFilters}
          availableBrands={availableBrands}
          availableTypes={availableTypes}
          availableGenders={availableGenders}
          availableCaseMaterials={availableCaseMaterials}
          availableDialColors={availableDialColors}
        />
        
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
                    Показано {filteredAndSortedProducts.length} з {products.length} товарів
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm text-muted-foreground">Сортувати за:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px] font-body">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured" className="font-body">Рекомендовані</SelectItem>
                        <SelectItem value="price-low" className="font-body">Ціна: від низької</SelectItem>
                        <SelectItem value="price-high" className="font-body">Ціна: від високої</SelectItem>
                        <SelectItem value="name" className="font-body">Назва: А до Я</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {filteredAndSortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>

                {filteredAndSortedProducts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="font-body text-muted-foreground">
                      Товарів не знайдено за вашими фільтрами.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
};

export default Index;
