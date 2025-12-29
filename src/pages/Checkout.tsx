import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, 'Імʼя обовʼязкове').max(50, 'Імʼя занадто довге'),
  lastName: z.string().trim().min(1, 'Прізвище обовʼязкове').max(50, 'Прізвище занадто довге'),
  email: z.string().trim().email('Невірний формат email').max(255, 'Email занадто довгий'),
  phone: z.string().trim().regex(/^[+]?[0-9]{10,15}$/, 'Невірний формат телефону (10-15 цифр)'),
  address: z.string().trim().min(5, 'Адреса занадто коротка').max(200, 'Адреса занадто довга'),
  city: z.string().trim().min(2, 'Місто обовʼязкове').max(100, 'Назва міста занадто довга'),
  postalCode: z.string().trim().min(1, 'Індекс обовʼязковий').max(20, 'Індекс занадто довгий'),
});

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'card',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error('Будь ласка, виправте помилки у формі');
      return;
    }
    
    const validatedData = result.data;

    setIsSubmitting(true);

    try {
      // Create order - for guests, user_id is null and guest_email is set
      const orderData: {
        user_id?: string;
        guest_email?: string;
        total_amount: number;
        shipping_name: string;
        shipping_phone: string;
        shipping_address: string;
        shipping_city: string;
        status: string;
      } = {
        total_amount: cartTotal,
        shipping_name: `${validatedData.firstName} ${validatedData.lastName}`,
        shipping_phone: validatedData.phone,
        shipping_address: validatedData.address,
        shipping_city: validatedData.city,
        status: 'pending',
      };

      if (user) {
        orderData.user_id = user.id;
      } else {
        orderData.guest_email = validatedData.email;
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        quantity,
        price: product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success('Замовлення успішно оформлено!');
      clearCart();
      navigate('/order-success');
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('Помилка оформлення замовлення');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <>
      <Header />
      <main className="container px-4 py-12">
        <h1 className="font-display text-4xl font-bold mb-8">Оформлення замовлення</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Інформація про доставку</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="font-body">Ім'я</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        maxLength={50}
                        className="font-body"
                      />
                      {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="font-body">Прізвище</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        maxLength={50}
                        className="font-body"
                      />
                      {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="font-body">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      maxLength={255}
                      className="font-body"
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="font-body">Телефон</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength={15}
                      placeholder="+380XXXXXXXXX"
                      className="font-body"
                    />
                    {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="font-body">Адреса</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      maxLength={200}
                      className="font-body"
                    />
                    {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="font-body">Місто</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        maxLength={100}
                        className="font-body"
                      />
                      {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="font-body">Поштовий індекс</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        maxLength={20}
                        className="font-body"
                      />
                      {errors.postalCode && <p className="text-sm text-destructive mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Спосіб оплати</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Оплата буде здійснена після підтвердження замовлення менеджером
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="font-display">Підсумок замовлення</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {cart.map(({ product, quantity }) => (
                      <div key={product.id} className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">
                          {product.name} x{quantity}
                        </span>
                        <span className="font-medium">
                          ₴{(product.price * quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2 font-body">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Сума</span>
                      <span className="font-medium">₴{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Доставка</span>
                      <span className="font-medium">Безкоштовно</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                      <span>Загалом</span>
                      <span className="text-accent">₴{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-body font-medium" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Оформлення...' : 'Оформити замовлення'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
