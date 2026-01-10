import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, X, Upload, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductImage {
  id?: string;
  image_url: string;
  sort_order: number;
  file?: File;
}

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: '',
    model_series: '',
    price: '',
    original_price: '',
    description: '',
    gender: '',
    case_material: '',
    dial_color: '',
    stock_quantity: '',
    case_diameter: '',
    movement_type: '',
    water_resistance: '',
    is_active: true,
    is_featured: false,
  });

  useEffect(() => {
    fetchProducts();
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zа-яіїєґ0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (productImages.length + files.length > 5) {
      toast.error('Максимум 5 зображень');
      return;
    }

    const newImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newImages.push({
        image_url: url,
        sort_order: productImages.length + i,
        file: file,
      });
    }

    setProductImages([...productImages, ...newImages]);
    e.target.value = '';
  };

  // Domain whitelist for trusted image hosting services
  const ALLOWED_IMAGE_DOMAINS = [
    // Project's Supabase storage
    'smjdiqfdgbmxecfcyhps.supabase.co',
    // Common trusted CDNs and image hosts
    'images.unsplash.com',
    'i.imgur.com',
    'cdn.shopify.com',
    'res.cloudinary.com',
    'm.media-amazon.com',
    'images.pexels.com',
    'lh3.googleusercontent.com',
  ];

  const isValidImageUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      // Only allow HTTPS
      if (parsed.protocol !== 'https:') return false;
      // Block internal/private IPs
      if (/^(10|127|172\.(1[6-9]|2[0-9]|3[01])|192\.168|169\.254|localhost)/.test(parsed.hostname)) return false;
      // Validate against domain whitelist
      const isAllowedDomain = ALLOWED_IMAGE_DOMAINS.some(domain => 
        parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
      );
      if (!isAllowedDomain) return false;
      // Validate image extension
      return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  };

  const handleAddImageUrl = () => {
    const trimmedUrl = newImageUrl.trim();
    if (!trimmedUrl) {
      toast.error('Введіть URL зображення');
      return;
    }

    if (!isValidImageUrl(trimmedUrl)) {
      toast.error('Невірний URL. Дозволені лише HTTPS посилання з довірених джерел (Unsplash, Imgur, Cloudinary, Pexels тощо)');
      return;
    }

    if (productImages.length >= 5) {
      toast.error('Максимум 5 зображень');
      return;
    }

    setProductImages([...productImages, {
      image_url: trimmedUrl,
      sort_order: productImages.length,
    }]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages.map((img, i) => ({ ...img, sort_order: i })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (productImages.length === 0) {
      toast.error('Додайте хоча б одне зображення');
      return;
    }

    setIsUploading(true);

    try {
      // Upload files to Supabase Storage
      const uploadedImages: ProductImage[] = [];
      for (const img of productImages) {
        if (img.file) {
          const fileExt = img.file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, img.file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            toast.error(`Помилка завантаження зображення: ${uploadError.message}`);
            setIsUploading(false);
            return;
          }

          // Get public URL
          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(uploadData.path);

          uploadedImages.push({ 
            ...img, 
            image_url: publicUrlData.publicUrl 
          });
        } else {
          // Keep existing URL (for external URLs or already uploaded images)
          uploadedImages.push(img);
        }
      }

      const slug = formData.slug || generateSlug(formData.name);

      const productData = {
        name: formData.name,
        slug,
        brand: formData.brand || null,
        model_series: formData.model_series || null,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        description: formData.description || null,
        gender: formData.gender || null,
        case_material: formData.case_material || null,
        dial_color: formData.dial_color || null,
        case_diameter: formData.case_diameter || null,
        movement_type: formData.movement_type || null,
        water_resistance: formData.water_resistance || null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      };

      let productId: string;

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) {
          if (import.meta.env.DEV) console.error('Update error:', error);
          toast.error('Помилка оновлення товару');
          setIsUploading(false);
          return;
        }
        productId = editingProduct.id;

        // Delete old images from database
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId);

      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (error || !data) {
          if (import.meta.env.DEV) console.error('Insert error:', error);
          toast.error('Помилка додавання товару');
          setIsUploading(false);
          return;
        }
        productId = data.id;
      }

      // Save images to product_images table
      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          const img = uploadedImages[i];

          const { error: imageError } = await supabase
            .from('product_images')
            .insert({
              product_id: productId,
              image_url: img.image_url,
              sort_order: i,
              is_primary: i === 0,
            });

          if (imageError) {
            if (import.meta.env.DEV) console.error('Error saving image:', imageError);
          }
        }
      }

      toast.success(editingProduct ? 'Товар оновлено' : 'Товар додано');
      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error:', error);
      toast.error('Виникла помилка');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      brand: product.brand || '',
      model_series: product.model_series || '',
      price: product.price?.toString() || '',
      original_price: product.original_price?.toString() || '',
      description: product.description || '',
      gender: product.gender || '',
      case_material: product.case_material || '',
      dial_color: product.dial_color || '',
      stock_quantity: product.stock_quantity?.toString() || '0',
      case_diameter: product.case_diameter || '',
      movement_type: product.movement_type || '',
      water_resistance: product.water_resistance || '',
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
    });

    // Fetch product images
    const { data: images, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', product.id)
      .order('sort_order');

    if (!error && images) {
      setProductImages(images.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        sort_order: img.sort_order,
      })));
    } else {
      setProductImages([]);
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
      slug: '',
      brand: '',
      model_series: '',
      price: '',
      original_price: '',
      description: '',
      gender: '',
      case_material: '',
      dial_color: '',
      stock_quantity: '',
      case_diameter: '',
      movement_type: '',
      water_resistance: '',
      is_active: true,
      is_featured: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Товари</h1>
          <p className="text-sm md:text-base text-muted-foreground">Управління каталогом товарів</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Додати товар
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Редагувати товар' : 'Додати новий товар'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Назва *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Бренд</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Casio, Tissot, Longines..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model_series">Серія моделей</Label>
                  <Input
                    id="model_series"
                    value={formData.model_series}
                    onChange={(e) => setFormData({ ...formData, model_series: e.target.value })}
                    placeholder="G-Shock, Edifice, PRO TREK..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Ціна *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Стара ціна</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Кількість на складі</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Стать</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
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
                <div className="space-y-2">
                  <Label htmlFor="case_material">Матеріал корпусу</Label>
                  <Input
                    id="case_material"
                    value={formData.case_material}
                    onChange={(e) => setFormData({ ...formData, case_material: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dial_color">Колір циферблату</Label>
                  <Input
                    id="dial_color"
                    value={formData.dial_color}
                    onChange={(e) => setFormData({ ...formData, dial_color: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="case_diameter">Діаметр корпусу</Label>
                  <Input
                    id="case_diameter"
                    value={formData.case_diameter}
                    onChange={(e) => setFormData({ ...formData, case_diameter: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="movement_type">Тип механізму</Label>
                  <Input
                    id="movement_type"
                    value={formData.movement_type}
                    onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="water_resistance">Водозахист</Label>
                  <Input
                    id="water_resistance"
                    value={formData.water_resistance}
                    onChange={(e) => setFormData({ ...formData, water_resistance: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Активний</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Рекомендований</Label>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4">
                <Label>Зображення (макс. 5)</Label>
                
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Завантажити
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      URL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={productImages.length >= 5}
                    />
                  </TabsContent>
                  <TabsContent value="url" className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="URL зображення"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                      />
                      <Button type="button" onClick={handleAddImageUrl} disabled={productImages.length >= 5}>
                        Додати
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                {productImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {productImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <img
                          src={img.image_url}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                            Головне
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Скасувати
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Збереження...' : (editingProduct ? 'Оновити' : 'Додати')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Бренд</TableHead>
              <TableHead>Ціна</TableHead>
              <TableHead>Склад</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.brand || '—'}</TableCell>
                <TableCell>₴{product.price}</TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>
                  {product.is_active ? (
                    <span className="text-green-600">Активний</span>
                  ) : (
                    <span className="text-muted-foreground">Неактивний</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.brand || '—'}</p>
              </div>
              {product.is_active ? (
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Активний</span>
              ) : (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Неактивний</span>
              )}
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ціна:</span>
              <span className="font-semibold">₴{product.price}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">На складі:</span>
              <span>{product.stock_quantity} шт.</span>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                <Pencil className="h-4 w-4 mr-2" />
                Редагувати
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;