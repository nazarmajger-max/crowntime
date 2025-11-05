-- First, drop the old check constraint
ALTER TABLE public.product_specifications 
DROP CONSTRAINT IF EXISTS product_specifications_spec_type_check;

-- Then update existing data to match new naming
UPDATE public.product_specifications 
SET spec_type = 'glass_type' 
WHERE spec_type = 'glass';

UPDATE public.product_specifications 
SET spec_type = 'watch_style' 
WHERE spec_type = 'style';

-- Finally, add updated check constraint with all spec types
ALTER TABLE public.product_specifications 
ADD CONSTRAINT product_specifications_spec_type_check 
CHECK (spec_type = ANY (ARRAY[
  'brand',
  'gender',
  'glass_type',
  'diameter',
  'movement_type',
  'illumination',
  'dial_type',
  'case_color',
  'date_indication',
  'day_indication',
  'watch_style',
  'indication_type',
  'case_material',
  'strap_material',
  'dial_color',
  'case_shape',
  'water_resistance',
  'strap_color'
]));