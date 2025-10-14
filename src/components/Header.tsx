import { Link } from 'react-router-dom';
import { ShoppingCart, Menu } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export const Header = () => {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src={logo} alt="Chronos Elite" className="h-10 w-10" />
          <span className="font-display text-xl font-semibold">Chronos Elite</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="font-body text-sm font-medium transition-colors hover:text-accent">
            Home
          </Link>
          <Link to="/" className="font-body text-sm font-medium transition-colors hover:text-accent">
            Shop
          </Link>
          <Link to="/" className="font-body text-sm font-medium transition-colors hover:text-accent">
            About
          </Link>
          <Link to="/" className="font-body text-sm font-medium transition-colors hover:text-accent">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
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
