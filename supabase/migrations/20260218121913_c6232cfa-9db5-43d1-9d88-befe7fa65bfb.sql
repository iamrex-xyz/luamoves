-- Allow admins to read all tasks for counting completed tasks
CREATE POLICY "Admins can view all tasks"
ON public.tasks
FOR SELECT
USING (is_admin_by_email());