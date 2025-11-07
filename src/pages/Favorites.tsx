import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/product';
import { toast } from 'sonner';

const Favorites = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (favError) throw favError;

      if (!favorites || favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const productIds = favorites.map(fav => fav.product_id);

      const { data: productsData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (prodError) throw prodError;

      const formattedProducts: Product[] = productsData.map((data: any) => {
        const gender = (data.gender?.toLowerCase() || 'unisex') as 'men' | 'women' | 'unisex';
        const type = (data.category?.toLowerCase() || 'analog') as Product['type'];
        const validTypes = ['analog', 'digital', 'sport', 'luxury', 'dress', 'dive'];

        return {
          id: data.id,
          name: data.name,
          brand: data.brand,
          price: Number(data.price),
          description: data.description || '',
          image: data.image_url,
          category: data.category,
          gender: ['men', 'women', 'unisex'].includes(gender) ? gender : 'unisex',
          type: validTypes.includes(type) ? type : 'analog',
          caseMaterial: data.case_material || 'Сталь',
          dialColor: data.dial_color || 'Чорний',
          waterResistance: data.water_resistance || '50m',
          movement: data.movement_type || 'Автоматичний',
          inStock: data.in_stock,
          glassType: data.glass_type,
          diameter: data.diameter,
          illumination: data.illumination,
          dialType: data.dial_type,
          caseColor: data.case_color,
          dateIndication: data.date_indication,
          dayIndication: data.day_indication,
          watchStyle: data.watch_style,
          indicationType: data.indication_type,
          caseShape: data.case_shape,
          strapMaterial: data.strap_material,
          strapColor: data.strap_color,
          modelCode: data.model_code,
        };
      });

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Помилка при завантаженні обраного');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-6 py-12 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-12">
        <h1 className="font-display text-3xl lg:text-4xl font-bold mb-8">
          Обране
        </h1>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              У вас ще немає обраних товарів
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-accent hover:underline"
            >
              Перейти до каталогу
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Favorites;
