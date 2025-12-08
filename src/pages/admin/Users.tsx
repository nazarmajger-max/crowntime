import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  is_admin: boolean;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      toast.error('Помилка завантаження користувачів');
      return;
    }

    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'admin');

    if (rolesError) {
      toast.error('Помилка завантаження ролей');
      return;
    }

    const adminIds = new Set(rolesData?.map(r => r.user_id) || []);
    
    const usersWithRoles = profilesData.map(profile => ({
      ...profile,
      is_admin: adminIds.has(profile.id),
    }));

    setUsers(usersWithRoles);
  };

  const toggleAdminRole = async (userId: string, isCurrentlyAdmin: boolean) => {
    if (isCurrentlyAdmin) {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        toast.error('Помилка видалення ролі адміністратора');
        return;
      }
      toast.success('Роль адміністратора видалено');
    } else {
      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);

      if (error) {
        toast.error('Помилка додавання ролі адміністратора');
        return;
      }
      toast.success('Роль адміністратора додано');
    }

    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Користувачі</h1>
        <p className="text-muted-foreground">Управління користувачами та правами доступу</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ім'я</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Дата реєстрації</TableHead>
              <TableHead>Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name || '—'}</TableCell>
                <TableCell>{user.phone || '—'}</TableCell>
                <TableCell>
                  {user.is_admin ? (
                    <Badge variant="default">Адміністратор</Badge>
                  ) : (
                    <Badge variant="secondary">Користувач</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAdminRole(user.id, user.is_admin)}
                  >
                    {user.is_admin ? (
                      <>
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Забрати адмін
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Зробити адміном
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Users;
