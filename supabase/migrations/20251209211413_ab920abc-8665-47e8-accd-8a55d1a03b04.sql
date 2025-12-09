-- Add missing profile fields for smart questions system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_gas text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_smart_meter text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS glasvezel text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS works_from_home text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS building_access text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS insurance_value text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS building_year text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS garden_size text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS children_ages text DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.has_gas IS 'yes, no, or null';
COMMENT ON COLUMN public.profiles.has_smart_meter IS 'yes, no, unknown, or null';
COMMENT ON COLUMN public.profiles.glasvezel IS 'yes, no, unknown, or null';
COMMENT ON COLUMN public.profiles.works_from_home IS 'yes, sometimes, no, or null';
COMMENT ON COLUMN public.profiles.building_access IS 'easy, medium, hard, or null';
COMMENT ON COLUMN public.profiles.insurance_value IS 'low, medium, high, or null';
COMMENT ON COLUMN public.profiles.building_year IS 'new, recent, older, unknown, or null';
COMMENT ON COLUMN public.profiles.garden_size IS 'small, medium, large, or null';
COMMENT ON COLUMN public.profiles.children_ages IS 'Free text, e.g. 4, 7, 12';