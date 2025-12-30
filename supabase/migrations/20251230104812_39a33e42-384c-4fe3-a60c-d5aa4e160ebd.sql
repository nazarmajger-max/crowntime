-- Drop the old INSERT policy for orders
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;

-- Create new INSERT policy that allows guest orders without email
CREATE POLICY "Users and guests can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Logged-in users can create orders for themselves
  ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id))
  OR 
  -- Guest users can create orders (no auth, no user_id)
  ((auth.uid() IS NULL) AND (user_id IS NULL))
);