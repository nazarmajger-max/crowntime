import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';

const AdminLayout = () => {
  // Тимчасово вимкнено перевірку авторизації для тестування
  // const { isAdmin, loading } = useAuth();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (!loading && !isAdmin) {
  //     navigate('/');
  //   }
  // }, [isAdmin, loading, navigate]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold"></div>
  //     </div>
  //   );
  // }

  // if (!isAdmin) {
  //   return null;
  // }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center px-6 bg-white">
            <SidebarTrigger />
            <div className="ml-4">
              <h2 className="text-xl font-display font-bold text-luxury-gold">Chronos Elite Admin</h2>
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
