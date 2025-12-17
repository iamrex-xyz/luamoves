-- Add smoke detector related fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS number_of_floors text,
ADD COLUMN IF NOT EXISTS number_of_bedrooms text;