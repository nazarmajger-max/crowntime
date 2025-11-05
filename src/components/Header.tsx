import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, User, Shield } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/watchzone-logo.jpg';

export const Header = () => {
  const { cartCount } = useCart();
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src={logo} alt="WATCHZONE" className="h-8 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
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
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Shield className="mr-2 h-4 w-4" />
                Адмін
              </Button>
            </Link>
          )}
          {user ? (
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <User className="mr-2 h-4 w-4" />
                Профіль
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <User className="mr-2 h-4 w-4" />
                Увійти
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
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
