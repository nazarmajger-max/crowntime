import { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { FilterSidebar } from '@/components/FilterSidebar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Product, Filters } from '@/types/product';
import heroBg from '@/assets/hero-bg.jpg';
import { toast } from 'sonner';
import { ChevronLeft, SlidersHorizontal, ChevronDown } from 'lucide-react';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
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

  const activeFilterCount = filters.brands.length + filters.gender.length + filters.type.length + filters.caseMaterial.length + filters.dialColor.length;

  return (
    <>
      <Header />
      
      {/* Hero Section - Hidden on Mobile */}
      <section 
        className="hidden md:flex relative h-[60vh] bg-cover bg-center items-center justify-center"
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

      {/* Mobile: Breadcrumb & Title */}
      <div className="md:hidden bg-background">
        <div className="px-4 py-3 border-b">
          <button className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span>Головна сторінка</span>
          </button>
        </div>
        
        <div className="px-4 py-6">
          <h1 className="font-display text-2xl font-bold mb-1 uppercase leading-tight">
            НАРУЧНИЙ ГОДИННИК<br />ЧОЛОВІЧІ, УНІСЕКС
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            {products.length.toLocaleString()} МОДЕЛЕЙ
          </p>
        </div>
      </div>

      {/* Mobile: Sort & Filter Bar */}
      <div className="md:hidden sticky top-14 z-40 bg-background border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="flex-1 h-11 font-body text-sm uppercase">
              <div className="flex items-center gap-2">
                <span>СОРТУВАННЯ</span>
                <ChevronDown className="h-4 w-4" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured" className="font-body">Рекомендовані</SelectItem>
              <SelectItem value="price-low" className="font-body">Ціна: від низької</SelectItem>
              <SelectItem value="price-high" className="font-body">Ціна: від високої</SelectItem>
              <SelectItem value="name" className="font-body">Назва: А до Я</SelectItem>
            </SelectContent>
          </Select>
          
          <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="h-11 gap-2 font-body text-sm uppercase whitespace-nowrap">
                <SlidersHorizontal className="h-4 w-4" />
                ФІЛЬТРИ {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle className="font-display text-xl">Фільтри</DrawerTitle>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-6">
                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h3 className="font-body font-semibold mb-4">Діапазон цін</h3>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Від (₴)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={10000}
                          value={filters.priceRange[0]}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(10000, Number(e.target.value) || 0));
                            setFilters({ ...filters, priceRange: [value, filters.priceRange[1]] });
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">До (₴)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={10000}
                          value={filters.priceRange[1]}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(10000, Number(e.target.value) || 10000));
                            setFilters({ ...filters, priceRange: [filters.priceRange[0], value] });
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Brand */}
                  {availableBrands.length > 0 && (
                    <div>
                      <h3 className="font-body font-semibold mb-3">Бренд</h3>
                      <div className="space-y-2">
                        {availableBrands.sort().map(brand => (
                          <div key={brand} className="flex items-center gap-2">
                            <Checkbox
                              id={`mobile-brand-${brand}`}
                              checked={filters.brands.includes(brand)}
                              onCheckedChange={() => {
                                const currentValues = filters.brands;
                                const newValues = currentValues.includes(brand)
                                  ? currentValues.filter(v => v !== brand)
                                  : [...currentValues, brand];
                                setFilters({ ...filters, brands: newValues });
                              }}
                            />
                            <Label htmlFor={`mobile-brand-${brand}`} className="font-body text-sm cursor-pointer">
                              {brand}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gender */}
                  {availableGenders.length > 0 && (
                    <div>
                      <h3 className="font-body font-semibold mb-3">Стать</h3>
                      <div className="space-y-2">
                        {availableGenders.map(gender => (
                          <div key={gender} className="flex items-center gap-2">
                            <Checkbox
                              id={`mobile-gender-${gender}`}
                              checked={filters.gender.includes(gender)}
                              onCheckedChange={() => {
                                const currentValues = filters.gender;
                                const newValues = currentValues.includes(gender)
                                  ? currentValues.filter(v => v !== gender)
                                  : [...currentValues, gender];
                                setFilters({ ...filters, gender: newValues });
                              }}
                            />
                            <Label htmlFor={`mobile-gender-${gender}`} className="font-body text-sm cursor-pointer capitalize">
                              {gender === 'men' ? 'Чоловіча' : gender === 'women' ? 'Жіноча' : 'Унісекс'}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Type */}
                  {availableTypes.length > 0 && (
                    <div>
                      <h3 className="font-body font-semibold mb-3">Тип</h3>
                      <div className="space-y-2">
                        {availableTypes.map(type => (
                          <div key={type} className="flex items-center gap-2">
                            <Checkbox
                              id={`mobile-type-${type}`}
                              checked={filters.type.includes(type)}
                              onCheckedChange={() => {
                                const currentValues = filters.type;
                                const newValues = currentValues.includes(type)
                                  ? currentValues.filter(v => v !== type)
                                  : [...currentValues, type];
                                setFilters({ ...filters, type: newValues });
                              }}
                            />
                            <Label htmlFor={`mobile-type-${type}`} className="font-body text-sm cursor-pointer capitalize">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Case Material */}
                  {availableCaseMaterials.length > 0 && (
                    <div>
                      <h3 className="font-body font-semibold mb-3">Матеріал корпусу</h3>
                      <div className="space-y-2">
                        {availableCaseMaterials.map(material => (
                          <div key={material} className="flex items-center gap-2">
                            <Checkbox
                              id={`mobile-material-${material}`}
                              checked={filters.caseMaterial.includes(material)}
                              onCheckedChange={() => {
                                const currentValues = filters.caseMaterial;
                                const newValues = currentValues.includes(material)
                                  ? currentValues.filter(v => v !== material)
                                  : [...currentValues, material];
                                setFilters({ ...filters, caseMaterial: newValues });
                              }}
                            />
                            <Label htmlFor={`mobile-material-${material}`} className="font-body text-sm cursor-pointer">
                              {material}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dial Color */}
                  {availableDialColors.length > 0 && (
                    <div>
                      <h3 className="font-body font-semibold mb-3">Колір циферблату</h3>
                      <div className="space-y-2">
                        {availableDialColors.map(color => (
                          <div key={color} className="flex items-center gap-2">
                            <Checkbox
                              id={`mobile-color-${color}`}
                              checked={filters.dialColor.includes(color)}
                              onCheckedChange={() => {
                                const currentValues = filters.dialColor;
                                const newValues = currentValues.includes(color)
                                  ? currentValues.filter(v => v !== color)
                                  : [...currentValues, color];
                                setFilters({ ...filters, dialColor: newValues });
                              }}
                            />
                            <Label htmlFor={`mobile-color-${color}`} className="font-body text-sm cursor-pointer">
                              {color}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

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

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-6 mb-12">
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
