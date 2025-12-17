-- Add moving helper fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS floor_level text,
ADD COLUMN IF NOT EXISTS has_elevator text,
ADD COLUMN IF NOT EXISTS number_of_rooms text,
ADD COLUMN IF NOT EXISTS special_items text[] DEFAULT '{}'::text[];