-- Fix persistent checkout RLS: apply INSERT policies to all roles (public) while keeping safe checks

DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;
CREATE POLICY "Users and guests can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  (user_id IS NULL) OR (auth.uid() = user_id)
);

DROP POLICY IF EXISTS "Users and guests can create order items" ON public.order_items;
CREATE POLICY "Users and guests can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND ((orders.user_id IS NULL) OR (orders.user_id = auth.uid()))
  )
);