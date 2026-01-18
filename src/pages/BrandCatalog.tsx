import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

interface BrandWithImage {
  name: string;
  image: string | null;
  count: number;
}

interface ModelSeriesWithImage {
  name: string;
  image: string | null;
  count: number;
}

const BrandCatalog = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<BrandWithImage[]>([]);
  const [modelSeries, setModelSeries] = useState<ModelSeriesWithImage[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchModelSeries(selectedBrand);
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, brand')
        .eq('is_active', true);

      if (productsError) throw productsError;

      const brandCounts: { [key: string]: { count: number; productIds: string[] } } = {};
      productsData?.forEach(product => {
        if (product.brand) {
          if (!brandCounts[product.brand]) {
            brandCounts[product.brand] = { count: 0, productIds: [] };
          }
          brandCounts[product.brand].count++;
          brandCounts[product.brand].productIds.push(product.id);
        }
      });

      // Get brand images from the dedicated table
      const { data: brandImagesData } = await supabase
        .from('brand_images')
        .select('brand_name, image_url');

      const brandImagesMap: { [key: string]: string } = {};
      brandImagesData?.forEach(img => {
        brandImagesMap[img.brand_name] = img.image_url;
      });

      const brandsWithImages: BrandWithImage[] = [];
      
      for (const [brandName, data] of Object.entries(brandCounts)) {
        let imageUrl = brandImagesMap[brandName] || null;

        // Fallback to product image if no brand image set
        if (!imageUrl) {
          const { data: imageData } = await supabase
            .from('product_images')
            .select('image_url')
            .eq('is_primary', true)
            .in('product_id', data.productIds)
            .limit(1)
            .single();
          imageUrl = imageData?.image_url || null;
        }

        brandsWithImages.push({
          name: brandName,
          image: imageUrl,
          count: data.count
        });
      }

      brandsWithImages.sort((a, b) => a.name.localeCompare(b.name));
      setBrands(brandsWithImages);
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      toast.error('Помилка завантаження брендів');
    } finally {
      setLoading(false);
    }
  };

  const fetchModelSeries = async (brand: string) => {
    setLoading(true);
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, model_series')
        .eq('is_active', true)
        .eq('brand', brand);

      if (productsError) throw productsError;

      const seriesCounts: { [key: string]: { count: number; productIds: string[] } } = {};
      productsData?.forEach(product => {
        const series = product.model_series || 'Інші моделі';
        if (!seriesCounts[series]) {
          seriesCounts[series] = { count: 0, productIds: [] };
        }
        seriesCounts[series].count++;
        seriesCounts[series].productIds.push(product.id);
      });

      // Get model series images from the dedicated table
      const { data: seriesImagesData } = await supabase
        .from('model_series_images')
        .select('model_series_name, image_url')
        .eq('brand_name', brand);

      const seriesImagesMap: { [key: string]: string } = {};
      seriesImagesData?.forEach(img => {
        seriesImagesMap[img.model_series_name] = img.image_url;
      });

      const seriesWithImages: ModelSeriesWithImage[] = [];
      
      for (const [seriesName, data] of Object.entries(seriesCounts)) {
        let imageUrl = seriesImagesMap[seriesName] || null;

        // Fallback to product image if no series image set
        if (!imageUrl) {
          const { data: imageData } = await supabase
            .from('product_images')
            .select('image_url')
            .eq('is_primary', true)
            .in('product_id', data.productIds)
            .limit(1)
            .single();
          imageUrl = imageData?.image_url || null;
        }

        seriesWithImages.push({
          name: seriesName,
          image: imageUrl,
          count: data.count
        });
      }

      // Sort with "Інші моделі" at the end
      seriesWithImages.sort((a, b) => {
        if (a.name === 'Інші моделі') return 1;
        if (b.name === 'Інші моделі') return -1;
        return a.name.localeCompare(b.name);
      });
      setModelSeries(seriesWithImages);
    } catch (error: any) {
      console.error('Error fetching model series:', error);
      toast.error('Помилка завантаження серій моделей');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brandName: string) => {
    setSelectedBrand(brandName);
  };

  const handleModelSeriesClick = (seriesName: string) => {
    const params = new URLSearchParams();
    params.set('brand', selectedBrand || '');
    if (seriesName !== 'Інші моделі') {
      params.set('modelSeries', seriesName);
    }
    navigate(`/products?${params.toString()}`);
  };

  const handleBack = () => {
    setSelectedBrand(null);
    setModelSeries([]);
  };

  const getCountText = (count: number) => {
    if (count === 1) return 'модель';
    if (count >= 2 && count <= 4) return 'моделі';
    return 'моделей';
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container px-4 py-6 md:py-10">
          {/* Header with back button */}
          <div className="flex items-center justify-center mb-6 md:mb-8 relative">
            {selectedBrand && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="absolute left-0 h-10 w-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-bold text-center">
              {selectedBrand || 'Каталог брендів'}
            </h1>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : selectedBrand ? (
            // Model Series Grid
            modelSeries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Серії моделей не знайдено</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {modelSeries.map((series) => (
                  <button
                    key={series.name}
                    onClick={() => handleModelSeriesClick(series.name)}
                    className="group bg-card border border-border rounded-lg p-4 md:p-6 hover:border-accent/50 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-square mb-3 md:mb-4 flex items-center justify-center overflow-hidden">
                      {series.image ? (
                        <img
                          src={series.image}
                          alt={series.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">Немає фото</span>
                        </div>
                      )}
                    </div>
                    <h2 className="font-display text-sm md:text-base font-semibold text-foreground group-hover:text-accent transition-colors uppercase">
                      {series.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {series.count} {getCountText(series.count)}
                    </p>
                  </button>
                ))}
              </div>
            )
          ) : (
            // Brands Grid
            brands.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Бренди не знайдено</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {brands.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => handleBrandClick(brand.name)}
                    className="group bg-card border border-border rounded-lg p-4 md:p-6 hover:border-accent/50 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-square mb-3 md:mb-4 flex items-center justify-center overflow-hidden">
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">Немає фото</span>
                        </div>
                      )}
                    </div>
                    <h2 className="font-display text-sm md:text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                      {brand.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {brand.count} {getCountText(brand.count)}
                    </p>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BrandCatalog;
