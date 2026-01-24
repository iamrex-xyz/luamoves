-- Add missing intake columns to profiles table

-- Hypotheek intake fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hypotheek_koopsom integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hypotheek_werksituatie text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hypotheek_heeft_partner text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hypotheek_doel text;

-- Notaris intake fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notaris_dienst text;

-- Taxatie intake fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS taxatie_doel text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS taxatie_voorkeursdatum date;

-- Slotcilinder intake fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slot_aantal_deuren text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slot_veiligheidsniveau text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slot_montage text;

-- Verhuislift intake fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verhuislift_locatie text;

-- Bouwkundige keuring intake fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bouwkundige_keuring_voorkeursdatum date;

-- Update admin_profiles_view to include new columns
DROP VIEW IF EXISTS public.admin_profiles_view;

CREATE VIEW public.admin_profiles_view
WITH (security_invoker=off)
AS
SELECT
  p.id,
  p.user_id,
  p.phone,
  p.old_address,
  p.new_address,
  p.moving_date,
  p.key_handover_date,
  p.moving_type,
  p.renovation_type,
  p.needs_contractor_help,
  p.housing_property_type,
  p.has_garden,
  p.has_parking,
  p.is_vve,
  p.current_housing_situation,
  p.has_job,
  p.adults,
  p.children,
  p.pets,
  p.has_gas,
  p.has_smart_meter,
  p.glasvezel,
  p.works_from_home,
  p.building_access,
  p.insurance_value,
  p.building_year,
  p.garden_size,
  p.children_ages,
  p.energy_current_supplier,
  p.energy_connection_type,
  p.has_fiber,
  p.internet_speed_preference,
  p.internet_bundle,
  p.floor_level,
  p.has_elevator,
  p.number_of_rooms,
  p.special_items,
  p.has_fragile_items,
  p.home_size_m2,
  p.forwarding_start_date,
  p.forwarding_duration,
  p.household_names,
  p.municipality,
  p.service_type,
  p.preferred_service_date,
  p.number_of_floors,
  p.number_of_bedrooms,
  p.garden_service_type,
  p.renovation_budget,
  p.moving_budget,
  p.renovation_start_date,
  -- New intake fields
  p.hypotheek_koopsom,
  p.hypotheek_werksituatie,
  p.hypotheek_heeft_partner,
  p.hypotheek_doel,
  p.notaris_dienst,
  p.taxatie_doel,
  p.taxatie_voorkeursdatum,
  p.slot_aantal_deuren,
  p.slot_veiligheidsniveau,
  p.slot_montage,
  p.verhuislift_locatie,
  p.bouwkundige_keuring_voorkeursdatum,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE public.is_admin_by_email();