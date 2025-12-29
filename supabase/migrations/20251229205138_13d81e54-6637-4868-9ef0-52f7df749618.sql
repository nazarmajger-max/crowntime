-- Fix PUBLIC_DATA_EXPOSURE: Revoke anonymous access to public_profiles view
-- This prevents user enumeration attacks from unauthenticated users

REVOKE SELECT ON public.public_profiles FROM anon;

-- Now only authenticated users can query user names for reviews