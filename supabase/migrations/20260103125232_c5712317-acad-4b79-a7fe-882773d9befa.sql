-- Update the rating constraint from 1-10 to 1-5
ALTER TABLE public.moving_company_feedback DROP CONSTRAINT IF EXISTS moving_company_feedback_rating_check;
ALTER TABLE public.moving_company_feedback ADD CONSTRAINT moving_company_feedback_rating_check CHECK (rating >= 1 AND rating <= 5);