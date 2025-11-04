import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, Pencil, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  image_url: string;
  category: string;
  gender: string;
  case_material: string;
  dial_color: string;
  in_stock: boolean;
  stock_quantity: number;
  glass_type?: string;
  diameter?: string;
  movement_type?: string;
  illumination?: string;
  dial_type?: string;
  case_color?: string;
  date_indication?: boolean;
  day_indication?: boolean;
  watch_style?: string;
  indication_type?: string;
  case_shape?: string;
  water_resistance?: string;
  strap_material?: string;
  strap_color?: string;
  model_code?: string;
}

interface Specification {
  id: string;
  spec_type: string;
  value: string;
}

const specTypeLabels: Record<string, string> = {
  brand: 'Бренд',
  glass: 'Скло',
  diameter: 'Діаметр',
  movement_type: 'Тип механізму',
  illumination: 'Підсвічування',
  dial_type: 'Тип циферблату',
  case_color: 'Колір корпусу',
  style: 'Стиль',
  indication_type: 'Тип індикації',
  case_material: 'Матеріал корпусу',
  strap_material: 'Матеріал браслета/ремінця',
  dial_color: 'Колір циферблату',
  case_shape: 'Форма корпусу',
  water_resistance: 'Водозахист',
  strap_color: 'Колір браслета/ремінця',
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newSpecValue, setNewSpecValue] = useState('');
  const [addingSpecType, setAddingSpecType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    description: '',
    image_url: '',
    category: '',
    gender: '',
    case_material: '',
    dial_color: '',
    stock_quantity: '',
    glass_type: '',
    diameter: '',
    movement_type: '',
    illumination: '',
    dial_type: '',
    case_color: '',
    date_indication: false,
    day_indication: false,
    watch_style: '',
    indication_type: '',
    case_shape: '',
    water_resistance: '',
    strap_material: '',
    strap_color: '',
    model_code: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchSpecifications();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Помилка завантаження товарів');
      return;
    }
    setProducts(data || []);
  };

  const fetchSpecifications = async () => {
    const { data, error } = await supabase
      .from('product_specifications')
      .select('*')
      .order('spec_type, value');

    if (error) {
      toast.error('Помилка завантаження характеристик');
      return;
    }
    setSpecifications(data || []);
  };

  const getSpecificationsByType = (type: string) => {
    return specifications.filter(s => s.spec_type === type).map(s => s.value);
  };

  const handleAddNewSpecification = async (specType: string) => {
    if (!newSpecValue.trim()) {
      toast.error('Введіть значення характеристики');
      return;
    }

    const { error } = await supabase
      .from('product_specifications')
      .insert([{ spec_type: specType, value: newSpecValue.trim() }]);

    if (error) {
      if (error.code === '23505') {
        toast.error('Така характеристика вже існує');
      } else {
        console.error('Error adding specification:', error);
        toast.error('Помилка додавання характеристики: ' + error.message);
      }
      return;
    }

    toast.success('Характеристика додана');
    setNewSpecValue('');
    setAddingSpecType(null);
    await fetchSpecifications();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
      in_stock: parseInt(formData.stock_quantity) > 0,
      category: formData.category || 'Годинники',
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        toast.error('Помилка оновлення товару');
        return;
      }
      toast.success('Товар оновлено');
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) {
        toast.error('Помилка додавання товару');
        return;
      }
      toast.success('Товар додано');
    }

    setIsDialogOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price.toString(),
      description: product.description || '',
      image_url: product.image_url,
      category: product.category,
      gender: product.gender || '',
      case_material: product.case_material || '',
      dial_color: product.dial_color || '',
      stock_quantity: product.stock_quantity.toString(),
      glass_type: product.glass_type || '',
      diameter: product.diameter || '',
      movement_type: product.movement_type || '',
      illumination: product.illumination || '',
      dial_type: product.dial_type || '',
      case_color: product.case_color || '',
      date_indication: product.date_indication || false,
      day_indication: product.day_indication || false,
      watch_style: product.watch_style || '',
      indication_type: product.indication_type || '',
      case_shape: product.case_shape || '',
      water_resistance: product.water_resistance || '',
      strap_material: product.strap_material || '',
      strap_color: product.strap_color || '',
      model_code: product.model_code || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити цей товар?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Помилка видалення товару');
      return;
    }
    toast.success('Товар видалено');
    fetchProducts();
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      price: '',
      description: '',
      image_url: '',
      category: '',
      gender: '',
      case_material: '',
      dial_color: '',
      stock_quantity: '',
      glass_type: '',
      diameter: '',
      movement_type: '',
      illumination: '',
      dial_type: '',
      case_color: '',
      date_indication: false,
      day_indication: false,
      watch_style: '',
      indication_type: '',
      case_shape: '',
      water_resistance: '',
      strap_material: '',
      strap_color: '',
      model_code: '',
    });
  };

  const ComboboxField = ({ 
    specType, 
    label, 
    value, 
    onChange 
  }: { 
    specType: string; 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const options = getSpecificationsByType(specType);
    const isAddingThis = addingSpecType === specType;

    const handleAddClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setAddingSpecType(specType);
    };

    const handleCancelClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setAddingSpecType(null);
      setNewSpecValue('');
    };

    const handleSubmitNew = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      await handleAddNewSpecification(specType);
    };

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              type="button"
            >
              {value || `Оберіть ${label.toLowerCase()}...`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={!isAddingThis}>
              <CommandInput 
                placeholder={`Шукати ${label.toLowerCase()}...`}
                disabled={isAddingThis}
              />
              <CommandList className="max-h-[300px]">
                {!isAddingThis && (
                  <>
                    <CommandEmpty>Не знайдено.</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option}
                          value={option}
                          onSelect={() => {
                            onChange(option);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === option ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
            <div className="border-t p-2 bg-background">
              {isAddingThis ? (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={newSpecValue}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNewSpecValue(e.target.value);
                    }}
                    placeholder="Нова характеристика"
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmitNew(e as any);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleSubmitNew}
                    type="button"
                  >
                    Додати
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelClick}
                    type="button"
                  >
                    Скасувати
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={handleAddClick}
                  type="button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Додати нову характеристику
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Товари</h1>
          <p className="text-muted-foreground">Управління каталогом товарів</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Додати товар
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Редагувати товар' : 'Додати товар'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Назва*</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <ComboboxField
                  specType="brand"
                  label={specTypeLabels.brand}
                  value={formData.brand}
                  onChange={(value) => setFormData({ ...formData, brand: value })}
                />
                <div className="space-y-2">
                  <Label htmlFor="model_code">Модель</Label>
                  <Input
                    id="model_code"
                    value={formData.model_code}
                    onChange={(e) => setFormData({ ...formData, model_code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Ціна (₴)*</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Кількість на складі*</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Стать*</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть стать" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">Чоловіча</SelectItem>
                      <SelectItem value="women">Жіноча</SelectItem>
                      <SelectItem value="unisex">Унісекс</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ComboboxField
                  specType="glass"
                  label={specTypeLabels.glass}
                  value={formData.glass_type}
                  onChange={(value) => setFormData({ ...formData, glass_type: value })}
                />

                <ComboboxField
                  specType="diameter"
                  label={specTypeLabels.diameter}
                  value={formData.diameter}
                  onChange={(value) => setFormData({ ...formData, diameter: value })}
                />

                <ComboboxField
                  specType="movement_type"
                  label={specTypeLabels.movement_type}
                  value={formData.movement_type}
                  onChange={(value) => setFormData({ ...formData, movement_type: value })}
                />

                <ComboboxField
                  specType="illumination"
                  label={specTypeLabels.illumination}
                  value={formData.illumination}
                  onChange={(value) => setFormData({ ...formData, illumination: value })}
                />

                <ComboboxField
                  specType="dial_type"
                  label={specTypeLabels.dial_type}
                  value={formData.dial_type}
                  onChange={(value) => setFormData({ ...formData, dial_type: value })}
                />

                <ComboboxField
                  specType="case_color"
                  label={specTypeLabels.case_color}
                  value={formData.case_color}
                  onChange={(value) => setFormData({ ...formData, case_color: value })}
                />

                <ComboboxField
                  specType="style"
                  label={specTypeLabels.style}
                  value={formData.watch_style}
                  onChange={(value) => setFormData({ ...formData, watch_style: value })}
                />

                <ComboboxField
                  specType="indication_type"
                  label={specTypeLabels.indication_type}
                  value={formData.indication_type}
                  onChange={(value) => setFormData({ ...formData, indication_type: value })}
                />

                <ComboboxField
                  specType="case_material"
                  label={specTypeLabels.case_material}
                  value={formData.case_material}
                  onChange={(value) => setFormData({ ...formData, case_material: value })}
                />

                <ComboboxField
                  specType="strap_material"
                  label={specTypeLabels.strap_material}
                  value={formData.strap_material}
                  onChange={(value) => setFormData({ ...formData, strap_material: value })}
                />

                <ComboboxField
                  specType="dial_color"
                  label={specTypeLabels.dial_color}
                  value={formData.dial_color}
                  onChange={(value) => setFormData({ ...formData, dial_color: value })}
                />

                <ComboboxField
                  specType="case_shape"
                  label={specTypeLabels.case_shape}
                  value={formData.case_shape}
                  onChange={(value) => setFormData({ ...formData, case_shape: value })}
                />

                <ComboboxField
                  specType="water_resistance"
                  label={specTypeLabels.water_resistance}
                  value={formData.water_resistance}
                  onChange={(value) => setFormData({ ...formData, water_resistance: value })}
                />

                <ComboboxField
                  specType="strap_color"
                  label={specTypeLabels.strap_color}
                  value={formData.strap_color}
                  onChange={(value) => setFormData({ ...formData, strap_color: value })}
                />

                <div className="flex items-center space-x-2">
                  <Switch
                    id="date_indication"
                    checked={formData.date_indication}
                    onCheckedChange={(checked) => setFormData({ ...formData, date_indication: checked })}
                  />
                  <Label htmlFor="date_indication">Індикація дати</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="day_indication"
                    checked={formData.day_indication}
                    onCheckedChange={(checked) => setFormData({ ...formData, day_indication: checked })}
                  />
                  <Label htmlFor="day_indication">Індикація дня тижня</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL зображення*</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Оновити' : 'Додати'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Зображення</TableHead>
              <TableHead>Назва</TableHead>
              <TableHead>Бренд</TableHead>
              <TableHead>Ціна</TableHead>
              <TableHead>Залишок</TableHead>
              <TableHead>Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>₴{product.price}</TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Products;
