-- Add renovation fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN renovation_type text CHECK (renovation_type IN ('none', 'small', 'large')),
ADD COLUMN needs_contractor_help boolean DEFAULT false;