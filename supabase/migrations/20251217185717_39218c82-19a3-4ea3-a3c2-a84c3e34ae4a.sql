-- Add home size field to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS home_size_m2 text;