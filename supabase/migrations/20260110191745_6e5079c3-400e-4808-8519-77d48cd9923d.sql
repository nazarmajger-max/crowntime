-- Create an atomic stock reservation function that prevents race conditions
-- This function atomically decrements stock and returns success/failure
CREATE OR REPLACE FUNCTION public.reserve_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_updated_rows INTEGER;
BEGIN
  -- Atomic update: only succeeds if stock is sufficient
  UPDATE products
  SET stock_quantity = stock_quantity - p_quantity,
      updated_at = now()
  WHERE id = p_product_id
    AND stock_quantity >= p_quantity
    AND is_active = true;
  
  GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
  
  -- Return true if update succeeded (stock was sufficient)
  RETURN v_updated_rows > 0;
END;
$$;

-- Create a function to rollback stock reservation if order fails
CREATE OR REPLACE FUNCTION public.rollback_stock_reservation(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity + p_quantity,
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;