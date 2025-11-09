import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filters } from '@/types/product';

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableBrands: string[];
  availableTypes: string[];
  availableGenders: string[];
  availableCaseMaterials: string[];
  availableDialColors: string[];
}

export const FilterSidebar = ({ 
  filters, 
  onFiltersChange, 
  availableBrands,
  availableTypes,
  availableGenders,
  availableCaseMaterials,
  availableDialColors
}: FilterSidebarProps) => {
  const handleCheckboxChange = (category: keyof Omit<Filters, 'priceRange'>, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [category]: newValues });
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

          {/* Brand */}
          {availableBrands.length > 0 && (
            <div>
              <h3 className="font-body font-semibold mb-3">Бренд</h3>
              <div className="space-y-2">
                {availableBrands.sort().map(brand => (
                  <div key={brand} className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={filters.brands.includes(brand)}
                      onCheckedChange={() => handleCheckboxChange('brands', brand)}
                    />
                    <Label htmlFor={`brand-${brand}`} className="font-body text-sm cursor-pointer">
                      {brand}
                    </Label>
                  </div>
                ))}
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
