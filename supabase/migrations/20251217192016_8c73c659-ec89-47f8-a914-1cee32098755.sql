-- Add garden service type field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS garden_service_type text;