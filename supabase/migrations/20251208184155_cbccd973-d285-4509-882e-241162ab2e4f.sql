-- Drop the security definer view and recreate with security invoker
DROP VIEW IF EXISTS public.public_profiles;

-- Create view with SECURITY INVOKER (default, but explicit is better)
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT id, full_name
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;