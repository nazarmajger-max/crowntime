import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X } from 'lucide-react';
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
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, brand, created_at')
        .eq('is_active', true)
        .not('brand', 'is', null)
        .order('created_at', { ascending: true });

      if (productsError) throw productsError;

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
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, model_series, created_at')
        .eq('is_active', true)
        .eq('brand', brand)
        .order('created_at', { ascending: true });

      if (productsError) throw productsError;

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
    const params = new URLSearchParams();
    params.set('brand', selectedBrand || '');
    if (series !== 'Інші моделі') {
      params.set('modelSeries', series);
    }
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
      <SheetContent side="left" className="w-full sm:w-[450px] p-0">
        <SheetHeader className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedBrand && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBack}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <SheetTitle className="text-lg font-display uppercase tracking-wide">
                {selectedBrand || 'Бренди'}
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>

        <div className="overflow-y-auto h-[calc(100vh-80px)] p-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : selectedBrand ? (
            // Model Series Grid
            <div className="grid grid-cols-2 gap-3">
              {modelSeries.map((series) => (
                <button
                  key={series.modelSeries}
                  onClick={() => handleModelSeriesSelect(series.modelSeries)}
                  className="group flex flex-col bg-muted/30 rounded-xl overflow-hidden hover:bg-muted/50 transition-colors border border-border/50"
                >
                  <div className="aspect-square p-4 flex items-center justify-center bg-white">
                    <img
                      src={series.image}
                      alt={series.modelSeries}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="font-semibold text-sm uppercase tracking-wide">{series.modelSeries}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Brands Grid
            <div className="grid grid-cols-2 gap-3">
              {brands.map((brand) => (
                <button
                  key={brand.brand}
                  onClick={() => handleBrandSelect(brand.brand)}
                  className="group flex flex-col bg-muted/30 rounded-xl overflow-hidden hover:bg-muted/50 transition-colors border border-border/50"
                >
                  <div className="aspect-square p-4 flex items-center justify-center bg-white">
                    <img
                      src={brand.image}
                      alt={brand.brand}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="font-semibold text-sm uppercase tracking-wide">{brand.brand}</p>
                  </div>
                </button>
              ))}

              {brands.length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
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
