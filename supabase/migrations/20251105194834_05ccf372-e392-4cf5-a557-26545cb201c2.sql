-- Create reviews table
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Authenticated users can create reviews for products they purchased
CREATE POLICY "Users can create reviews for purchased products"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE o.user_id = auth.uid() 
    AND oi.product_id = reviews.product_id
  )
);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
ON public.reviews
FOR ALL
USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();