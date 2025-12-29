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
import { Check, X, ShoppingCart, Heart, Star, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/types/product';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name?: string | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      fetchProductImages(id);
      fetchReviews(id);
      if (user) {
        checkIfFavorite(id);
      }
    }
  }, [id, user]);

  const fetchProductImages = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('sort_order');

      if (error) throw error;
      if (data && data.length > 0) {
        setProductImages(data.map((img) => img.image_url));
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching product images:', error);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, user_id, rating, comment, created_at')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Fetch profile names for all reviewers
        const userIds = [...new Set(data.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('public_profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);
        
        const reviewsWithNames: Review[] = data.map(review => ({
          ...review,
          user_name: profileMap.get(review.user_id) || null,
        }));
        
        setReviews(reviewsWithNames);
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setReviews([]);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching reviews:', error);
    }
  };

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      if (data) {
        const gender = (data.gender?.toLowerCase() || 'unisex') as 'men' | 'women' | 'unisex';
        const validTypes = ['analog', 'digital', 'sport', 'luxury', 'dress', 'dive'];
        const type = validTypes.includes(data.movement_type?.toLowerCase() || '')
          ? data.movement_type?.toLowerCase() as Product['type']
          : 'analog';

        // Fetch primary image
        const { data: imageData } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', productId)
          .eq('is_primary', true)
          .maybeSingle();

        const formattedProduct: Product = {
          id: data.id,
          name: data.name,
          brand: data.brand || '',
          price: Number(data.price),
          description: data.description || '',
          image: imageData?.image_url || '/placeholder.svg',
          category: data.movement_type || 'Analog',
          gender: ['men', 'women', 'unisex'].includes(gender) ? gender : 'unisex',
          type: type,
          caseMaterial: data.case_material || 'Сталь',
          dialColor: data.dial_color || 'Чорний',
          waterResistance: data.water_resistance || '50m',
          movement: data.movement_type || 'Автоматичний',
          inStock: data.stock_quantity > 0,
          diameter: data.case_diameter || undefined,
        };
        setProduct(formattedProduct);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Помилка завантаження товару:', error);
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

  const checkIfFavorite = async (productId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Увійдіть, щоб додати товар до обраного');
      navigate('/auth');
      return;
    }

    if (!product) return;

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;
        setIsFavorite(false);
        toast.success('Видалено з обраного');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: product.id });

        if (error) throw error;
        setIsFavorite(true);
        toast.success('Додано до обраного');
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error toggling favorite:', error);
      toast.error('Помилка при додаванні до обраного');
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Увійдіть, щоб залишити відгук');
      navigate('/auth');
      return;
    }

    if (!product) return;

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: product.id,
          rating: reviewRating,
          comment: reviewComment.trim() || null,
        });

      if (error) throw error;

      toast.success('Відгук успішно додано');
      setReviewComment('');
      setReviewRating(5);
      fetchReviews(product.id);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error submitting review:', error);
      toast.error('Помилка при додаванні відгуку');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Відгук видалено');
      if (product) {
        fetchReviews(product.id);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting review:', error);
      toast.error('Помилка при видаленні відгуку');
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

  if (!product) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-display mb-4">Товар не знайдено</h1>
          <Button onClick={() => navigate('/')}>Повернутися до каталогу</Button>
        </div>
        <Footer />
      </>
    );
  }

  const specifications = [
    { label: 'Стать', value: product.gender === 'men' ? 'Чоловіча' : product.gender === 'women' ? 'Жіноча' : 'Унісекс' },
    { label: 'Діаметр', value: product.diameter },
    { label: 'Тип механізму', value: product.movement },
    { label: 'Бренд', value: product.brand },
    { label: 'Тип', value: product.category },
    { label: 'Матеріал корпусу', value: product.caseMaterial },
    { label: 'Колір циферблату', value: product.dialColor },
    { label: 'Водозахист', value: product.waterResistance },
  ].filter(spec => spec.value);

  return (
    <>
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
            {productImages.length > 0 ? (
              <>
                <Carousel className="w-full">
                  <CarouselContent>
                    {productImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-square overflow-hidden rounded-lg bg-muted border">
                          <img src={image} alt={`${product.name} - ${index + 1}`} className="h-full w-full object-cover" />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
                
                {/* Thumbnails */}
                <div className="grid grid-cols-5 gap-2">
                  {productImages.map((image, index) => (
                    <button 
                      key={index} 
                      onClick={() => setSelectedImage(index)} 
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${selectedImage === index ? 'border-primary' : 'border-transparent hover:border-primary/50'}`}
                    >
                      <img src={image} alt={`${product.name} - thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="aspect-square overflow-hidden rounded-lg bg-muted border">
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground font-body mb-2">
                Бренд: <span className="text-primary font-medium">{product.brand}</span>
              </p>
              <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                {product.name}
              </h1>
            </div>

            <div className="text-4xl font-bold text-accent font-display">
              {product.price.toLocaleString()} ₴
            </div>

            <div className="flex items-center gap-2 text-sm font-body">
              {product.inStock ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">Доставка 1-2 дні по Україні</span>
                </>
              ) : (
                <>
                  <X className="h-5 w-5 text-destructive" />
                  <span className="text-destructive">Немає в наявності</span>
                </>
              )}
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
              <Button 
                variant="outline" 
                size="lg" 
                className="py-6"
                onClick={toggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="specifications" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-8 h-auto">
            <TabsTrigger value="specifications" className="font-body text-xs sm:text-sm py-2 sm:py-2.5">Характеристики</TabsTrigger>
            <TabsTrigger value="description" className="font-body text-xs sm:text-sm py-2 sm:py-2.5">Про товар</TabsTrigger>
            <TabsTrigger value="reviews" className="font-body text-xs sm:text-sm py-2 sm:py-2.5">Відгуки</TabsTrigger>
          </TabsList>

          <TabsContent value="specifications" className="space-y-4">
            <h3 className="font-display text-2xl font-semibold mb-6">Характеристики</h3>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
              {specifications.map((spec, index) => (
                <div key={index} className="flex justify-between py-3 border-b font-body">
                  <span className="text-muted-foreground">{spec.label}:</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="description" className="space-y-4">
            <div className="prose max-w-none font-body">
              <p className="text-foreground/80 leading-relaxed">
                {product.description || 'Опис товару відсутній.'}
              </p>
              
              <div className="mt-6 space-y-3">
                <h3 className="font-display text-xl font-semibold">Купуючи в CrownTime Ви отримуєте:</h3>
                <ul className="space-y-2">
                  <li>✓ <strong>Професійне обслуговування</strong></li>
                  <li>✓ <strong>Доступну ціну</strong></li>
                  <li>✓ <strong>Гарантію якості</strong></li>
                  <li>✓ <strong>Швидку доставку по Україні</strong></li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Відгуки</h3>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{averageRating}</span>
                  <span className="text-muted-foreground">({reviews.length} відгуків)</span>
                </div>
              )}
            </div>

            {/* Add Review Form */}
            {user && (
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-4">Залишити відгук</h4>
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)}>
                          <Star 
                            className={`h-6 w-6 cursor-pointer ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Ваш коментар (необов'язково)..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                    <Button onClick={handleSubmitReview} disabled={submittingReview}>
                      <Send className="mr-2 h-4 w-4" />
                      {submittingReview ? 'Відправка...' : 'Опублікувати'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground">Поки немає відгуків. Будьте першим!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{review.user_name || 'Анонім'}</p>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('uk-UA')}
                          </span>
                          {user?.id === review.user_id && (
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteReview(review.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-muted-foreground">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetail;
