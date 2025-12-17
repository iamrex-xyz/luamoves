-- Add renovation fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS renovation_budget text,
ADD COLUMN IF NOT EXISTS renovation_start_date date;