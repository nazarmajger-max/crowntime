import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Upload, Link as LinkIcon, X } from 'lucide-react';
import { toast } from 'sonner';

interface BrandImage {
  id?: string;
  brand_name: string;
  image_url: string;
  productCount?: number;
}

interface ModelSeriesImage {
  id?: string;
  brand_name: string;
  model_series_name: string;
  image_url: string;
  productCount?: number;
}

// Domain whitelist for trusted image hosting services
const ALLOWED_IMAGE_DOMAINS = [
  'smjdiqfdgbmxecfcyhps.supabase.co',
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
    if (parsed.protocol !== 'https:') return false;
    if (/^(10|127|172\.(1[6-9]|2[0-9]|3[01])|192\.168|169\.254|localhost)/.test(parsed.hostname)) return false;
    const isAllowedDomain = ALLOWED_IMAGE_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
    if (!isAllowedDomain) return false;
    return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(parsed.pathname);
  } catch {
    return false;
  }
};

const CatalogImages = () => {
  const [brands, setBrands] = useState<BrandImage[]>([]);
  const [modelSeries, setModelSeries] = useState<ModelSeriesImage[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BrandImage | ModelSeriesImage | null>(null);
  const [editType, setEditType] = useState<'brand' | 'series'>('brand');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchModelSeries(selectedBrand);
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      // Get all products grouped by brand
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('brand')
        .eq('is_active', true);

      if (productsError) throw productsError;

      const brandCounts: { [key: string]: number } = {};
      productsData?.forEach(product => {
        if (product.brand) {
          brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
        }
      });

      // Get existing brand images
      const { data: brandImagesData, error: brandImagesError } = await supabase
        .from('brand_images')
        .select('*');

      if (brandImagesError) throw brandImagesError;

      const brandImagesMap: { [key: string]: string } = {};
      brandImagesData?.forEach(img => {
        brandImagesMap[img.brand_name] = img.image_url;
      });

      // Combine data
      const brandsWithImages: BrandImage[] = Object.entries(brandCounts).map(([name, count]) => ({
        brand_name: name,
        image_url: brandImagesMap[name] || '',
        productCount: count,
        id: brandImagesData?.find(b => b.brand_name === name)?.id,
      }));

      brandsWithImages.sort((a, b) => a.brand_name.localeCompare(b.brand_name));
      setBrands(brandsWithImages);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Помилка завантаження брендів');
    } finally {
      setLoading(false);
    }
  };

  const fetchModelSeries = async (brand: string) => {
    setLoading(true);
    try {
      // Get all products for this brand
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('model_series')
        .eq('is_active', true)
        .eq('brand', brand);

      if (productsError) throw productsError;

      const seriesCounts: { [key: string]: number } = {};
      productsData?.forEach(product => {
        const series = product.model_series || 'Інші моделі';
        seriesCounts[series] = (seriesCounts[series] || 0) + 1;
      });

      // Get existing model series images
      const { data: seriesImagesData, error: seriesImagesError } = await supabase
        .from('model_series_images')
        .select('*')
        .eq('brand_name', brand);

      if (seriesImagesError) throw seriesImagesError;

      const seriesImagesMap: { [key: string]: string } = {};
      seriesImagesData?.forEach(img => {
        seriesImagesMap[img.model_series_name] = img.image_url;
      });

      // Combine data
      const seriesWithImages: ModelSeriesImage[] = Object.entries(seriesCounts).map(([name, count]) => ({
        brand_name: brand,
        model_series_name: name,
        image_url: seriesImagesMap[name] || '',
        productCount: count,
        id: seriesImagesData?.find(s => s.model_series_name === name)?.id,
      }));

      // Sort with "Інші моделі" at the end
      seriesWithImages.sort((a, b) => {
        if (a.model_series_name === 'Інші моделі') return 1;
        if (b.model_series_name === 'Інші моделі') return -1;
        return a.model_series_name.localeCompare(b.model_series_name);
      });

      setModelSeries(seriesWithImages);
    } catch (error) {
      console.error('Error fetching model series:', error);
      toast.error('Помилка завантаження серій моделей');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBrand = (brand: BrandImage) => {
    setEditType('brand');
    setEditingItem(brand);
    setImageUrl(brand.image_url || '');
    setPreviewUrl(brand.image_url || null);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleEditSeries = (series: ModelSeriesImage) => {
    setEditType('series');
    setEditingItem(series);
    setImageUrl(series.image_url || '');
    setPreviewUrl(series.image_url || null);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setImageUrl('');
    e.target.value = '';
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url && isValidImageUrl(url)) {
      setPreviewUrl(url);
      setSelectedFile(null);
    }
  };

  const handleSave = async () => {
    if (!editingItem) return;

    if (!selectedFile && !imageUrl) {
      toast.error('Додайте зображення');
      return;
    }

    if (imageUrl && !isValidImageUrl(imageUrl)) {
      toast.error('Невірний URL. Дозволені лише HTTPS посилання з довірених джерел');
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = imageUrl;

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `catalog-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          toast.error(`Помилка завантаження: ${uploadError.message}`);
          setIsUploading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);

        finalImageUrl = publicUrlData.publicUrl;
      }

      if (editType === 'brand') {
        const brandItem = editingItem as BrandImage;
        
        if (brandItem.id) {
          // Update existing
          const { error } = await supabase
            .from('brand_images')
            .update({ image_url: finalImageUrl })
            .eq('id', brandItem.id);

          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('brand_images')
            .insert({
              brand_name: brandItem.brand_name,
              image_url: finalImageUrl,
            });

          if (error) throw error;
        }

        toast.success('Зображення бренду оновлено');
        fetchBrands();
      } else {
        const seriesItem = editingItem as ModelSeriesImage;

        if (seriesItem.id) {
          // Update existing
          const { error } = await supabase
            .from('model_series_images')
            .update({ image_url: finalImageUrl })
            .eq('id', seriesItem.id);

          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('model_series_images')
            .insert({
              brand_name: seriesItem.brand_name,
              model_series_name: seriesItem.model_series_name,
              image_url: finalImageUrl,
            });

          if (error) throw error;
        }

        toast.success('Зображення серії оновлено');
        fetchModelSeries(seriesItem.brand_name);
      }

      setIsDialogOpen(false);
      resetDialog();
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Помилка збереження');
    } finally {
      setIsUploading(false);
    }
  };

  const resetDialog = () => {
    setEditingItem(null);
    setImageUrl('');
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleRemoveImage = async () => {
    if (!editingItem) return;

    try {
      if (editType === 'brand') {
        const brandItem = editingItem as BrandImage;
        if (brandItem.id) {
          const { error } = await supabase
            .from('brand_images')
            .delete()
            .eq('id', brandItem.id);

          if (error) throw error;
          toast.success('Зображення видалено');
          fetchBrands();
        }
      } else {
        const seriesItem = editingItem as ModelSeriesImage;
        if (seriesItem.id) {
          const { error } = await supabase
            .from('model_series_images')
            .delete()
            .eq('id', seriesItem.id);

          if (error) throw error;
          toast.success('Зображення видалено');
          fetchModelSeries(seriesItem.brand_name);
        }
      }

      setIsDialogOpen(false);
      resetDialog();
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Помилка видалення');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Зображення каталогу</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Управління зображеннями брендів та серій моделей для каталогу
        </p>
      </div>

      <Tabs value={selectedBrand || 'brands'} onValueChange={(v) => {
        if (v === 'brands') {
          setSelectedBrand(null);
        } else {
          setSelectedBrand(v);
        }
      }}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="brands" className="text-sm">
            Бренди
          </TabsTrigger>
          {brands.map(brand => (
            <TabsTrigger key={brand.brand_name} value={brand.brand_name} className="text-sm">
              {brand.brand_name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="brands" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {brands.map(brand => (
                <div
                  key={brand.brand_name}
                  className="relative group bg-card border border-border rounded-lg p-4 flex flex-col items-center"
                >
                  <div className="w-full aspect-square mb-3 flex items-center justify-center overflow-hidden bg-muted rounded">
                    {brand.image_url ? (
                      <img
                        src={brand.image_url}
                        alt={brand.brand_name}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-muted-foreground text-xs text-center px-2">
                        Немає зображення
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-center">{brand.brand_name}</h3>
                  <p className="text-xs text-muted-foreground">{brand.productCount} товарів</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => handleEditBrand(brand)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Змінити
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {brands.map(brand => (
          <TabsContent key={brand.brand_name} value={brand.brand_name} className="mt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {modelSeries.map(series => (
                  <div
                    key={series.model_series_name}
                    className="relative group bg-card border border-border rounded-lg p-4 flex flex-col items-center"
                  >
                    <div className="w-full aspect-square mb-3 flex items-center justify-center overflow-hidden bg-muted rounded">
                      {series.image_url ? (
                        <img
                          src={series.image_url}
                          alt={series.model_series_name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs text-center px-2">
                          Немає зображення
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm text-center">{series.model_series_name}</h3>
                    <p className="text-xs text-muted-foreground">{series.productCount} товарів</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleEditSeries(series)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Змінити
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetDialog();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editType === 'brand' 
                ? `Зображення бренду: ${(editingItem as BrandImage)?.brand_name}`
                : `Зображення серії: ${(editingItem as ModelSeriesImage)?.model_series_name}`
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview */}
            <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-muted-foreground">Попередній перегляд</span>
              )}
            </div>

            {/* Upload file */}
            <div className="space-y-2">
              <Label>Завантажити файл</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="catalog-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('catalog-image-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Обрати файл
                </Button>
              </div>
              {selectedFile && (
                <p className="text-xs text-muted-foreground">{selectedFile.name}</p>
              )}
            </div>

            {/* Or URL */}
            <div className="space-y-2">
              <Label>Або вставити URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleUrlChange(imageUrl)}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {editingItem && (editType === 'brand' ? (editingItem as BrandImage).id : (editingItem as ModelSeriesImage).id) && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4 mr-2" />
                  Видалити
                </Button>
              )}
              <Button
                type="button"
                className="flex-1"
                onClick={handleSave}
                disabled={isUploading}
              >
                {isUploading ? 'Збереження...' : 'Зберегти'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CatalogImages;