-- Add assigned_by column to track who made the assignment
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES auth.users(id);

-- Add assigned_at column to track when the assignment was made
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone;