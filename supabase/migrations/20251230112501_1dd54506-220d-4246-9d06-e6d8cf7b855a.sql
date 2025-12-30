-- Remove the constraint that requires guest_email when user_id is null
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_or_guest_check;