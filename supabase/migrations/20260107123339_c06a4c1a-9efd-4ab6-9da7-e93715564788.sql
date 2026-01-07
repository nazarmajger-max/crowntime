-- Add model_series column to products table
ALTER TABLE public.products
ADD COLUMN model_series text;

-- Add model_series_image column for displaying model category images
ALTER TABLE public.products
ADD COLUMN model_series_image text;

-- Create index for better performance when filtering by model_series
CREATE INDEX idx_products_model_series ON public.products(model_series);
CREATE INDEX idx_products_brand ON public.products(brand);