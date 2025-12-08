-- Make user_id nullable for guest orders
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Add guest_email column for guest orders
ALTER TABLE public.orders ADD COLUMN guest_email text;

-- Add constraint: either user_id or guest_email must be present
ALTER TABLE public.orders ADD CONSTRAINT orders_user_or_guest_check 
CHECK (user_id IS NOT NULL OR guest_email IS NOT NULL);

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

-- Create new INSERT policy that allows both authenticated users and guests
CREATE POLICY "Users and guests can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND user_id IS NULL AND guest_email IS NOT NULL)
);

-- Update SELECT policy to allow guests to view their orders by email
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users and admins can view orders" 
ON public.orders 
FOR SELECT 
USING ((auth.uid() = user_id) OR is_admin(auth.uid()));

-- Similarly update order_items INSERT policy
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;

CREATE POLICY "Users and guests can create order items" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      (orders.user_id = auth.uid()) OR 
      (orders.user_id IS NULL AND orders.guest_email IS NOT NULL)
    )
  )
);