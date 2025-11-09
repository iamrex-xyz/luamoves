-- Add notes column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN notes TEXT;

-- Add notes column to custom_tasks table
ALTER TABLE public.custom_tasks 
ADD COLUMN notes TEXT;

COMMENT ON COLUMN public.tasks.notes IS 'User notes and comments for the task';
COMMENT ON COLUMN public.custom_tasks.notes IS 'User notes and comments for the custom task';