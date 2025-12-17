-- Add service fields to profiles for cleaning/painting
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS service_type text,
ADD COLUMN IF NOT EXISTS preferred_service_date date;