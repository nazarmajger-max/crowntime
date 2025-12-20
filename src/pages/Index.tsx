import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Product, Filters } from '@/types/product';
import heroBg from '@/assets/hero-bg.jpg';
import { toast } from 'sonner';
import { ChevronLeft, SlidersHorizontal, ChevronDown } from 'lucide-react';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    brands: [],
    priceRange: [0, 10000],
    gender: [],
    type: [],
    caseMaterial: [],
    dialColor: []
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
      // Fetch products with their primary images
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch primary images for products
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .eq('is_primary', true);

      if (imagesError) throw imagesError;

      // Create a map of product_id to image_url
      const imageMap = new Map(imagesData?.map(img => [img.product_id, img.image_url]) || []);

      const formattedProducts: Product[] = (productsData || []).map(p => {
        const gender = (p.gender?.toLowerCase() || 'unisex') as 'men' | 'women' | 'unisex';
        const validTypes = ['analog', 'digital', 'sport', 'luxury', 'dress', 'dive'];
        const type = validTypes.includes(p.movement_type?.toLowerCase() || '') 
          ? p.movement_type?.toLowerCase() as Product['type'] 
          : 'analog';
        
        return {
          id: p.id,
          name: p.name,
          brand: p.brand || '',
          price: Number(p.price),
          description: p.description || '',
          image: imageMap.get(p.id) || '/placeholder.svg',
          category: p.movement_type || 'Analog',
          gender: ['men', 'women', 'unisex'].includes(gender) ? gender : 'unisex',
          type: type,
          caseMaterial: p.case_material || 'Steel',
          dialColor: p.dial_color || 'Black',
          waterResistance: p.water_resistance || '50m',
          movement: p.movement_type || 'Automatic',
          inStock: p.stock_quantity > 0
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
      result = result.filter(product => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]);
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

  const activeFilterCount = filters.brands.length + filters.gender.length + filters.type.length + filters.caseMaterial.length + filters.dialColor.length;

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative h-[45vh] md:h-[60vh] bg-cover bg-center flex items-center justify-center" 
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="font-display text-3xl md:text-6xl lg:text-7xl font-bold mb-2 md:mb-4 animate-fade-in tracking-wide">
            WATCHZONE
          </h1>
          <p className="font-body text-sm md:text-xl mb-5 md:mb-8 max-w-2xl mx-auto animate-fade-in opacity-90">
            Найкращий вибір наручних годинників преміум класу
          </p>
          <Button size="lg" className="font-body font-medium animate-scale-in h-12 px-8 text-base">
            Переглянути колекцію
          </Button>
        </div>
      </section>

      {/* Mobile: Title Section */}
      <div className="md:hidden bg-background px-4 py-4 border-b">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          {products.length.toLocaleString()} моделей
        </p>
      </div>

      {/* Mobile: Sort & Filter Bar */}
      <div className="md:hidden sticky top-14 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 h-10 font-body text-xs uppercase tracking-wide border-muted">
              <div className="flex items-center gap-1.5">
                <span>Сортування</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured" className="font-body text-sm">Рекомендовані</SelectItem>
              <SelectItem value="price-low" className="font-body text-sm">Ціна: від низької</SelectItem>
              <SelectItem value="price-high" className="font-body text-sm">Ціна: від високої</SelectItem>
              <SelectItem value="name" className="font-body text-sm">Назва: А до Я</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="h-10 gap-1.5 font-body text-xs uppercase tracking-wide whitespace-nowrap px-3 border-muted"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Фільтри {activeFilterCount > 0 && <span className="bg-accent text-accent-foreground rounded-full h-5 w-5 text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-xl">Фільтри</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterSidebar 
              filters={filters} 
              onFiltersChange={setFilters}
              availableBrands={availableBrands}
              availableTypes={availableTypes}
              availableGenders={availableGenders}
              availableCaseMaterials={availableCaseMaterials}
              availableDialColors={availableDialColors}
            />
          </div>
          <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 mt-6 flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setFilters({
                  brands: [],
                  priceRange: [0, 10000],
                  gender: [],
                  type: [],
                  caseMaterial: [],
                  dialColor: []
                });
              }}
            >
              Скинути фільтри
            </Button>
            <Button 
              className="flex-1"
              onClick={() => setFiltersOpen(false)}
            >
              Застосувати ({filteredAndSortedProducts.length})
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <FilterSidebar 
            filters={filters} 
            onFiltersChange={setFilters} 
            availableBrands={availableBrands} 
            availableTypes={availableTypes} 
            availableGenders={availableGenders} 
            availableCaseMaterials={availableCaseMaterials} 
            availableDialColors={availableDialColors} 
          />
        </div>
        
        <main className="flex-1">
          <div className="container md:px-6 px-0 py-0 md:py-8">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold"></div>
              </div>
            ) : (
              <>
                {/* Desktop Header */}
                <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
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

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-px md:gap-6 mb-12 bg-border md:bg-transparent">
                  {filteredAndSortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
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
