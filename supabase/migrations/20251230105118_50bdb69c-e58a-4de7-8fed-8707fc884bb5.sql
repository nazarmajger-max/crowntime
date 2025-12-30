-- Fix guest checkout after removing guest_email requirement

-- Orders: allow INSERT for authenticated users (their own) and anon guests (user_id null)
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;
CREATE POLICY "Users and guests can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  ((auth.uid() IS NOT NULL) AND (auth.uid() = user_id))
  OR
  ((auth.uid() IS NULL) AND (user_id IS NULL))
);

-- Order items: allow INSERT when the parent order belongs to the authed user OR is a guest order (user_id null)
DROP POLICY IF EXISTS "Users and guests can create order items" ON public.order_items;
CREATE POLICY "Users and guests can create order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND (
        (orders.user_id = auth.uid())
        OR (orders.user_id IS NULL)
      )
  )
);