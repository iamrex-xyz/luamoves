-- Add moving info columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN old_address TEXT,
ADD COLUMN new_address TEXT,
ADD COLUMN moving_date DATE,
ADD COLUMN key_handover_date DATE,
ADD COLUMN moving_type TEXT CHECK (moving_type IN ('buy', 'rent'));