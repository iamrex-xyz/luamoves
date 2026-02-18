-- Fix 1: Drop unused get_assignee_email function (SECURITY DEFINER bypass risk)
DROP FUNCTION IF EXISTS public.get_assignee_email(uuid, text);

-- Fix 2: Restrict anonymous feedback inserts to authenticated users
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.soft_launch_feedback;
CREATE POLICY "Authenticated users can submit feedback"
ON public.soft_launch_feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);