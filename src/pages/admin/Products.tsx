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
import { Plus, Pencil, Trash2, Check, ChevronsUpDown, X, Upload, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  glass_type: 'Скло',
  diameter: 'Діаметр',
  movement_type: 'Тип механізму',
  illumination: 'Підсвічування',
  dial_type: 'Тип циферблату',
  case_color: 'Колір корпусу',
  watch_style: 'Стиль',
  indication_type: 'Тип індикації',
  case_material: 'Матеріал корпусу',
  strap_material: 'Матеріал браслета/ремінця',
  dial_color: 'Колір циферблату',
  case_shape: 'Форма корпусу',
  water_resistance: 'Водозахист',
  strap_color: 'Колір браслета/ремінця',
};

interface ProductImage {
  id?: string;
  image_url: string;
  position: number;
  file?: File;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
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

  const handleAddNewSpecification = async (specType: string, value: string) => {
    if (!value.trim()) {
      toast.error('Введіть значення характеристики');
      return false;
    }

    const { error } = await supabase
      .from('product_specifications')
      .insert([{ spec_type: specType, value: value.trim() }]);

    if (error) {
      if (error.code === '23505') {
        toast.error('Така характеристика вже існує');
      } else {
        console.error('Error adding specification:', error);
        toast.error('Помилка додавання характеристики: ' + error.message);
      }
      return false;
    }

    toast.success('Характеристика додана');
    await fetchSpecifications();
    return true;
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Помилка завантаження зображення');
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (productImages.length + files.length > 5) {
      toast.error('Максимум 5 зображень');
      return;
    }

    setIsUploading(true);
    const newImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newImages.push({
        image_url: url,
        position: productImages.length + i,
        file: file,
      });
    }

    setProductImages([...productImages, ...newImages]);
    setIsUploading(false);
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) {
      toast.error('Введіть URL зображення');
      return;
    }

    if (productImages.length >= 5) {
      toast.error('Максимум 5 зображень');
      return;
    }

    setProductImages([...productImages, {
      image_url: newImageUrl,
      position: productImages.length,
    }]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages.map((img, i) => ({ ...img, position: i })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (productImages.length === 0) {
      toast.error('Додайте хоча б одне зображення');
      return;
    }

    setIsUploading(true);

    try {
      // Upload files to storage
      const uploadedImages: ProductImage[] = [];
      for (const img of productImages) {
        if (img.file) {
          const url = await uploadImageToStorage(img.file);
          if (url) {
            uploadedImages.push({ ...img, image_url: url });
          }
        } else {
          uploadedImages.push(img);
        }
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        in_stock: parseInt(formData.stock_quantity) > 0,
        category: formData.category || 'Годинники',
        image_url: uploadedImages[0]?.image_url || '',
      };

      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) {
          toast.error('Помилка оновлення товару');
          setIsUploading(false);
          return;
        }
        productId = editingProduct.id;

      // Delete old images
      const { error: deleteError } = await supabase
        .from('product_images' as any)
        .delete()
        .eq('product_id', productId);

      if (deleteError) {
        console.error('Error deleting old images:', deleteError);
      }
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error || !data) {
          toast.error('Помилка додавання товару');
          setIsUploading(false);
          return;
        }
        productId = data.id;
      }

      // Save images to product_images table
      const imageRecords = uploadedImages.map((img) => ({
        product_id: productId,
        image_url: img.image_url,
        position: img.position,
      }));

      const { error: imagesError } = await supabase
        .from('product_images' as any)
        .insert(imageRecords);

      if (imagesError) {
        console.error('Error saving images:', imagesError);
        toast.error('Помилка збереження зображень');
        setIsUploading(false);
        return;
      }

      toast.success(editingProduct ? 'Товар оновлено' : 'Товар додано');
      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Виникла помилка');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (product: Product) => {
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

    // Fetch product images
    const { data: images, error } = await supabase
      .from('product_images' as any)
      .select('*')
      .eq('product_id', product.id)
      .order('position');

    if (!error && images) {
      setProductImages(images.map((img: any) => ({
        id: img.id,
        image_url: img.image_url,
        position: img.position,
      })));
    }

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
    setProductImages([]);
    setNewImageUrl('');
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
    const [isAdding, setIsAdding] = useState(false);
    const [newValue, setNewValue] = useState('');
    const options = getSpecificationsByType(specType);

    const handleAddClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsAdding(true);
      setNewValue('');
    };

    const handleCancelClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsAdding(false);
      setNewValue('');
    };

    const handleSubmitNew = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const success = await handleAddNewSpecification(specType, newValue);
      if (success) {
        setIsAdding(false);
        setNewValue('');
      }
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
            <Command shouldFilter={!isAdding}>
              <CommandInput 
                placeholder={`Шукати ${label.toLowerCase()}...`}
                disabled={isAdding}
              />
              <CommandList className="max-h-[300px]">
                {!isAdding && (
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
              {isAdding ? (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={newValue}
                    onChange={(e) => {
                      e.stopPropagation();
                      setNewValue(e.target.value);
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
                  specType="glass_type"
                  label={specTypeLabels.glass_type}
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
                  specType="watch_style"
                  label={specTypeLabels.watch_style}
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

              <div className="space-y-4">
                <Label>Зображення товару* (до 5 фото)</Label>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Завантажити файл
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Додати URL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        disabled={productImages.length >= 5 || isUploading}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                        disabled={productImages.length >= 5 || isUploading}
                      >
                        Обрати файли
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="url" className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        disabled={productImages.length >= 5}
                      />
                      <Button
                        type="button"
                        onClick={handleAddImageUrl}
                        disabled={productImages.length >= 5}
                      >
                        Додати
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
                
                {productImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-4 mt-4">
                    {productImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.image_url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                            Головне
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  {productImages.length}/5 зображень додано. Перше зображення буде головним.
                </p>
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>
                  Скасувати
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Завантаження...' : (editingProduct ? 'Оновити' : 'Додати')}
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
