-- Make guest checkout robust: allow inserts when user_id is NULL (guest) OR equals auth.uid() (logged-in)

-- Orders INSERT
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;
CREATE POLICY "Users and guests can create orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (user_id IS NULL) OR (auth.uid() = user_id)
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
      AND ((orders.user_id IS NULL) OR (orders.user_id = auth.uid()))
  )
);