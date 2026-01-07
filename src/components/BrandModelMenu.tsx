import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BrandWithImage {
  brand: string;
  image: string;
  productCount: number;
}

interface ModelSeriesWithImage {
  modelSeries: string;
  image: string;
  productCount: number;
}

interface BrandModelMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BrandModelMenu = ({ open, onOpenChange }: BrandModelMenuProps) => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<BrandWithImage[]>([]);
  const [modelSeries, setModelSeries] = useState<ModelSeriesWithImage[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchBrands();
    }
  }, [open]);

  useEffect(() => {
    if (selectedBrand) {
      fetchModelSeries(selectedBrand);
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      // Fetch all active products with their images
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, brand, created_at')
        .eq('is_active', true)
        .not('brand', 'is', null)
        .order('created_at', { ascending: true });

      if (productsError) throw productsError;

      // Get unique brands with the first product of each brand
      const brandMap = new Map<string, { productId: string; count: number }>();
      
      productsData?.forEach(product => {
        if (product.brand) {
          if (!brandMap.has(product.brand)) {
            brandMap.set(product.brand, { productId: product.id, count: 1 });
          } else {
            const existing = brandMap.get(product.brand)!;
            brandMap.set(product.brand, { ...existing, count: existing.count + 1 });
          }
        }
      });

      // Fetch primary images for the first products of each brand
      const productIds = Array.from(brandMap.values()).map(v => v.productId);
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .eq('is_primary', true)
        .in('product_id', productIds);

      const imageMap = new Map(imagesData?.map(img => [img.product_id, img.image_url]) || []);

      const brandsWithImages: BrandWithImage[] = Array.from(brandMap.entries()).map(([brand, data]) => ({
        brand,
        image: imageMap.get(data.productId) || '/placeholder.svg',
        productCount: data.count
      }));

      setBrands(brandsWithImages.sort((a, b) => a.brand.localeCompare(b.brand)));
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModelSeries = async (brand: string) => {
    setLoading(true);
    try {
      // Fetch products for this brand with model_series
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, model_series, created_at')
        .eq('is_active', true)
        .eq('brand', brand)
        .order('created_at', { ascending: true });

      if (productsError) throw productsError;

      // Group by model_series (including null as "Інші")
      const seriesMap = new Map<string, { productId: string; count: number }>();
      
      productsData?.forEach(product => {
        const series = product.model_series || 'Інші моделі';
        if (!seriesMap.has(series)) {
          seriesMap.set(series, { productId: product.id, count: 1 });
        } else {
          const existing = seriesMap.get(series)!;
          seriesMap.set(series, { ...existing, count: existing.count + 1 });
        }
      });

      // Fetch primary images
      const productIds = Array.from(seriesMap.values()).map(v => v.productId);
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .eq('is_primary', true)
        .in('product_id', productIds);

      const imageMap = new Map(imagesData?.map(img => [img.product_id, img.image_url]) || []);

      const seriesWithImages: ModelSeriesWithImage[] = Array.from(seriesMap.entries()).map(([series, data]) => ({
        modelSeries: series,
        image: imageMap.get(data.productId) || '/placeholder.svg',
        productCount: data.count
      }));

      // Sort with "Інші моделі" at the end
      setModelSeries(seriesWithImages.sort((a, b) => {
        if (a.modelSeries === 'Інші моделі') return 1;
        if (b.modelSeries === 'Інші моделі') return -1;
        return a.modelSeries.localeCompare(b.modelSeries);
      }));
    } catch (error) {
      console.error('Error fetching model series:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
  };

  const handleModelSeriesSelect = (series: string) => {
    // Navigate to main page with filters
    const params = new URLSearchParams();
    params.set('brand', selectedBrand || '');
    if (series !== 'Інші моделі') {
      params.set('modelSeries', series);
    }
    onOpenChange(false);
    setSelectedBrand(null);
    navigate(`/?${params.toString()}`);
  };

  const handleViewAllBrand = () => {
    const params = new URLSearchParams();
    params.set('brand', selectedBrand || '');
    onOpenChange(false);
    setSelectedBrand(null);
    navigate(`/?${params.toString()}`);
  };

  const handleBack = () => {
    setSelectedBrand(null);
    setModelSeries([]);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedBrand(null);
    setModelSeries([]);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="left" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center gap-2">
            {selectedBrand && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <SheetTitle className="text-lg font-display">
              {selectedBrand || 'Бренди'}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : selectedBrand ? (
            // Model Series List
            <div className="divide-y">
              {/* View All for this brand */}
              <button
                onClick={handleViewAllBrand}
                className="w-full flex items-center gap-4 p-4 hover:bg-accent/10 transition-colors"
              >
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">∀</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">Усі моделі {selectedBrand}</p>
                  <p className="text-sm text-muted-foreground">
                    {modelSeries.reduce((acc, s) => acc + s.productCount, 0)} годинників
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              {modelSeries.map((series) => (
                <button
                  key={series.modelSeries}
                  onClick={() => handleModelSeriesSelect(series.modelSeries)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-accent/10 transition-colors"
                >
                  <img
                    src={series.image}
                    alt={series.modelSeries}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium">{series.modelSeries}</p>
                    <p className="text-sm text-muted-foreground">{series.productCount} годинників</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          ) : (
            // Brands List
            <div className="divide-y">
              {brands.map((brand) => (
                <button
                  key={brand.brand}
                  onClick={() => handleBrandSelect(brand.brand)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-accent/10 transition-colors"
                >
                  <img
                    src={brand.image}
                    alt={brand.brand}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium">{brand.brand}</p>
                    <p className="text-sm text-muted-foreground">{brand.productCount} годинників</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}

              {brands.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Бренди не знайдено
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
