-- Add energy-related fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS energy_current_supplier TEXT,
ADD COLUMN IF NOT EXISTS energy_connection_type TEXT;