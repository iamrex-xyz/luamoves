
-- 1. Profiles: drop loose insert policy, replace with header-validated guest insert
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Guests can insert their anonymous profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  anonymous_user_id IS NOT NULL
  AND auth.uid() IS NULL
  AND anonymous_user_id = ((current_setting('request.headers'::text, true))::json ->> 'x-anonymous-user-id'::text)
);

-- 2. Tasks: drop loose insert policy, replace with header-validated guest insert
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;

CREATE POLICY "Guests can insert their anonymous tasks"
ON public.tasks
FOR INSERT
WITH CHECK (
  anonymous_user_id IS NOT NULL
  AND auth.uid() IS NULL
  AND anonymous_user_id = ((current_setting('request.headers'::text, true))::json ->> 'x-anonymous-user-id'::text)
);

-- 3. Household members: hide invite_token from regular API readers (edge function uses service role)
REVOKE SELECT (invite_token) ON public.household_members FROM anon, authenticated;

-- 4. Rename misleading moving_tips policy
DROP POLICY IF EXISTS "Anyone can view tips" ON public.moving_tips;
CREATE POLICY "Authenticated users can view tips"
ON public.moving_tips
FOR SELECT
TO authenticated
USING (true);

-- 5. Lock down SECURITY DEFINER functions to least-privilege
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_otps() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_by_email() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.merge_anonymous_to_user(text, uuid) FROM PUBLIC, anon;

-- 6. Realtime: require authentication to subscribe to broadcast/postgres_changes channels.
-- Underlying table RLS still filters which row payloads each user can see.
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can subscribe to realtime" ON realtime.messages;
CREATE POLICY "Authenticated users can subscribe to realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);
