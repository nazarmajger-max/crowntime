import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Filters } from '@/types/product';
import { genders, types, caseMaterials, dialColors } from '@/data/products';

interface FilterSidebarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableBrands: string[];
}

export const FilterSidebar = ({ filters, onFiltersChange, availableBrands }: FilterSidebarProps) => {
  const handleCheckboxChange = (category: keyof Omit<Filters, 'priceRange'>, value: string) => {
    const currentValues = filters[category] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [category]: newValues });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: [value[0], value[1]] });
  };

  return (
    <aside className="w-64 border-r bg-muted/30 p-6">
      <h2 className="font-display text-2xl font-semibold mb-6">Filters</h2>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="font-body font-semibold mb-4">Price Range</h3>
            <div className="px-2">
              <Slider
                min={0}
                max={10000}
                step={100}
                value={[filters.priceRange[0], filters.priceRange[1]]}
                onValueChange={handlePriceChange}
                className="mb-4"
              />
              <div className="flex justify-between font-body text-sm text-muted-foreground">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Brand */}
          {availableBrands.length > 0 && (
            <div>
              <h3 className="font-body font-semibold mb-3">Brand</h3>
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
          <div>
            <h3 className="font-body font-semibold mb-3">Gender</h3>
            <div className="space-y-2">
              {genders.map(gender => (
                <div key={gender} className="flex items-center gap-2">
                  <Checkbox
                    id={`gender-${gender}`}
                    checked={filters.gender.includes(gender)}
                    onCheckedChange={() => handleCheckboxChange('gender', gender)}
                  />
                  <Label htmlFor={`gender-${gender}`} className="font-body text-sm cursor-pointer capitalize">
                    {gender}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <h3 className="font-body font-semibold mb-3">Type</h3>
            <div className="space-y-2">
              {types.map(type => (
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

          {/* Case Material */}
          <div>
            <h3 className="font-body font-semibold mb-3">Case Material</h3>
            <div className="space-y-2">
              {caseMaterials.map(material => (
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

          {/* Dial Color */}
          <div>
            <h3 className="font-body font-semibold mb-3">Dial Color</h3>
            <div className="space-y-2">
              {dialColors.map(color => (
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
        </div>
      </ScrollArea>
    </aside>
  );
};
