-- Add moving budget column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS moving_budget INTEGER;