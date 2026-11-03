import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Check, X, Heart, Star, Send, Trash2, ShieldCheck, Truck, RotateCcw, Minus, Plus, ShoppingCart } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
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
  const [similar, setSimilar] = useState<Product[]>([]);

  useEffect(() => {
    if (!product) return;
    const loadSimilar = async () => {
      let q = supabase.from('products').select('*').eq('is_active', true).neq('id', product.id).limit(4);
      if (product.brand) q = q.eq('brand', product.brand);
      const { data } = await q;
      const ids = (data || []).map(p => p.id);
      if (!ids.length) { setSimilar([]); return; }
      const { data: imgs } = await supabase.from('product_images').select('product_id, image_url, is_primary, sort_order').in('product_id', ids).order('sort_order');
      const main = new Map<string, string>(); const hover = new Map<string, string>();
      [...(imgs || [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary)).forEach(i => {
        if (!main.has(i.product_id)) main.set(i.product_id, i.image_url);
        else if (!hover.has(i.product_id)) hover.set(i.product_id, i.image_url);
      });
      setSimilar((data || []).map(p => ({
        id: p.id, name: p.name, brand: p.brand || '', price: Number(p.price), description: p.description || '',
        image: main.get(p.id) || '/placeholder.svg', hoverImage: hover.get(p.id),
        category: p.movement_type || '', gender: 'unisex', type: 'analog', caseMaterial: p.case_material || '',
        dialColor: p.dial_color || '', waterResistance: p.water_resistance || '', movement: p.movement_type || '',
        inStock: p.stock_quantity > 0,
      })));
    };
    loadSimilar();
  }, [product]);

  useEffect(() => {
    if (id) {
      setSelectedImage(0);
      setProductImages([]);
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
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav aria-label="Навігація" className="eyebrow mb-8">
          <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => navigate('/')}>Головна</Button>
          {' / '}
          <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground" onClick={() => navigate(`/products?brand=${encodeURIComponent(product.brand)}`)}>{product.brand}</Button>
          {' / '}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 mb-20">
          {/* Gallery */}
          <div className="flex flex-col-reverse gap-4">
            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3" aria-label="Фото товару">
                {productImages.map((image, index) => (
                  <Button variant="ghost"
                    key={index}
                    aria-pressed={selectedImage === index}
                    aria-label={`Фото ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square h-auto w-full p-0 rounded-none overflow-hidden bg-stone border transition-colors duration-700 ${selectedImage === index ? 'border-gold' : 'border-transparent hover:border-foreground/40'}`}
                  >
                    <img src={image} alt="" className="h-full w-full object-contain p-1 mix-blend-multiply" />
                  </Button>
                ))}
              </div>
            )}
            <div className="w-full aspect-[4/5] bg-stone overflow-hidden">
              <img
                key={selectedImage}
                src={productImages[selectedImage] || product.image}
                alt={product.name}
                className="h-full w-full object-contain p-8 md:p-14 mix-blend-multiply animate-fade-in"
              />
            </div>
          </div>

          {/* Info */}
          <div className="md:pt-4 space-y-8">
            <div>
              <p className="eyebrow">{product.brand}</p>
              <h1 className="mt-3 font-display text-3xl md:text-5xl font-normal leading-tight">{product.name}</h1>
              <p className="mt-6 font-display text-3xl text-foreground tabular-nums">{product.price.toLocaleString('uk-UA')} ₴</p>
            </div>

            <p className={`flex items-center gap-2 text-sm ${product.inStock ? 'text-foreground' : 'text-destructive'}`}>
              {product.inStock ? <Check className="h-4 w-4 text-gold-deep" aria-hidden="true" /> : <X className="h-4 w-4" aria-hidden="true" />}
              {product.inStock ? 'В наявності' : 'Немає в наявності'}
            </p>

            <div className="flex flex-wrap items-stretch gap-3">
              <div className="flex items-center border" role="group" aria-label="Кількість">
                <Button variant="ghost" size="icon" className="rounded-none h-12 w-12" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} aria-label="Зменшити кількість"><Minus className="h-4 w-4" /></Button>
                <span className="w-10 text-center tabular-nums" aria-live="polite">{quantity}</span>
                <Button variant="ghost" size="icon" className="rounded-none h-12 w-12" onClick={() => handleQuantityChange(1)} disabled={quantity >= 10} aria-label="Збільшити кількість"><Plus className="h-4 w-4" /></Button>
              </div>
              <Button onClick={handleAddToCart} disabled={!product.inStock} className="h-12 min-w-28 flex-1 rounded-none text-sm uppercase tracking-[0.15em]" size="lg"><ShoppingCart className="mr-3 h-4 w-4" />Купити</Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-none" onClick={toggleFavorite} aria-label={isFavorite ? 'Видалити з обраного' : 'Додати до обраного'} aria-pressed={isFavorite}>
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-gold text-gold' : ''}`} strokeWidth={1.25} />
              </Button>
            </div>

            <ul className="border-t divide-y text-sm">
              <li className="flex items-start gap-4 py-4"><ShieldCheck className="h-5 w-5 mt-0.5 text-gold-deep" strokeWidth={1.25} /><div><p>Гарантія</p><p className="text-muted-foreground text-xs mt-1">Офіційна гарантія виробника, оригінал</p></div></li>
              <li className="flex items-start gap-4 py-4"><Truck className="h-5 w-5 mt-0.5 text-gold-deep" strokeWidth={1.25} /><div><p>Доставка по Україні</p><p className="text-muted-foreground text-xs mt-1">1–2 дні, оплата при отриманні</p></div></li>
              <li className="flex items-start gap-4 py-4"><RotateCcw className="h-5 w-5 mt-0.5 text-gold-deep" strokeWidth={1.25} /><div><p>Повернення</p><p className="text-muted-foreground text-xs mt-1">Протягом 14 днів</p></div></li>
            </ul>
          </div>
        </div>

        <section aria-labelledby="specs-title" className="mb-20 max-w-3xl">
          <h2 id="specs-title" className="mb-6 font-display text-3xl md:text-4xl">Характеристики</h2>
          <dl className="border-t">
            {specifications.map(spec => (
              <div key={spec.label} className="flex justify-between gap-6 border-b py-4">
                <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                <dd className="text-right text-sm">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Tabs Section */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full max-w-md grid grid-cols-2 mb-10 h-auto bg-transparent border-b rounded-none p-0">
            <TabsTrigger value="description" className="rounded-none text-[11px] uppercase tracking-[0.2em] py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b data-[state=active]:border-foreground -mb-px">Про товар</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none text-[11px] uppercase tracking-[0.2em] py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b data-[state=active]:border-foreground -mb-px">Відгуки</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4">
            <div className="prose max-w-none font-body">
              <p className="text-foreground/80 leading-relaxed">
                {product.description || 'Опис товару відсутній.'}
              </p>
              
              <div className="mt-6 space-y-3">
                <h3 className="font-display text-xl font-semibold">Купуючи в CrownTime Ви отримуєте:</h3>
                <ul className="space-y-2">
                  {['Професійне обслуговування', 'Доступну ціну', 'Гарантію якості', 'Швидку доставку по Україні'].map(text => <li key={text} className="flex items-center gap-3"><Check className="h-4 w-4 text-gold-deep" aria-hidden="true" />{text}</li>)}
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold">Відгуки</h3>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-gold text-gold" />
                  <span className="font-bold">{averageRating}</span>
                  <span className="text-muted-foreground">({reviews.length} відгуків)</span>
                </div>
              )}
            </div>

            {/* Add Review Form */}
            {user && (
              <Card className="rounded-none shadow-none">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-4">Залишити відгук</h4>
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)}>
                          <Star 
                            className={`h-6 w-6 cursor-pointer ${star <= reviewRating ? 'fill-gold text-gold' : 'text-muted-foreground'}`} 
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
                  <Card key={review.id} className="rounded-none shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{review.user_name || 'Анонім'}</p>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${star <= review.rating ? 'fill-gold text-gold' : 'text-muted-foreground'}`} 
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

        {similar.length > 0 && (
          <section className="mt-24 border-t pt-16" aria-labelledby="similar-title">
            <h2 id="similar-title" className="font-display text-3xl md:text-4xl text-center mb-12">Схожі моделі</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
              {similar.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default ProductDetail;
