-- Add fragile items field to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_fragile_items text;