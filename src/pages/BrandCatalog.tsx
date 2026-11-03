import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft, ShieldCheck, BadgeCheck, Truck, RotateCcw } from 'lucide-react';
import heroWatch from '@/assets/hero-watch.jpg';

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

      // Custom sort: Casio first, then Tissot, then alphabetically
      brandsWithImages.sort((a, b) => {
        const priorityOrder = ['Casio', 'Tissot'];
        const aIndex = priorityOrder.indexOf(a.name);
        const bIndex = priorityOrder.indexOf(b.name);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
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
        {!selectedBrand && (
          <>
            <section className="relative flex min-h-[78svh] items-end overflow-hidden bg-forest text-forest-foreground md:min-h-[88svh]">
              <img src={heroWatch} alt="Наручний годинник на лляній тканині" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/30 to-transparent md:bg-gradient-to-r md:from-forest/80 md:via-forest/25 md:to-transparent" aria-hidden="true" />
              <div className="relative container px-6 pb-16 pt-32 md:pb-24">
                <p className="eyebrow animate-fade-in">CrownTime</p>
                <h1 className="mt-4 max-w-xl font-display text-5xl md:text-7xl font-normal leading-[1.02] animate-fade-in">
                  Час, який варто носити
                </h1>
                <p className="mt-6 max-w-md text-base leading-relaxed text-forest-foreground/85 md:text-lg">Оригінальні наручні годинники світових брендів із гарантією та доставкою по Україні.</p>
                <Button asChild size="lg" className="mt-10 rounded-none bg-gold px-10 text-ink transition-colors duration-700 hover:bg-forest-foreground">
                  <a href="#catalog">Дивитися колекцію</a>
                </Button>
              </div>
            </section>
            <section aria-label="Наші гарантії" className="border-b">
              <ul className="container px-6 grid grid-cols-2 md:grid-cols-4">
                {[
                  { icon: BadgeCheck, t: 'Оригінал', d: 'Лише сертифіковані годинники' },
                  { icon: ShieldCheck, t: 'Гарантія', d: 'Офіційна гарантія виробника' },
                  { icon: Truck, t: 'Доставка по Україні', d: '1–2 дні Новою поштою' },
                  { icon: RotateCcw, t: 'Повернення', d: 'Протягом 14 днів' },
                ].map(({ icon: Icon, t, d }, i) => (
                  <li key={t} className={`py-8 md:py-10 px-2 md:px-6 flex flex-col items-center text-center gap-2 ${i % 2 ? 'border-l' : 'md:border-l md:first:border-l-0'} ${i < 2 ? 'border-b md:border-b-0' : ''}`}>
                    <Icon className="h-5 w-5 text-gold-deep" strokeWidth={1.25} aria-hidden="true" />
                    <p className="font-display text-lg">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
        <div id="catalog" className="container px-4 py-14 md:py-24 scroll-mt-16">
          {/* Header with back button */}
          <div className="flex items-center justify-center mb-6 md:mb-8 relative">
            {selectedBrand && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                 aria-label="Назад до брендів"
                className="absolute left-0 h-10 w-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            <h2 className="font-display text-3xl md:text-5xl font-normal text-center">
              {selectedBrand || 'Каталог годинників'}
            </h2>
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
                {modelSeries.map((series) => (
                  <button
                    key={series.name}
                    onClick={() => handleModelSeriesClick(series.name)}
                    className="group flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-[4/5] mb-4 p-6 md:p-10 bg-stone flex items-center justify-center overflow-hidden">
                      {series.image ? (
                        <img
                          src={series.image}
                          alt={series.name}
                          className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-1200 ease-lux"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">Немає фото</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-display text-lg md:text-2xl text-foreground link-underline">
                      {series.name}
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-1.5">
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
                {brands.map((brand) => (
                  <button
                    key={brand.name}
                    onClick={() => handleBrandClick(brand.name)}
                    className="group flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-[4/5] mb-4 p-6 md:p-10 bg-stone flex items-center justify-center overflow-hidden">
                      {brand.image ? (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-1200 ease-lux"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                          <span className="text-muted-foreground text-xs">Немає фото</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-display text-lg md:text-2xl text-foreground link-underline">
                      {brand.name}
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mt-1.5">
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
