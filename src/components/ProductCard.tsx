import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Heart, Video, Scale, CheckCircle, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

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
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) {
        setIsFavorite(false);
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();

      if (!error && data) {
        setIsFavorite(true);
      }
    };

    checkFavoriteStatus();
  }, [user, product.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Увійдіть, щоб додати товар до обраних');
      navigate('/auth');
      return;
    }

    setIsLoadingFavorite(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id);

        if (error) throw error;
        
        setIsFavorite(false);
        toast.success('Видалено з обраних');
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: product.id
          });

        if (error) throw error;
        
        setIsFavorite(true);
        toast.success('Додано до обраних');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Помилка при оновленні обраних');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

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
      className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-hover)] animate-fade-in md:rounded-lg rounded-none border-0 md:border bg-card" 
      onClick={handleProductClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* Action Icons */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-6 w-6 md:h-9 md:w-9 rounded-full transition-colors ${
              isFavorite 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white/90 hover:bg-white shadow-sm'
            }`}
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
          >
            <Heart className={`h-3 w-3 md:h-4 md:w-4 ${isFavorite ? 'fill-white text-white' : ''}`} />
          </Button>
        </div>

        <img 
          src={product.image} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
      </div>
      
      <CardContent className="p-2.5 md:p-4 space-y-1 md:space-y-2">
        {/* Availability */}
        <div className="flex items-center gap-1">
          <CheckCircle className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 text-green-600" />
          <span className="text-[9px] md:text-xs text-muted-foreground">В наявності</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-[10px] md:text-sm font-medium">0</span>
          <span className="text-[9px] md:text-xs text-muted-foreground">(0)</span>
        </div>
        
        {/* Product Name */}
        <h3 className="font-body text-[11px] md:text-sm font-medium line-clamp-2 leading-tight min-h-[2.4em]">
          {product.name}
        </h3>
        
        {/* Product Code */}
        <p className="text-[9px] md:text-xs text-muted-foreground uppercase tracking-wide">
          {product.brand}
        </p>
        
        {/* Price */}
        <p className="font-body text-sm md:text-xl font-bold text-primary">
          {product.price.toLocaleString()} ₴
        </p>
      </CardContent>
    </Card>
  );
};