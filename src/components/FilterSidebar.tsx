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
  availableTypes: string[];
  availableGenders: string[];
  availableCaseMaterials: string[];
  availableDialColors: string[];
  products?: Product[];
}

export const FilterSidebar = ({ 
  filters, 
  onFiltersChange, 
  availableBrands,
  availableTypes,
  availableGenders,
  availableCaseMaterials,
  availableDialColors,
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

  return (
    <aside className="w-full md:w-64 md:border-r md:bg-muted/30 md:p-6">
      <h2 className="font-display text-2xl font-semibold mb-6 hidden md:block">Фільтри</h2>
      
      <ScrollArea className="h-full md:h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="font-body font-semibold mb-4">Діапазон цін</h3>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Від (₴)</Label>
                <Input
                  type="number"
                  min={0}
                  max={10000}
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(10000, Number(e.target.value) || 0));
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
                  max={10000}
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(10000, Number(e.target.value) || 10000));
                    onFiltersChange({ ...filters, priceRange: [filters.priceRange[0], value] });
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Brand with Model Series */}
          {availableBrands.length > 0 && (
            <div>
              <h3 className="font-body font-semibold mb-3">Виробники</h3>
              <div className="space-y-2">
                {availableBrands.sort().map(brand => {
                  const models = brandsWithModels.get(brand) || [];
                  const hasModels = models.some(m => m.name !== 'Інші');
                  const isExpanded = expandedBrand === brand;
                  const isSelected = filters.brands.includes(brand);
                  
                  return (
                    <div key={brand} className="border rounded-lg overflow-hidden">
                      {/* Brand Header */}
                      <button
                        onClick={() => handleBrandClick(brand)}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 transition-colors text-left",
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted/50 hover:bg-muted"
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
                                  "flex flex-col items-center p-2 rounded-lg border transition-all",
                                  isModelSelected
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                                )}
                              >
                                <div className="aspect-square w-full max-w-[60px] mb-1.5 overflow-hidden rounded-md bg-muted">
                                  <img
                                    src={model.image}
                                    alt={model.name}
                                    className="h-full w-full object-cover"
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

          {/* Gender */}
          {availableGenders.length > 0 && (
            <div>
              <h3 className="font-body font-semibold mb-3">Стать</h3>
              <div className="space-y-2">
                {availableGenders.map(gender => (
                  <div key={gender} className="flex items-center gap-2">
                    <Checkbox
                      id={`gender-${gender}`}
                      checked={filters.gender.includes(gender)}
                      onCheckedChange={() => handleCheckboxChange('gender', gender)}
                    />
                    <Label htmlFor={`gender-${gender}`} className="font-body text-sm cursor-pointer capitalize">
                      {gender === 'men' ? 'Чоловіча' : gender === 'women' ? 'Жіноча' : 'Унісекс'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Type */}
          {availableTypes.length > 0 && (
            <div>
              <h3 className="font-body font-semibold mb-3">Тип</h3>
              <div className="space-y-2">
                {availableTypes.map(type => (
                  <div key={type} className="flex items-center gap-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={filters.type.includes(type)}
                      onCheckedChange={() => handleCheckboxChange('type', type)}
                    />
                    <Label htmlFor={`type-${type}`} className="font-body text-sm cursor-pointer capitalize">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Case Material */}
          {availableCaseMaterials.length > 0 && (
            <div>
              <h3 className="font-body font-semibold mb-3">Матеріал корпусу</h3>
              <div className="space-y-2">
                {availableCaseMaterials.map(material => (
                  <div key={material} className="flex items-center gap-2">
                    <Checkbox
                      id={`material-${material}`}
                      checked={filters.caseMaterial.includes(material)}
                      onCheckedChange={() => handleCheckboxChange('caseMaterial', material)}
                    />
                    <Label htmlFor={`material-${material}`} className="font-body text-sm cursor-pointer">
                      {material}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dial Color */}
          {availableDialColors.length > 0 && (
            <div>
              <h3 className="font-body font-semibold mb-3">Колір циферблату</h3>
              <div className="space-y-2">
                {availableDialColors.map(color => (
                  <div key={color} className="flex items-center gap-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={filters.dialColor.includes(color)}
                      onCheckedChange={() => handleCheckboxChange('dialColor', color)}
                    />
                    <Label htmlFor={`color-${color}`} className="font-body text-sm cursor-pointer">
                      {color}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};
