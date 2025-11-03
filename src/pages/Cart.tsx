import { useCart } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="container px-4 py-20">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold mb-4">Ваш кошик порожній</h1>
            <p className="font-body text-muted-foreground mb-8">
              Почніть покупки, щоб додати товари до кошика
            </p>
            <Link to="/">
              <Button size="lg" className="font-body">Продовжити покупки</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container px-4 py-12 min-h-[calc(100vh-200px)]">
        <h1 className="font-display text-4xl font-bold mb-8">Кошик покупок</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(({ product, quantity }) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold mb-1">{product.name}</h3>
                      <p className="font-body text-sm text-muted-foreground mb-2">{product.brand}</p>
                      <p className="font-body text-lg font-bold text-accent">
                        {product.price.toLocaleString()} ₴
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="flex items-center gap-2 border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-body font-medium w-8 text-center">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold">Підсумок замовлення</h2>
                
                <div className="space-y-2 font-body">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Сума</span>
                    <span className="font-medium">{cartTotal.toLocaleString()} ₴</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Доставка</span>
                    <span className="font-medium">Безкоштовно</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                    <span>Загалом</span>
                    <span className="text-accent">{cartTotal.toLocaleString()} ₴</span>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/checkout')}
                  className="w-full font-body font-medium"
                  size="lg"
                >
                  Оформити замовлення
                </Button>
                
                <Link to="/">
                  <Button variant="outline" className="w-full font-body">
                    Продовжити покупки
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Cart;
