-- Add forwarding service fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS forwarding_start_date date,
ADD COLUMN IF NOT EXISTS forwarding_duration text,
ADD COLUMN IF NOT EXISTS household_names text[];