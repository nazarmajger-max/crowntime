import { LayoutDashboard, Package, ShoppingCart, LogOut, ImageIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import logo from '@/assets/crowntime-logo.png';

const menuItems = [
  { title: 'Панель', url: '/admin', icon: LayoutDashboard },
  { title: 'Товари', url: '/admin/products', icon: Package },
  { title: 'Зображення каталогу', url: '/admin/catalog-images', icon: ImageIcon },
  { title: 'Замовлення', url: '/admin/orders', icon: ShoppingCart },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-muted/50';

  return (
    <Sidebar collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <div className="p-4 border-b">
        <img src={logo} alt="CrownTime" className="h-8 w-auto object-contain mx-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Адмін Панель</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/admin'} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            <span>Вийти</span>
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
