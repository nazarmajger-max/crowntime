-- Update reviews foreign key to reference profiles instead of auth.users
ALTER TABLE public.reviews 
DROP CONSTRAINT reviews_user_id_fkey;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;