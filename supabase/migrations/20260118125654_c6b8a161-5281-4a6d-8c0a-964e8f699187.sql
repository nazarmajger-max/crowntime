-- Create table for brand catalog images
CREATE TABLE public.brand_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name text NOT NULL UNIQUE,
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for model series catalog images
CREATE TABLE public.model_series_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_name text NOT NULL,
  model_series_name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(brand_name, model_series_name)
);

-- Enable RLS
ALTER TABLE public.brand_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_series_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for brand_images
CREATE POLICY "Brand images are viewable by everyone"
ON public.brand_images
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage brand images"
ON public.brand_images
FOR ALL
USING (is_admin(auth.uid()));

-- RLS policies for model_series_images
CREATE POLICY "Model series images are viewable by everyone"
ON public.model_series_images
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage model series images"
ON public.model_series_images
FOR ALL
USING (is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_brand_images_updated_at
BEFORE UPDATE ON public.brand_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_model_series_images_updated_at
BEFORE UPDATE ON public.model_series_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();