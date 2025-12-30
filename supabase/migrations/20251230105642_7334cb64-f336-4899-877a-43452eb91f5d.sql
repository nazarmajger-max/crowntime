-- RLS fix: some anon JWTs may still have a non-null auth.uid(); use auth.role() to detect guests reliably.

-- Orders INSERT
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;
CREATE POLICY "Users and guests can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Logged-in users can create orders for themselves
  (auth.role() = 'authenticated' AND auth.uid() = user_id)
  OR
  -- Guests (anon) can create orders (no user_id)
  (auth.role() = 'anon' AND user_id IS NULL)
);

-- Order items INSERT
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
        (auth.role() = 'authenticated' AND orders.user_id = auth.uid())
        OR (auth.role() = 'anon' AND orders.user_id IS NULL)
      )
  )
);