import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, User, Shield, Heart, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/watchzone-logo.jpg';

export const Header = () => {
  const { cartCount } = useCart();
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Mobile Header */}
      <div className="md:hidden flex h-14 items-center justify-between px-3 gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="h-5 w-5" />
          </Button>
        </div>
        
        <Link to="/" className="flex-shrink-0">
          <img src={logo} alt="WATCHZONE" className="h-7 w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-1">
          {user && (
            <Link to="/favorites">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="h-9 w-9 relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex container h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src={logo} alt="WATCHZONE" className="h-8 w-auto object-contain" />
        </Link>

        <nav className="flex items-center gap-8">
          <Link to="/" className="font-body text-sm font-medium transition-colors hover:text-accent">
            Головна
          </Link>
          <Link to="/" className="font-body text-sm font-medium transition-colors hover:text-accent">
            Магазин
          </Link>
          <Link to="/" className="font-body text-sm font-medium transition-colors hover:text-accent">
            Про нас
          </Link>
          <Link to="/" className="font-body text-sm font-medium transition-colors hover:text-accent">
            Контакти
          </Link>
        </nav>

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
    </header>
  );
};
