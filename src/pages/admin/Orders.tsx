import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Помилка завантаження замовлень');
      return;
    }
    setOrders(data || []);
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    
    const { data, error } = await supabase
      .from('order_items')
      .select('id, product_id, price, quantity')
      .eq('order_id', order.id);

    if (error) {
      toast.error('Помилка завантаження деталей замовлення');
      return;
    }
    
    // Fetch product names
    if (data && data.length > 0) {
      const productIds = data.map(item => item.product_id);
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);
      
      const productMap = new Map(products?.map(p => [p.id, p.name]) || []);
      
      const itemsWithNames: OrderItem[] = data.map(item => ({
        ...item,
        product_name: productMap.get(item.product_id) || 'Невідомий товар',
      }));
      setOrderItems(itemsWithNames);
    } else {
      setOrderItems([]);
    }
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Помилка оновлення статусу');
      return;
    }
    toast.success('Статус оновлено');
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'outline',
      processing: 'secondary',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Замовлення</h1>
        <p className="text-muted-foreground">Управління замовленнями клієнтів</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Клієнт</TableHead>
              <TableHead>Сума</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                <TableCell>{order.shipping_name}</TableCell>
                <TableCell>₴{order.total_amount}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Select
                      defaultValue={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">В очікуванні</SelectItem>
                        <SelectItem value="processing">В обробці</SelectItem>
                        <SelectItem value="shipped">Відправлено</SelectItem>
                        <SelectItem value="delivered">Доставлено</SelectItem>
                        <SelectItem value="cancelled">Скасовано</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Деталі замовлення</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Клієнт</p>
                  <p>{selectedOrder.shipping_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Телефон</p>
                  <p>{selectedOrder.shipping_phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Місто</p>
                  <p>{selectedOrder.shipping_city}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Адреса</p>
                  <p>{selectedOrder.shipping_address}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Товари</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Товар</TableHead>
                      <TableHead>Ціна</TableHead>
                      <TableHead>Кількість</TableHead>
                      <TableHead>Сума</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>₴{item.price}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₴{item.price * item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-lg font-bold">Загальна сума:</p>
                <p className="text-2xl font-bold text-luxury-gold">₴{selectedOrder.total_amount}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
