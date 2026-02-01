-- Create soft launch feedback table
CREATE TABLE public.soft_launch_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id TEXT,
  feedback_text TEXT NOT NULL,
  category TEXT,
  page_or_flow TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.soft_launch_feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone (authenticated or not) to insert feedback
CREATE POLICY "Anyone can submit feedback"
ON public.soft_launch_feedback
FOR INSERT
WITH CHECK (true);

-- Only admins can view feedback
CREATE POLICY "Admins can view all feedback"
ON public.soft_launch_feedback
FOR SELECT
USING (public.is_admin_by_email());

-- Add comment for clarity
COMMENT ON TABLE public.soft_launch_feedback IS 'Feedback (Soft Launch) - User feedback collected during soft launch phase';