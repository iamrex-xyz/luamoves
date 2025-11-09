-- Add household_type column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN household_type text CHECK (household_type IN ('partner', 'housemates')) DEFAULT 'partner';