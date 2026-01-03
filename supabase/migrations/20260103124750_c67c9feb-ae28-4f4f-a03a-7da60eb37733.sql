-- Create table for moving company feedback
CREATE TABLE public.moving_company_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  explanation TEXT NOT NULL,
  moving_company_name TEXT,
  moving_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.moving_company_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
ON public.moving_company_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
ON public.moving_company_feedback
FOR SELECT
USING (auth.uid() = user_id);

-- Add index for querying by user
CREATE INDEX idx_moving_feedback_user_id ON public.moving_company_feedback(user_id);

-- Add index for analytics queries
CREATE INDEX idx_moving_feedback_rating ON public.moving_company_feedback(rating);