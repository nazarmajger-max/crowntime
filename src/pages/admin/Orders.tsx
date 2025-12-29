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
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: 'Не прийнято', variant: 'outline' },
      processing: { label: 'У дорозі', variant: 'secondary' },
      delivered: { label: 'Виконано', variant: 'default' },
      cancelled: { label: 'Скасовано', variant: 'destructive' },
    };
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Замовлення</h1>
        <p className="text-sm md:text-base text-muted-foreground">Управління замовленнями клієнтів</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg">
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
                        <SelectItem value="pending">Не прийнято</SelectItem>
                        <SelectItem value="processing">У дорозі</SelectItem>
                        <SelectItem value="delivered">Виконано</SelectItem>
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{order.shipping_name}</p>
                <p className="text-xs font-mono text-muted-foreground">{order.id.slice(0, 8)}</p>
              </div>
              {getStatusBadge(order.status)}
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Сума:</span>
              <span className="font-semibold">₴{order.total_amount}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Дата:</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewOrder(order)}>
                <Eye className="h-4 w-4 mr-2" />
                Деталі
              </Button>
              <Select
                defaultValue={order.status}
                onValueChange={(value) => handleStatusChange(order.id, value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Не прийнято</SelectItem>
                  <SelectItem value="processing">У дорозі</SelectItem>
                  <SelectItem value="delivered">Виконано</SelectItem>
                  <SelectItem value="cancelled">Скасовано</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Деталі замовлення</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {/* Desktop order items table */}
                <div className="hidden sm:block">
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
                {/* Mobile order items */}
                <div className="sm:hidden space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="border rounded p-3 space-y-1">
                      <p className="font-medium">{item.product_name}</p>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>₴{item.price} × {item.quantity}</span>
                        <span className="font-semibold text-foreground">₴{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-base md:text-lg font-bold">Загальна сума:</p>
                <p className="text-xl md:text-2xl font-bold text-luxury-gold">₴{selectedOrder.total_amount}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
