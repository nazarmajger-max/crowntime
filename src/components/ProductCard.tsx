import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Heart, Video, Scale, CheckCircle, Star } from 'lucide-react';
interface ProductCardProps {
  product: Product;
}
export const ProductCard = ({
  product
}: ProductCardProps) => {
  const {
    addToCart
  } = useCart();
  const navigate = useNavigate();
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} додано до кошика`);
  };
  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };
  return <Card className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)] animate-fade-in md:rounded-lg rounded-none border-r border-b md:border" onClick={handleProductClick}>
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {/* Hit Badge */}
        
        
        {/* Action Icons */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
          <div className="flex items-center gap-1">
            
          </div>
        </div>
        
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white rounded-full" onClick={e => {
          e.stopPropagation();
          toast.info('Додано до обраного');
        }}>
            <Heart className="h-4 w-4" />
          </Button>
          
        </div>

        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      
      <CardContent className="p-3 md:p-4 space-y-2">
        {/* Availability */}
        <div className="flex items-center gap-1.5 text-xs">
          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
          <span className="text-muted-foreground">В наявності</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">0</span>
          <span className="text-xs text-muted-foreground">(0)</span>
        </div>
        
        {/* Product Name */}
        <h3 className="font-body text-sm md:text-base font-semibold line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        {/* Product Code */}
        <p className="text-xs text-muted-foreground uppercase">
          {product.brand}-{product.id.substring(0, 8)}
        </p>
        
        {/* Price */}
        <p className="font-body text-xl md:text-2xl font-bold">
          {product.price.toLocaleString()} грн
        </p>
        
        {/* Credit Info */}
        
      </CardContent>
    </Card>;
};