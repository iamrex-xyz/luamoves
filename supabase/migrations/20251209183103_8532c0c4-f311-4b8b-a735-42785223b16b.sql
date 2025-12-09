-- Voeg nieuwe personalisatie velden toe aan profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS housing_property_type text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_garden boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_parking boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_vve boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS current_housing_situation text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS has_job boolean DEFAULT true;

-- Commentaar voor duidelijkheid:
-- housing_property_type: 'apartment' | 'house' | 'studio'
-- current_housing_situation: 'rent' | 'buy' | 'parents' | 'other'
-- has_job: of ze een werkgever hebben om te informeren