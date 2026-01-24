-- Drop the old view
DROP VIEW IF EXISTS public.admin_profiles_view;

-- Create helper function to check if user is admin by email domain
CREATE OR REPLACE FUNCTION public.is_admin_by_email()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND (
        email LIKE '%@lua.nl'
        OR email LIKE '%@luamoves.nl'
      )
  )
  OR public.has_role(auth.uid(), 'admin')
$$;

-- Recreate the view using the combined admin check
CREATE VIEW public.admin_profiles_view
WITH (security_invoker = off)
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
  p.renovation_start_date,
  p.moving_budget,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE public.is_admin_by_email();

-- Grant select on view to authenticated users
GRANT SELECT ON public.admin_profiles_view TO authenticated;