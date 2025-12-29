import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Package, MessageSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Оцінка обовʼязкова').max(5),
  comment: z.string().max(1000, 'Коментар занадто довгий (максимум 1000 символів)').optional(),
});

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
  } | null;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_items: OrderItem[];
}

interface Review {
  id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  products: {
    name: string;
  } | null;
}

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchReviews();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          order_items (
            product_id,
            quantity,
            price,
            products (
              name
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Помилка завантаження замовлень');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          product_id,
          rating,
          comment,
          created_at,
          products (
            name
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data as Review[]) || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedProduct || !user) return;

    const result = reviewSchema.safeParse({ rating, comment: comment.trim() || undefined });
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError?.message || 'Невірні дані');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: selectedProduct.id,
          rating: result.data.rating,
          comment: result.data.comment || null,
        });

      if (error) throw error;

      toast.success('Відгук успішно додано!');
      setReviewDialogOpen(false);
      setSelectedProduct(null);
      setRating(5);
      setComment('');
      fetchReviews();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Ви вже залишили відгук на цей товар');
      } else {
        toast.error('Помилка додавання відгуку');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewDialog = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setReviewDialogOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('Відгук видалено');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Помилка при видаленні відгуку');
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="container px-4 py-20 min-h-[calc(100vh-200px)]">
          <div className="text-center">Завантаження...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container px-4 py-20 min-h-[calc(100vh-200px)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-display text-4xl font-bold">Особистий кабінет</h1>
            <Button variant="outline" onClick={signOut}>
              Вийти
            </Button>
          </div>
          
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto">
              <TabsTrigger value="orders" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Мої замовлення</span>
                <span className="xs:hidden">Замовлення</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5">
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Мої відгуки</span>
                <span className="xs:hidden">Відгуки</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">У вас поки немає замовлень</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Замовлення #{order.id.slice(0, 8)}</CardTitle>
                            <CardDescription>
                              {new Date(order.created_at).toLocaleDateString('uk-UA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{order.total_amount} грн</div>
                            <div className="text-sm text-muted-foreground capitalize">{order.status}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {order.order_items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center border-t pt-3">
                              <div>
                                <div className="font-medium">{item.products?.name || 'Товар'}</div>
                                <div className="text-sm text-muted-foreground">
                                  Кількість: {item.quantity}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-bold">{item.price * item.quantity} грн</div>
                                </div>
                                {order.status === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openReviewDialog(item.product_id, item.products?.name || 'Товар')}
                                  >
                                    <Star className="h-4 w-4 mr-1" />
                                    Відгук
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Ви ще не залишили жодного відгуку</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <CardTitle className="text-base sm:text-lg">{review.products?.name || 'Товар'}</CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => handleDeleteReview(review.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <CardDescription>
                              {new Date(review.created_at).toLocaleDateString('uk-UA')}
                            </CardDescription>
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      {review.comment && (
                        <CardContent>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Залишити відгук</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Оцінка</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground hover:text-yellow-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Коментар (необов'язково, макс. 1000 символів)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Поділіться своїми враженнями про товар..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">{comment.length}/1000</p>
            </div>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? 'Відправка...' : 'Опублікувати відгук'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default Profile;
