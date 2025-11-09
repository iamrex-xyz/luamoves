-- Drop the insecure view
DROP VIEW IF EXISTS task_assignees;

-- Create a security definer function to get assignee email safely
CREATE OR REPLACE FUNCTION public.get_assignee_email(assignee_user_id UUID, assignee_email_fallback TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT email FROM auth.users WHERE id = assignee_user_id),
    assignee_email_fallback
  );
$$;