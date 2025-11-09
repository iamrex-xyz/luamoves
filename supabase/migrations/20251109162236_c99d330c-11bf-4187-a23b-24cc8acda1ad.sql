-- Add assigned_to_email column to tasks table for assigning to people without accounts
ALTER TABLE public.tasks ADD COLUMN assigned_to_email TEXT;

-- Add assigned_to_email column to custom_tasks table
ALTER TABLE public.custom_tasks ADD COLUMN assigned_to_email TEXT;

-- Create a view to get assignee information (either from profiles or email)
CREATE OR REPLACE VIEW task_assignees AS
SELECT 
  t.id as task_id,
  t.task_id as task_identifier,
  t.assigned_to,
  t.assigned_to_email,
  p.user_id as assignee_user_id,
  COALESCE(
    (SELECT email FROM auth.users WHERE id = t.assigned_to),
    t.assigned_to_email
  ) as assignee_email
FROM public.tasks t
LEFT JOIN public.profiles p ON t.assigned_to = p.user_id;