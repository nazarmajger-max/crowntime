import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';

interface BrandWithImage {
  name: string;
  image: string | null;
  count: number;
}

const BrandCatalog = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<BrandWithImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      // Fetch all active products to get brands
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, brand')
        .eq('is_active', true);

      if (productsError) throw productsError;

      // Group products by brand and count them
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

      // Fetch primary images for each brand (one image per brand)
      const brandsWithImages: BrandWithImage[] = [];
      
      for (const [brandName, data] of Object.entries(brandCounts)) {
        // Get the first product's primary image for this brand
        const { data: imageData } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('is_primary', true)
          .in('product_id', data.productIds)
          .limit(1)
          .single();

        brandsWithImages.push({
          name: brandName,
          image: imageData?.image_url || null,
          count: data.count
        });
      }

      // Sort brands alphabetically
      brandsWithImages.sort((a, b) => a.name.localeCompare(b.name));
      setBrands(brandsWithImages);
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      toast.error('Помилка завантаження брендів');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brandName: string) => {
    const params = new URLSearchParams();
    params.set('brand', brandName);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container px-4 py-6 md:py-10">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center">
            Каталог брендів
          </h1>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : brands.length === 0 ? (
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
                    {brand.count} {brand.count === 1 ? 'модель' : brand.count < 5 ? 'моделі' : 'моделей'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BrandCatalog;
