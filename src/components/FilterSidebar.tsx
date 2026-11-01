import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filters, Product } from '@/types/product';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelSeriesInfo {
  name: string;
  image: string;
  count: number;
}

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableBrands: string[];
  availableMovements: string[];
  availableDiameters: string[];
  products?: Product[];
}

export const FilterSidebar = ({ 
  filters, 
  onFiltersChange, 
  availableBrands,
  availableMovements,
  availableDiameters,
  products = []
}: FilterSidebarProps) => {
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  const handleCheckboxChange = (category: keyof Omit<Filters, 'priceRange'>, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [category]: newValues });
  };

  // Get unique model series per brand
  const brandsWithModels = useMemo(() => {
    const brandMap = new Map<string, ModelSeriesInfo[]>();
    
    products.forEach((product) => {
      if (!product.brand) return;
      
      if (!brandMap.has(product.brand)) {
        brandMap.set(product.brand, []);
      }
      
      const models = brandMap.get(product.brand)!;
      const modelName = product.modelSeries || 'Інші';
      const existingModel = models.find(m => m.name === modelName);
      
      if (existingModel) {
        existingModel.count++;
        if (product.modelSeriesImage && existingModel.image === '/placeholder.svg') {
          existingModel.image = product.modelSeriesImage;
        }
      } else {
        models.push({
          name: modelName,
          image: product.modelSeriesImage || product.image || '/placeholder.svg',
          count: 1,
        });
      }
    });
    
    return brandMap;
  }, [products]);

  const handleBrandClick = (brand: string) => {
    if (expandedBrand === brand) {
      setExpandedBrand(null);
    } else {
      setExpandedBrand(brand);
    }
    
    // Toggle brand filter
    handleCheckboxChange('brands', brand);
  };

  const handleModelClick = (modelSeries: string) => {
    handleCheckboxChange('modelSeries', modelSeries);
  };

  const renderCheckGroup = (title: string, key: 'movement' | 'diameter', values: string[]) =>
    values.length > 0 && (
      <fieldset className="border-t pt-6">
        <legend className="eyebrow mb-4 text-foreground">{title}</legend>
        <div className="space-y-3">
          {values.map((v) => (
            <div key={v} className="flex items-center gap-3">
              <Checkbox
                id={`${key}-${v}`}
                checked={filters[key].includes(v)}
                onCheckedChange={() => handleCheckboxChange(key, v)}
                className="rounded-none"
              />
              <Label htmlFor={`${key}-${v}`} className="font-body text-sm font-normal cursor-pointer">{v}</Label>
            </div>
          ))}
        </div>
      </fieldset>
    );

  return (
    <aside className="w-full md:w-64 md:sticky md:top-24 md:self-start" aria-label="Фільтри">
      <h2 className="font-display text-2xl mb-6 hidden md:block">Фільтри</h2>
      
      <ScrollArea className="h-full md:h-[calc(100vh-140px)] md:pr-4">
        <div className="space-y-6 pb-6">
          {/* Price Range */}
          <div>
            <h3 className="eyebrow mb-4 text-foreground">Ціна</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Від (₴)</Label>
                <Input
                  type="number"
                  min={0}
                  max={1000000}
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(1000000, Number(e.target.value) || 0));
                    onFiltersChange({ ...filters, priceRange: [value, filters.priceRange[1]] });
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">До (₴)</Label>
                <Input
                  type="number"
                  min={0}
                  max={1000000}
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(1000000, Number(e.target.value) || 1000000));
                    onFiltersChange({ ...filters, priceRange: [filters.priceRange[0], value] });
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Brand with Model Series */}
          {availableBrands.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="eyebrow mb-4 text-foreground">Бренд</h3>
              <div className="space-y-px">
                {availableBrands.sort().map(brand => {
                  const models = brandsWithModels.get(brand) || [];
                  const hasModels = models.some(m => m.name !== 'Інші');
                  const isExpanded = expandedBrand === brand;
                  const isSelected = filters.brands.includes(brand);
                  
                  return (
                    <div key={brand} className="overflow-hidden">
                      {/* Brand Header */}
                      <button
                        onClick={() => handleBrandClick(brand)}
                        className={cn(
                          "w-full flex items-center justify-between py-2 transition-colors duration-700 text-left border-b border-transparent",
                          isSelected 
                            ? "text-foreground border-gold" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="font-body text-sm font-medium">{brand}</span>
                        {hasModels && (
                          isExpanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          )
                        )}
                      </button>
                      
                      {/* Model Series Grid */}
                      {isExpanded && hasModels && (
                        <div className="grid grid-cols-2 gap-1.5 p-2 bg-background">
                          {models.filter(m => m.name !== 'Інші').map((model) => {
                            const isModelSelected = filters.modelSeries.includes(model.name);
                            return (
                              <button
                                key={model.name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleModelClick(model.name);
                                }}
                                className={cn(
                                  "flex flex-col items-center p-2 border transition-colors duration-700",
                                  isModelSelected
                                    ? "border-gold"
                                    : "border-border hover:border-foreground/40"
                                )}
                              >
                                <div className="aspect-square w-full max-w-[60px] mb-1.5 overflow-hidden bg-stone">
                                  <img
                                    src={model.image}
                                    alt={model.name}
                                    className="h-full w-full object-contain mix-blend-multiply"
                                  />
                                </div>
                                <span className="font-body text-[10px] font-medium text-center line-clamp-2 leading-tight">
                                  {model.name}
                                </span>
                                <span className="text-[9px] text-muted-foreground">
                                  ({model.count})
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {renderCheckGroup('Механізм', 'movement', availableMovements)}
          {renderCheckGroup('Діаметр корпусу', 'diameter', availableDiameters)}
        </div>
      </ScrollArea>
    </aside>
  );
};
