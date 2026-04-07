import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LayoutDashboard, Package, ShoppingCart, LogOut, Home, ImageIcon, KeyRound } from 'lucide-react';
import logo from '@/assets/crowntime-logo.png';

const AdminLayout = () => {
  const { isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const menuItems = [
    { title: 'Панель', url: '/admin', icon: LayoutDashboard },
    { title: 'Товари', url: '/admin/products', icon: Package },
    { title: 'Зображення каталогу', url: '/admin/catalog-images', icon: ImageIcon },
    { title: 'Замовлення', url: '/admin/orders', icon: ShoppingCart },
  ];

  const handleMobileNavigate = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Admin Layout */}
      <div className="md:hidden min-h-screen flex flex-col bg-background">
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background sticky top-0 z-50">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/admin">
            <img src={logo} alt="CrownTime Admin" className="h-6 w-auto object-contain" />
          </Link>
          <div className="w-9" /> {/* Spacer for alignment */}
        </header>
        
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>

        {/* Mobile Admin Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="flex items-center gap-2">
                <img src={logo} alt="CrownTime" className="h-6 w-auto object-contain" />
                <span className="text-sm text-muted-foreground">Адмін</span>
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col py-4">
              <button
                onClick={() => handleMobileNavigate('/')}
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">На сайт</span>
              </button>

              <div className="border-t my-2" />

              {menuItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleMobileNavigate(item.url)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </button>
              ))}

              <div className="border-t mt-4 pt-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors text-destructive w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Вийти</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Admin Layout */}
      <div className="hidden md:block">
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-16 border-b flex items-center px-6 bg-background">
                <SidebarTrigger />
                <div className="ml-4">
                  <h2 className="text-xl font-display font-bold text-accent">CrownTime Admin</h2>
                </div>
              </header>
              <main className="flex-1 p-6">
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </>
  );
};

export default AdminLayout;