-- Add internet-related fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_fiber text,
ADD COLUMN IF NOT EXISTS internet_speed_preference text,
ADD COLUMN IF NOT EXISTS internet_bundle text;