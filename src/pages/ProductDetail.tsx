import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Check, X, ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '@/types/product';
interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}
const ProductDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    addToCart
  } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchProductImages(id);
      fetchReviews(id);
    }
  }, [id]);
  const fetchProductImages = async (productId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('product_images' as any).select('*').eq('product_id', productId).order('position');
      if (error) throw error;
      if (data && data.length > 0) {
        setProductImages(data.map((img: any) => img.image_url));
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
    }
  };
  const fetchReviews = async (productId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('reviews').select(`
          id,
          user_id,
          rating,
          comment,
          created_at,
          profiles!reviews_user_id_fkey (
            full_name,
            email
          )
        `).eq('product_id', productId).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setReviews(data as any || []);
      if (data && data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };
  const fetchProduct = async (productId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from('products').select('*').eq('id', productId).single();
      if (error) throw error;
      if (data) {
        const gender = (data.gender?.toLowerCase() || 'unisex') as 'men' | 'women' | 'unisex';
        const type = (data.category?.toLowerCase() || 'analog') as Product['type'];
        const validTypes = ['analog', 'digital', 'sport', 'luxury', 'dress', 'dive'];
        const formattedProduct: Product = {
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
          modelCode: data.model_code
        };
        setProduct(formattedProduct);
      }
    } catch (error) {
      console.error('Помилка завантаження товару:', error);
      toast.error('Не вдалося завантажити товар');
    } finally {
      setLoading(false);
    }
  };
  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      toast.success(`${product.name} додано до кошика`);
    }
  };
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };
  if (loading) {
    return <>
        <Header />
        <div className="container mx-auto px-6 py-12 flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>;
  }
  if (!product) {
    return <>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-display mb-4">Товар не знайдено</h1>
          <Button onClick={() => navigate('/')}>Повернутися до каталогу</Button>
        </div>
        <Footer />
      </>;
  }
  const specifications = [{
    label: 'Стать',
    value: product.gender === 'men' ? 'Чоловіча' : product.gender === 'women' ? 'Жіноча' : 'Унісекс'
  }, {
    label: 'Скло',
    value: product.glassType
  }, {
    label: 'Діаметр',
    value: product.diameter
  }, {
    label: 'Тип механізму',
    value: product.movement
  }, {
    label: 'Підсвічування',
    value: product.illumination
  }, {
    label: 'Тип циферблату',
    value: product.dialType
  }, {
    label: 'Колір корпусу',
    value: product.caseColor
  }, {
    label: 'Бренд',
    value: product.brand
  }, {
    label: 'Індикація дати',
    value: product.dateIndication ? 'Є' : 'Немає'
  }, {
    label: 'Тип',
    value: product.category
  }, {
    label: 'Індикація дня тижня',
    value: product.dayIndication ? 'Є' : 'Немає'
  }, {
    label: 'Стиль',
    value: product.watchStyle
  }, {
    label: 'Тип індикації',
    value: product.indicationType
  }, {
    label: 'Матеріал корпусу',
    value: product.caseMaterial
  }, {
    label: 'Матеріал браслета/ремінця',
    value: product.strapMaterial
  }, {
    label: 'Колір циферблату',
    value: product.dialColor
  }, {
    label: 'Форма корпусу',
    value: product.caseShape
  }, {
    label: 'Водозахист',
    value: product.waterResistance
  }, {
    label: 'Колір браслета/ремінця',
    value: product.strapColor
  }].filter(spec => spec.value);
  return <>
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="text-sm font-body text-muted-foreground mb-6">
          <span className="cursor-pointer hover:text-foreground" onClick={() => navigate('/')}>Головна</span>
          {' / '}
          <span className="cursor-pointer hover:text-foreground">{product.category}</span>
          {' / '}
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {productImages.length > 0 ? <>
                <Carousel className="w-full">
                  <CarouselContent>
                    {productImages.map((image, index) => <CarouselItem key={index}>
                        <div className="aspect-square overflow-hidden rounded-lg bg-muted border">
                          <img src={image} alt={`${product.name} - ${index + 1}`} className="h-full w-full object-cover" />
                        </div>
                      </CarouselItem>)}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
                
                {/* Thumbnails */}
                <div className="grid grid-cols-5 gap-2">
                  {productImages.map((image, index) => <button key={index} onClick={() => setSelectedImage(index)} className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${selectedImage === index ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}>
                      <img src={image} alt={`${product.name} - thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                    </button>)}
                </div>
              </> : <div className="aspect-square overflow-hidden rounded-lg bg-muted border">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              </div>}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground font-body mb-2">
                Бренд: <span className="text-primary font-medium">{product.brand}</span>
              </p>
              {product.modelCode && <p className="text-sm text-muted-foreground font-body mb-2">
                  Модель: {product.modelCode}
                </p>}
              <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                {product.name}
              </h1>
            </div>

            <div className="text-4xl font-bold text-accent font-display">
              {product.price.toLocaleString()} ₴
            </div>

            <div className="flex items-center gap-2 text-sm font-body">
              {product.inStock ? <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">Доставка 1-2 дні по Україні</span>
                </> : <>
                  <X className="h-5 w-5 text-destructive" />
                  <span className="text-destructive">Немає в наявності</span>
                </>}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  -
                </Button>
                <span className="px-6 py-2 font-body">{quantity}</span>
                <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(1)} disabled={quantity >= 10}>
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleAddToCart} disabled={!product.inStock} className="flex-1 font-body font-medium text-lg py-6" size="lg">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Купити
              </Button>
              <Button variant="outline" size="lg" className="py-6">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8">
            <TabsTrigger value="description" className="font-body">Про товар</TabsTrigger>
            <TabsTrigger value="specifications" className="font-body">Характеристики</TabsTrigger>
            <TabsTrigger value="reviews" className="font-body">Відгуки</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4">
            <div className="prose max-w-none font-body">
              <p className="text-foreground/80 leading-relaxed">
                {product.description || 'Опис товару відсутній.'}
              </p>
              
              <div className="mt-6 space-y-3">
                <h3 className="font-display text-xl font-semibold">Купуючи в WATCHZONE Ви отримуєте:</h3>
                <ul className="space-y-2">
                  <li>✓ <strong>Професійне обслуговування</strong> (Наші менеджери завжди готові допомогти у виборі)</li>
                  
                  <li>✓ <strong>Доступну ціну</strong></li>
                  <li>✓ <strong>Величезний асортимент</strong> товарів</li>
                  <li>✓ <strong>Можливість повернення або обміну</strong>, якщо замовлення не підійшло</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="space-y-4">
            <h3 className="font-display text-2xl font-semibold mb-6">Характеристики</h3>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              {specifications.map((spec, index) => <div key={index} className="flex justify-between py-3 border-b font-body">
                  <span className="text-muted-foreground">{spec.label}:</span>
                  <span className="font-medium">{spec.value}</span>
                </div>)}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="mb-6">
              <h3 className="font-display text-2xl font-semibold mb-4">
                Відгуки ({reviews.length})
                {reviews.length > 0 && <span className="ml-3 text-lg text-muted-foreground">
                    <Star className="inline h-5 w-5 fill-yellow-400 text-yellow-400 mb-1" />
                    {averageRating.toFixed(1)}
                  </span>}
              </h3>
            </div>
            
            {reviews.length === 0 ? <div className="text-center py-12">
                <p className="text-muted-foreground font-body">Відгуків ще немає 😔</p>
                <p className="text-sm text-muted-foreground mt-2 font-body">
                  Будьте першим, хто залишить відгук про цей товар!
                </p>
              </div> : <div className="space-y-4">
                {reviews.map(review => <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium font-body">
                            {review.profiles?.full_name || review.profiles?.email || 'Анонімний користувач'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('uk-UA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />)}
                        </div>
                      </div>
                      {review.comment && <p className="text-foreground/80 font-body">{review.comment}</p>}
                    </CardContent>
                  </Card>)}
              </div>}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </>;
};
export default ProductDetail;