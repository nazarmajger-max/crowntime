import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, User, Shield, Heart, Search, X, LogOut, Home, Watch } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import logo from '@/assets/crowntime-logo.png';
import { BrandModelMenu } from './BrandModelMenu';

export const Header = () => {
  const { cartCount } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        // Search products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
          .limit(10);

        if (productsError) throw productsError;

        // Fetch primary images for found products
        const productIds = productsData?.map(p => p.id) || [];
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('product_id, image_url')
          .eq('is_primary', true)
          .in('product_id', productIds);

        const imageMap = new Map(imagesData?.map(img => [img.product_id, img.image_url]) || []);

        const formattedProducts: Product[] = (productsData || []).map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand || '',
          price: Number(p.price),
          description: p.description || '',
          image: imageMap.get(p.id) || '/placeholder.svg',
          category: p.movement_type || 'Analog',
          gender: (p.gender?.toLowerCase() || 'unisex') as 'men' | 'women' | 'unisex',
          type: 'analog' as Product['type'],
          caseMaterial: p.case_material || 'Steel',
          dialColor: p.dial_color || 'Black',
          waterResistance: p.water_resistance || '50m',
          movement: p.movement_type || 'Automatic',
          inStock: p.stock_quantity > 0
        }));

        setSearchResults(formattedProducts);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleProductClick = (productId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/product/${productId}`);
  };

  const handleMenuNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile Header */}
      <div className="md:hidden flex h-14 items-center justify-between px-4 gap-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
        </div>
        
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img src={logo} alt="CrownTime" className="h-6 w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-1">
          {user && (
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="h-10 w-10 relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2">
              <img src={logo} alt="CrownTime" className="h-8 w-auto object-contain" />
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col py-2">
            <button
              onClick={() => handleMenuNavigate('/')}
              className="flex items-center gap-4 px-5 py-4 hover:bg-accent/10 transition-colors active:bg-accent/20"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium text-base">Головна</span>
            </button>
            
            <button
              onClick={() => {
                setMenuOpen(false);
                setBrandMenuOpen(true);
              }}
              className="flex items-center gap-4 px-5 py-4 hover:bg-accent/10 transition-colors active:bg-accent/20"
            >
              <Watch className="h-5 w-5" />
              <span className="font-medium text-base">Каталог брендів</span>
            </button>

            {user ? (
              <>
                <button
                  onClick={() => handleMenuNavigate('/profile')}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-accent/10 transition-colors active:bg-accent/20"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium text-base">Профіль</span>
                </button>
                <button
                  onClick={() => handleMenuNavigate('/favorites')}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-accent/10 transition-colors active:bg-accent/20"
                >
                  <Heart className="h-5 w-5" />
                  <span className="font-medium text-base">Обране</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleMenuNavigate('/admin')}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-accent/10 transition-colors active:bg-accent/20 text-accent"
                  >
                    <Shield className="h-5 w-5" />
                    <span className="font-medium text-base">Адмін панель</span>
                  </button>
                )}
                <div className="border-t mt-2 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-accent/10 transition-colors active:bg-accent/20 text-destructive w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium text-base">Вийти</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => handleMenuNavigate('/auth')}
                className="flex items-center gap-4 px-5 py-4 hover:bg-accent/10 transition-colors active:bg-accent/20"
              >
                <User className="h-5 w-5" />
                <span className="font-medium text-base">Увійти / Реєстрація</span>
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Header */}
      <div className="hidden md:flex container h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src={logo} alt="CrownTime" className="h-10 w-auto object-contain" />
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className="font-body text-sm font-medium transition-colors hover:text-accent">
            Головна
          </Link>
          <button 
            onClick={() => setBrandMenuOpen(true)}
            className="font-body text-sm font-medium transition-colors hover:text-accent"
          >
            Каталог брендів
          </button>
          <Link to="/products" className="font-body text-sm font-medium transition-colors hover:text-accent">
            Всі товари
          </Link>
        </nav>

        {/* Desktop Search */}
        <div className="relative flex-1 max-w-md mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук товарів..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Desktop Search Results Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50">
              {searching && (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent mx-auto"></div>
                </div>
              )}
              
              {!searching && searchResults.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Товарів не знайдено
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="py-2">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="flex gap-3 px-4 py-3 cursor-pointer hover:bg-accent/5 transition-colors"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-14 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{product.brand}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{product.name}</p>
                        <p className="font-bold text-sm">{product.price.toLocaleString('uk-UA')} ₴</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <Shield className="mr-2 h-4 w-4" />
                Адмін
              </Button>
            </Link>
          )}
          {user ? (
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <User className="mr-2 h-4 w-4" />
                Профіль
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                <User className="mr-2 h-4 w-4" />
                Увійти
              </Button>
            </Link>
          )}
          {user && (
            <Link to="/favorites">
              <Button variant="ghost" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Search Sheet */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent side="top" className="h-[100vh] p-0">
          <SheetHeader className="border-b p-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <Input
                  placeholder="Пошук товарів..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10"
                  autoFocus
                />
              </div>
            </div>
          </SheetHeader>
          
          <div className="overflow-y-auto h-[calc(100vh-80px)] p-4">
            {searching && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto"></div>
              </div>
            )}
            
            {!searching && searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Товарів не знайдено
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="flex gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{product.brand}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.name}</p>
                      <p className="font-bold text-sm mt-1">{product.price.toLocaleString('uk-UA')} ₴</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Brand Model Menu */}
      <BrandModelMenu open={brandMenuOpen} onOpenChange={setBrandMenuOpen} />
    </header>
  );
};
