import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  return (
    <>
      <Header />
      <main className="container px-4 py-20 min-h-[calc(100vh-200px)]">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-6" />
          <h1 className="font-display text-4xl font-bold mb-4">Order Confirmed!</h1>
          <p className="font-body text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been successfully placed and will be processed shortly.
          </p>
          <div className="bg-muted rounded-lg p-6 mb-8">
            <p className="font-body text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="font-body text-2xl font-bold">
              #{Math.random().toString(36).substring(2, 10).toUpperCase()}
            </p>
          </div>
          <p className="font-body text-muted-foreground mb-8">
            A confirmation email has been sent to your email address with order details and tracking information.
          </p>
          <Link to="/">
            <Button size="lg" className="font-body font-medium">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default OrderSuccess;
