import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  return (
    <>
      <Header />
      <main className="container px-4 py-12 md:py-20 min-h-[calc(100vh-200px)]">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 md:h-20 md:w-20 text-green-600 mx-auto mb-4 md:mb-6" />
          <h1 className="font-display text-2xl md:text-4xl font-bold mb-3 md:mb-4">Замовлення підтверджено!</h1>
          <p className="font-body text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
            Дякуємо за покупку. Ваше замовлення успішно оформлено і буде оброблено найближчим часом.
          </p>
          <div className="bg-muted rounded-lg p-4 md:p-6 mb-6 md:mb-8">
            <p className="font-body text-sm text-muted-foreground mb-2">Номер замовлення</p>
            <p className="font-body text-xl md:text-2xl font-bold">
              #{Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
          </div>
          <p className="font-body text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
            З вами скоро зв'яжуться для підтвердження замовлення.
          </p>
          <Link to="/">
            <Button size="lg" className="font-body font-medium w-full md:w-auto">
              Продовжити покупки
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderSuccess;
