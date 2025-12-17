-- Add municipality field to profiles for parking/lift permits
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS municipality text;