-- Add energy estimated usage field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS energy_estimated_gas INTEGER NULL,
ADD COLUMN IF NOT EXISTS energy_estimated_electricity INTEGER NULL;