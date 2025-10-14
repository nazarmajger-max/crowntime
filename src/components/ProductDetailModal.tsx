import { Product } from '@/types/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export const ProductDetailModal = ({ product, open, onClose }: ProductDetailModalProps) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="font-body text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.brand}
              </p>
              <p className="font-body text-3xl font-bold text-accent mb-4">
                ${product.price.toLocaleString()}
              </p>
              <p className="font-body text-foreground/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-3 border-t pt-6">
              <h4 className="font-display text-lg font-semibold">Specifications</h4>
              <div className="grid grid-cols-2 gap-3 font-body text-sm">
                <div>
                  <p className="text-muted-foreground">Movement</p>
                  <p className="font-medium">{product.movement}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Case Material</p>
                  <p className="font-medium">{product.caseMaterial}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dial Color</p>
                  <p className="font-medium">{product.dialColor}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Water Resistance</p>
                  <p className="font-medium">{product.waterResistance}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{product.gender}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{product.type}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-body">
              {product.inStock ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">In Stock</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">Out of Stock</span>
                </>
              )}
            </div>

            <Button 
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full font-body font-medium"
              size="lg"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
