import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} додано до кошика`);
  };

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <Card 
      className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)] animate-fade-in"
      onClick={handleProductClick}
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-4">
        <p className="font-body text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {product.brand}
        </p>
        <h3 className="font-display text-lg font-semibold mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="font-body text-2xl font-bold text-accent">
          {product.price.toLocaleString()} ₴
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full font-body font-medium"
          variant="default"
        >
          Додати до кошика
        </Button>
      </CardFooter>
    </Card>
  );
};
