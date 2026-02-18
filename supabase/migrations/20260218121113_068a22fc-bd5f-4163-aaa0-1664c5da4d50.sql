
-- Add admin SELECT policy so admins can view all profiles via admin_profiles_view
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_admin_by_email());
