-- Add pet_types column to profiles table to store specific animal types
ALTER TABLE public.profiles 
ADD COLUMN pet_types TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.profiles.pet_types IS 'Array of specific pet types (e.g., dog, cat, bird, fish, etc.)';