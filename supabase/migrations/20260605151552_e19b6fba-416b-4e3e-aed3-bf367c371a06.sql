
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin_by_email() FROM authenticated;
-- merge_anonymous_to_user is invoked by signed-in users after login to merge their guest data, so it must remain executable for authenticated.
