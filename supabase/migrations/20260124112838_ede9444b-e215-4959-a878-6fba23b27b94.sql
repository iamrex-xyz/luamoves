-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (bypasses RLS, prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: users can only view their own role
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- RLS policy: only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create a view for admin to fetch all profiles (security invoker)
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
WHERE public.has_role(auth.uid(), 'admin');

-- Grant select on view to authenticated users (the view itself checks admin role)
GRANT SELECT ON public.admin_profiles_view TO authenticated;