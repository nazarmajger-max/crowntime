import { Product } from '@/types/product';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
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
      if (!error && data) setIsFavorite(true);
    };
    checkFavoriteStatus();
  }, [user, product.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
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
          .insert({ user_id: user.id, product_id: product.id });
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

  const hasHover = !!product.hoverImage && product.hoverImage !== product.image;

  return (
    <article className="group relative animate-fade-in">
      <a
        href={`/product/${product.id}`}
        onClick={(e) => {
          e.preventDefault();
          navigate(`/product/${product.id}`);
        }}
        className="block focus-visible:outline-none"
        aria-label={`${product.brand} ${product.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-stone">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className={cn(
              'absolute inset-0 h-full w-full object-contain p-6 md:p-8 mix-blend-multiply transition-all duration-1200 ease-lux',
              hasHover ? 'group-hover:opacity-0' : 'group-hover:scale-[1.03]'
            )}
          />
          {hasHover && (
            <img
              src={product.hoverImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-6 md:p-8 mix-blend-multiply opacity-0 transition-opacity duration-1200 ease-lux group-hover:opacity-100"
            />
          )}
          {!product.inStock && (
            <span className="absolute left-3 top-3 eyebrow bg-background/80 px-2 py-1">Немає в наявності</span>
          )}
        </div>

        <div className="pt-4 pb-2 space-y-1.5 text-center">
          <p className="font-body text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {product.brand}
          </p>
          <h3 className="font-display text-lg md:text-xl leading-snug line-clamp-2 min-h-[2.6em]">
            {product.name}
          </h3>
          <p className="font-body text-sm tabular-nums">
            {product.price.toLocaleString('uk-UA')} ₴
          </p>
        </div>
      </a>

      <button
        type="button"
        onClick={handleToggleFavorite}
        disabled={isLoadingFavorite}
        aria-label={isFavorite ? 'Видалити з обраних' : 'Додати до обраних'}
        aria-pressed={isFavorite}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center text-foreground/70 transition-colors duration-700 hover:text-foreground"
      >
        <Heart className={cn('h-4 w-4', isFavorite && 'fill-gold text-gold')} strokeWidth={1.25} />
      </button>
    </article>
  );
};
