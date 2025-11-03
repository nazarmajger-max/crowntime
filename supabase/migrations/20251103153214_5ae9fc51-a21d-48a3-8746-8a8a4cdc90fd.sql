-- Create product_specifications table for managing all watch specifications
CREATE TABLE IF NOT EXISTS product_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spec_type TEXT NOT NULL CHECK (spec_type IN ('glass', 'diameter', 'movement_type', 'illumination', 'dial_type', 'case_color', 'date_indication', 'day_indication', 'style', 'indication_type', 'case_material', 'strap_material', 'dial_color', 'case_shape', 'water_resistance', 'strap_color')),
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(spec_type, value)
);

-- Enable RLS
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;

-- Anyone can view specifications
CREATE POLICY "Anyone can view specifications"
ON product_specifications FOR SELECT
USING (true);

-- Only admins can insert specifications
CREATE POLICY "Admins can insert specifications"
ON product_specifications FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Only admins can delete specifications
CREATE POLICY "Admins can delete specifications"
ON product_specifications FOR DELETE
USING (is_admin(auth.uid()));

-- Add new columns to products table for detailed specifications
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS glass_type TEXT,
ADD COLUMN IF NOT EXISTS diameter TEXT,
ADD COLUMN IF NOT EXISTS illumination TEXT,
ADD COLUMN IF NOT EXISTS dial_type TEXT,
ADD COLUMN IF NOT EXISTS case_color TEXT,
ADD COLUMN IF NOT EXISTS date_indication BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS day_indication BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS watch_style TEXT,
ADD COLUMN IF NOT EXISTS indication_type TEXT,
ADD COLUMN IF NOT EXISTS case_shape TEXT,
ADD COLUMN IF NOT EXISTS strap_material TEXT,
ADD COLUMN IF NOT EXISTS strap_color TEXT,
ADD COLUMN IF NOT EXISTS model_code TEXT;

-- Insert some default specifications for different types
INSERT INTO product_specifications (spec_type, value) VALUES
  ('glass', 'Мінеральне'),
  ('glass', 'Сапфірове'),
  ('glass', 'Пластикове'),
  ('diameter', '38 мм'),
  ('diameter', '40 мм'),
  ('diameter', '42 мм'),
  ('diameter', '44 мм'),
  ('movement_type', 'Кварцовий'),
  ('movement_type', 'Автоматичний'),
  ('movement_type', 'Механічний'),
  ('illumination', 'Без підсвічування'),
  ('illumination', 'LED'),
  ('illumination', 'Люмінесцентне'),
  ('dial_type', 'Аналоговий'),
  ('dial_type', 'Цифровий'),
  ('dial_type', 'Комбінований'),
  ('case_color', 'Срібний'),
  ('case_color', 'Золотий'),
  ('case_color', 'Чорний'),
  ('case_color', 'Рожеве золото'),
  ('style', 'Класика'),
  ('style', 'Спорт'),
  ('style', 'Casual'),
  ('style', 'Діловий'),
  ('indication_type', 'Арабські цифри'),
  ('indication_type', 'Римські цифри'),
  ('indication_type', 'Індекси'),
  ('case_material', 'Латунь'),
  ('case_material', 'Нержавіюча сталь'),
  ('case_material', 'Титан'),
  ('case_material', 'Пластик'),
  ('strap_material', 'Нержавіюча сталь'),
  ('strap_material', 'Шкіра'),
  ('strap_material', 'Силікон'),
  ('strap_material', 'Каучук'),
  ('dial_color', 'Синій'),
  ('dial_color', 'Чорний'),
  ('dial_color', 'Білий'),
  ('dial_color', 'Срібний'),
  ('dial_color', 'Золотий'),
  ('case_shape', 'Кругла'),
  ('case_shape', 'Квадратна'),
  ('case_shape', 'Прямокутна'),
  ('water_resistance', 'WR30/30м'),
  ('water_resistance', 'WR50/50м'),
  ('water_resistance', 'WR100/100м'),
  ('water_resistance', 'WR200/200м'),
  ('strap_color', 'Срібний'),
  ('strap_color', 'Чорний'),
  ('strap_color', 'Коричневий'),
  ('strap_color', 'Синій')
ON CONFLICT (spec_type, value) DO NOTHING;