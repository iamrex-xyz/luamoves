
-- Drop the foreign key constraint on profiles.user_id so anonymous profiles can be created
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
